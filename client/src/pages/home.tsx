import HeroSection from "@/components/hero-section";
import CollectionSection from "@/components/collection-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import { ScrollReveal } from "@/components/visual-effects";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      
      <ScrollReveal>
        <CollectionSection />
      </ScrollReveal>
      
      <ScrollReveal delay={0.2}>
        <AboutSection />
      </ScrollReveal>
      
      <ScrollReveal delay={0.3}>
        <ContactSection />
      </ScrollReveal>
      
      <ScrollReveal direction="up" delay={0.4}>
        <Footer />
      </ScrollReveal>
    </div>
  );
}
