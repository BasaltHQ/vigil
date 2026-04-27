import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { thirdwebAuth } from "@/lib/auth";

const COOKIE_DOMAIN = process.env.NODE_ENV === "production" ? ".basalthq.com" : undefined;
export async function GET(req: NextRequest, { params }: { params: Promise<{ thirdweb: string[] }> }) {
  const p = await params;
  const action = p.thirdweb[0];

  if (action === "payload") {
    const url = new URL(req.url);
    const address = url.searchParams.get("address");
    const chainIdStr = url.searchParams.get("chainId");
    const chainId = chainIdStr ? parseInt(chainIdStr, 10) : 8453; // Default to Base

    if (!address) return NextResponse.json({ error: "Missing address" }, { status: 400 });
    const payload = await thirdwebAuth.generatePayload({ address, chainId });
    return NextResponse.json(payload);
  }

  if (action === "is-logged-in") {
    const token = req.cookies.get("thirdweb_auth_token")?.value;
    if (!token) return NextResponse.json(false);
    const authResult = await thirdwebAuth.verifyJWT({ jwt: token });
    if (!authResult.valid || !authResult.parsedJWT.sub) {
      return NextResponse.json(false);
    }
    return NextResponse.json(true);
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ thirdweb: string[] }> }) {
  const p = await params;
  const action = p.thirdweb[0];

  if (action === "login") {
    try {
      const payload = await req.json();
      const verified = await thirdwebAuth.verifyPayload(payload);
      if (!verified.valid) return NextResponse.json({ error: "Invalid payload" }, { status: 401 });
      
      const jwt = await thirdwebAuth.generateJWT({ payload: verified.payload });
      const address = verified.payload.address;

      const existing = await prisma.profile.findUnique({ where: { id: address } });
      if (!existing) {
        const adminExists = await prisma.profile.findFirst({ where: { role: 'admin' } });
        await prisma.profile.create({
          data: {
            id: address,
            email: null,
            role: adminExists ? 'client' : 'admin',
            status: adminExists ? 'pending' : 'active',
            onboardingComplete: false
          }
        });
      }

      const res = NextResponse.json({ success: true });
      res.cookies.set("thirdweb_auth_token", jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
      });
      return res;
    } catch (e: any) {
      return NextResponse.json({ error: e.message }, { status: 500 });
    }
  }

  if (action === "logout") {
    const res = NextResponse.json({ success: true });
    res.cookies.set("thirdweb_auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
      ...(COOKIE_DOMAIN ? { domain: COOKIE_DOMAIN } : {}),
    });
    return res;
  }

  return NextResponse.json({ error: "Not found" }, { status: 404 });
}
