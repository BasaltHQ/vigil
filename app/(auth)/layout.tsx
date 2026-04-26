import { Navbar } from "../components/landing/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Authenticate to access your BasaltVigil legal AI console. Secure Web3-native login.",
  openGraph: {
    title: "Sign In — BasaltVigil",
    description: "Access your legal AI swarm console. Secure, Web3-native authentication.",
    images: [{ url: "/api/og?title=Secure%20Authentication&subtitle=Web3-Native%20Login", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign In — BasaltVigil",
    description: "Authenticate to access your AI legal operations console.",
    images: ["/api/og?title=Secure%20Authentication&subtitle=Web3-Native%20Login"],
  },
  robots: { index: false, follow: false },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen flex items-center justify-center p-4 pt-24 font-vox">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </>
  );
}
