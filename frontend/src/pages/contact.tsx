import ContactSection from "@/components/contact-section";
import Footer from "@/components/footer";
import { SEO } from "@/components/SEO";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title="Contact Us - Reyan Luxe"
        description="Get in touch with Reyan Luxe for inquiries about our luxury customized jewelry. Contact us for custom orders, support, and more."
        keywords="contact reyan luxe, jewelry inquiries, custom jewelry contact, luxury jewelry support"
        url="https://reyanluxe.com/contact"
      />
      {/* <Navbar /> */}
      <main className="container mx-auto px-4 py-8">
      <ContactSection />
      </main>
      <Footer />
    </div>
  );
}