import HeroSection from "@/components/hero-section";
import CollectionSection from "@/components/collection-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import { ScrollReveal } from "@/components/visual-effects";
import { SEO } from "@/components/SEO";

export default function Home() {
  return (
    <>
      <SEO 
        title="Reyan Luxe - Luxury Customized Jewelry"
        description="Discover exquisite luxury bracelets and chains at Reyan Luxe. Shop online for custom, gemstone, and handmade jewelry designs. Your premier jewelry brand in India."
        keywords="womens bracelets, chains, custom jewelry, luxury bracelets, gemstone jewelry, handmade jewelry, Reyan Luxe, jewelry brand India, online jewelry store, customized jewelry"
        type="website"
      />
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
    </>
  );
}
