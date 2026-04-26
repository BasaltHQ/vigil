import Navigation from "../components/Navigation";
import { ConversationProvider } from "@/app/contexts/ConversationContext";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { thirdwebAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get("thirdweb_auth_token")?.value;
  
  if (!token) {
    redirect('/login');
  }

  const authResult = await thirdwebAuth.verifyJWT({ jwt: token });

  if (!authResult.valid || !authResult.parsedJWT.sub) {
    redirect('/login');
  }

  const profile = await prisma.profile.findUnique({ where: { id: authResult.parsedJWT.sub } });
  
  if (profile && !profile.onboardingComplete) {
    redirect("/onboarding");
  }

  return (
    <ConversationProvider>
      <div className="h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </ConversationProvider>
  );
}
