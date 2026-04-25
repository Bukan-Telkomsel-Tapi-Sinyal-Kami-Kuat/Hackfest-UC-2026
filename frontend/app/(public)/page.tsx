import { Hero } from "@/components/landing/Hero";
import { ModulePreview } from "@/components/landing/ModulePreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Footer } from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <ModulePreview />
      <HowItWorks />
      <FinalCTA />
      <Footer />
    </>
  );
}
