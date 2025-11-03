import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <Navbar /> */}
      <main className="container mx-auto px-4 py-8">
      <ContactSection />
      </main>
      <Footer />
    </div>
  );
}