import AboutSection from "@/components/about-section";
import Footer from "@/components/footer";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="container mx-auto px-4 py-8">
      <AboutSection />
      </main>
      <Footer />
    </div>
  );
}