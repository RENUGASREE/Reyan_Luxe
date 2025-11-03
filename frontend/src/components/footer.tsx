import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-secondary border-t border-primary/20 py-8">
      <motion.div
        className="max-w-6xl mx-auto px-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-2xl font-playfair font-bold text-foreground mb-4" data-testid="footer-logo">
          <span className="text-foreground">Re</span>
          <span className="text-primary">yan</span>{" "}
          <span className="text-primary">Luxe</span>
        </div>
        <p className="text-background/70 mb-4" data-testid="footer-tagline">
          Refined Adornment. Uncompromising Elegance.
        </p>
        <p className="text-background/50 text-sm" data-testid="footer-copyright">
          © 2024 Reyan Luxe. All rights reserved.
        </p>
      </motion.div>
    </footer>
  );
}
