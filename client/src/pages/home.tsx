import Navbar from "@/components/navbar";
import HeroSection from "@/components/hero-section";
import CollectionSection from "@/components/collection-section";
import AboutSection from "@/components/about-section";
import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <CollectionSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
