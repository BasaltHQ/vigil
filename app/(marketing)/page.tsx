import BasaltLanding from "../components/basalt-marketing/BasaltLanding";
import { Footer } from "../components/landing/footer";

export default function Home() {
  return <BasaltLanding productId="vigil" footer={<Footer />} />;
}
