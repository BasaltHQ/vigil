import { SuiteHero } from "../components/landing/suite-hero";
import { ProductShowcase } from "../components/landing/product-showcase";
import { AboutSection } from "../components/landing/about";
import { CTASection } from "../components/landing/cta-section";
import { NeuromimeticSlideshow } from "../components/landing/neuromimetic-slideshow";
import { OntologyExplainer } from "../components/landing/ontology-explainer";
import { SwarmConstellation } from "../components/landing/swarm-constellation";
import { Footer } from "../components/landing/footer";

export default function Home() {
  return (
    <div className="min-h-screen scroll-smooth font-vox">
      <SuiteHero />
      <NeuromimeticSlideshow />
      <OntologyExplainer />
      <SwarmConstellation />
      <ProductShowcase />
      <AboutSection />
      <CTASection />
      <Footer />
    </div>
  );
}
