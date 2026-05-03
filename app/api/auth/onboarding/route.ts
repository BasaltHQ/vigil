import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { thirdwebAuth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("thirdweb_auth_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const authResult = await thirdwebAuth.verifyJWT({ jwt: token });
    if (!authResult.valid || !authResult.parsedJWT.sub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const address = authResult.parsedJWT.sub;
    const body = await req.json();
    const { email, displayName } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email is already taken by someone else (likely from Supabase migration)
    const existingEmail = await prisma.profile.findFirst({
      where: { email, id: { not: address } }
    });

    if (existingEmail) {
      // Migrate the old user's data to the new Thirdweb address
      await prisma.conversation.updateMany({
        where: { userId: existingEmail.id },
        data: { userId: address }
      });
      await prisma.document.updateMany({
        where: { userId: existingEmail.id },
        data: { userId: address }
      });
      await prisma.tokenUsage.updateMany({
        where: { userId: existingEmail.id },
        data: { userId: address }
      });

      // Update the new profile with the old profile's attributes
      await prisma.profile.update({
        where: { id: address },
        data: {
          email: email,
          displayName: displayName || existingEmail.displayName,
          role: existingEmail.role,
          status: existingEmail.status,
          companyUrl: existingEmail.companyUrl,
          companyName: existingEmail.companyName,
          baseTemplate: existingEmail.baseTemplate,
          docIdTemplate: existingEmail.docIdTemplate,
          docIdCounter: existingEmail.docIdCounter,
          onboardingComplete: true
        }
      });

      // Delete the old Supabase profile
      await prisma.profile.delete({ where: { id: existingEmail.id } });

      return NextResponse.json({ success: true, migrated: true });
    }

    await prisma.profile.upsert({
      where: { id: address },
      update: {
        email,
        displayName: displayName || null,
        onboardingComplete: true
      },
      create: {
        id: address,
        email,
        displayName: displayName || null,
        onboardingComplete: true,
        status: 'active', // Because they came from BasaltHQ cookie
        tier: 'starter',
        role: 'client'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Onboarding API Error]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
