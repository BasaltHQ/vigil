import type { Metadata } from "next";
import { Navbar } from "../components/landing/navbar";

export const metadata: Metadata = {
  title: "BasaltVigil | Advanced Legal AI Swarm Intelligence",
  description: "Initialize your Legal Constellation with a living, breathing swarm that thinks, negotiates, and executes at the speed of thought. Experience the future of Agentic Law with BasaltVigil.",
  keywords: ["AI Legal Assistant", "Agentic Law", "Legal Swarm Intelligence", "Contract Automation", "Legal Ops", "BasaltVigil", "document automation", "corporate governance"],
  authors: [{ name: "BasaltHQ", url: "https://basalthq.com" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vigil.basalthq.com",
    siteName: "BasaltVigil",
    title: "BasaltVigil — Initialize Your Legal Constellation",
    description: "A living, breathing AI swarm that thinks, negotiates, and executes at the speed of thought. Fortune 50-grade document drafting, case law research, and autonomous legal operations.",
    images: [
      {
        url: "/api/og?title=Initialize%20Your%20Legal%20Constellation&subtitle=Agentic%20Law%2C%20Redefined",
        width: 1200,
        height: 630,
        alt: "BasaltVigil — Advanced Legal Swarm Intelligence",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BasaltVigil — Agentic Law, Redefined",
    description: "AI swarm intelligence for complex legal workflows. Draft, research, and govern at machine speed.",
    images: ["/api/og?title=Initialize%20Your%20Legal%20Constellation&subtitle=Agentic%20Law%2C%20Redefined"],
    creator: "@BasaltHQ",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}
