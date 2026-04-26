import { Navbar } from "../components/landing/navbar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "BasaltVigil | Authentication",
  description: "Secure login for BasaltVigil Legal AI Constellation.",
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
