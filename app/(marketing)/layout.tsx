import type { Metadata } from "next";
import { Navbar } from "../components/landing/navbar";

export const metadata: Metadata = {
  title: "BasaltVigil | Advanced Legal AI Swarm Intelligence",
  description: "Initialize your Legal Constellation with a living, breathing swarm that thinks, negotiates, and executes at the speed of thought. Experience the future of Agentic Law with BasaltVigil.",
  keywords: ["AI Legal Assistant", "Agentic Law", "Legal Swarm Intelligence", "Contract Automation", "Legal Ops", "BasaltVigil"],
  authors: [{ name: "BasaltHQ" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vigil.basalthq.com",
    siteName: "BasaltVigil",
    title: "BasaltVigil | Advanced Legal AI Swarm Intelligence",
    description: "Initialize your Legal Constellation with a living, breathing swarm that thinks, negotiates, and executes at the speed of thought.",
    images: [
      {
        url: "/Vigil.png",
        width: 1200,
        height: 630,
        alt: "BasaltVigil Shield Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BasaltVigil | Agentic Law",
    description: "The future of Legal Ops. Discover AI Swarm Intelligence for complex legal workflows.",
    images: ["/Vigil.png"],
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
