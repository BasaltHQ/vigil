import type { Metadata } from "next";
import Navigation from "../components/Navigation";
import { ConversationProvider } from "@/app/contexts/ConversationContext";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { thirdwebAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Console",
  description: "BasaltVigil command console — interact with your legal AI swarm constellation. Draft documents, research case law, and orchestrate multi-agent legal workflows.",
  robots: { index: false, follow: false },
};

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
    redirect('/api/auth/logout-redirect');
  }

  const profile = await prisma.profile.findUnique({ where: { id: authResult.parsedJWT.sub } });
  
  if (profile && !profile.onboardingComplete) {
    redirect("/onboarding");
  }

  if (profile && profile.status === 'pending') {
    redirect("/pending");
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
