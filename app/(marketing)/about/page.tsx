import { AboutSection } from "@/app/components/landing/about";
import { Footer } from "@/app/components/landing/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "About | BasaltVigil",
    description: "Learn about the creators of the world's first true agentic legal platform.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-black pt-20">
            <AboutSection />
            <Footer />
        </div>
    )
}
