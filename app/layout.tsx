import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: {
    default: "BasaltVigil — AI Legal Swarm Intelligence",
    template: "%s | BasaltVigil",
  },
  description: "Advanced legal operations platform powered by multi-agent AI swarms. Draft Fortune 50-grade documents, research case law, and manage corporate governance with autonomous specialist agents.",
  metadataBase: new URL("https://vigil.basalthq.com"),
  keywords: [
    "AI legal assistant",
    "legal AI",
    "swarm intelligence",
    "document automation",
    "corporate governance",
    "contract drafting",
    "legal research",
    "BasaltHQ",
    "BasaltVigil",
    "multi-agent AI",
  ],
  authors: [{ name: "BasaltHQ", url: "https://basalthq.com" }],
  creator: "BasaltHQ",
  publisher: "BasaltHQ",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vigil.basalthq.com",
    siteName: "BasaltVigil",
    title: "BasaltVigil — AI Legal Swarm Intelligence",
    description: "Autonomous multi-agent legal operations. Draft documents, research precedent, and manage governance with AI swarm intelligence.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "BasaltVigil — Advanced Legal Swarm Intelligence",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BasaltVigil — AI Legal Swarm Intelligence",
    description: "Autonomous multi-agent legal operations powered by swarm AI. Fortune 50-grade document drafting, case law research, and corporate governance.",
    images: ["/api/og"],
    creator: "@BasaltHQ",
  },
  icons: {
    icon: "/Vigil.png",
    apple: "/Vigil.png",
  },
  manifest: undefined,
  other: {
    "theme-color": "#000000",
    "msapplication-TileColor": "#cc0000",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/eur3bvn.css" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
