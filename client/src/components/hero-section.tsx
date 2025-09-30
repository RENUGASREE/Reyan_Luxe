import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// Define slideshow images
const slideshowImages = [
  "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2340&h=1560",
  "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&h=1560",
  "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&h=1560",
  "https://images.unsplash.com/photo-1617038220319-276d3cfab638?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&h=1560",
  "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&h=1560"
];

export default function HeroSection() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [nextImageIndex, setNextImageIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Handle slideshow transitions
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex(nextImageIndex);
        setNextImageIndex((nextImageIndex + 1) % slideshowImages.length);
        setIsTransitioning(false);
      }, 1000); // Match this with the CSS transition duration
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [nextImageIndex]);

  const scrollToCollection = () => {
    const element = document.getElementById("collection");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="min-h-screen hero-bg flex items-center justify-center relative overflow-hidden">
      {/* Hero Background Images - Current */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center"
        initial={{ opacity: 0.4 }}
        animate={{ 
          opacity: isTransitioning ? 0 : 0.4,
          transition: { duration: 1 }
        }}
        style={{
          backgroundImage: `url('${slideshowImages[currentImageIndex]}')`
        }}
      />
      
      {/* Hero Background Images - Next (preloaded) */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isTransitioning ? 0.4 : 0,
          transition: { duration: 1 }
        }}
        style={{
          backgroundImage: `url('${slideshowImages[nextImageIndex]}')`
        }}
      />
      
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Logo */}
        <motion.h1
          className="text-6xl md:text-8xl font-playfair font-bold mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          data-testid="hero-logo"
        >
          <span className="text-background" style={{ textShadow: '0 0 1px var(--heading-outline-color)' }}>Re</span>
          <span className="text-primary">yan</span>
          <br />
          <span className="text-primary">Luxe</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          className="text-xl md:text-2xl text-cream mb-8 font-light tracking-wide"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
          data-testid="hero-tagline"
        >
          Refined Adornment.
          <br />
          Uncompromising Elegance.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          className="text-center mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.6 }}
        >
          <Button
            onClick={scrollToCollection}
            className="glow-hover px-8 py-4 border-2 border-primary bg-transparent text-primary font-medium tracking-wider hover:bg-primary hover:text-white transition-all duration-300"
            data-testid="hero-cta-button"
          >
            SHOP THE COLLECTION
          </Button>

          {/* Scroll Indicator */}
          <motion.div
            className="mt-8 text-primary cursor-pointer flex justify-center"
            onClick={scrollToCollection}
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            data-testid="scroll-indicator"
          >
            <ChevronDown className="h-8 w-8" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
