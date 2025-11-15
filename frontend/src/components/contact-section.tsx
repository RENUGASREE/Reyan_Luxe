// Removed unused and unavailable WhatsappSvg import
import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Instagram, MapPin, Mail, Phone, MessageCircle, Facebook } from "lucide-react";
import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ContactSubmission {
  name: string;
  email: string;
  message: string;
}

export default function ContactSection() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactSubmission>({

    defaultValues: {
      name: "",
      email: "",
      message: ""
    }
  });

  const contactMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Message Sent!",
        description: data.message,
      });
      reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  const newsletterMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/newsletter/subscribe/", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Subscribed!",
        description: data.message,
      });
      setNewsletterEmail("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: ContactSubmission) => {
    contactMutation.mutate(data);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validatedData = { email: newsletterEmail };
    newsletterMutation.mutate(validatedData);
  };

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/reyan.luxe", label: "Instagram" },
    { icon: Facebook, href: "https://www.facebook.com/profile.php?id=61582943545530", label: "Facebook" },
    { icon: MapPin, href: "https://www.pinterest.com/your_profile", label: "Pinterest" },
    { icon: Phone, href: "tel:+919025322098", label: "Call Us" },
    { icon: MessageCircle, href: "https://wa.me/9025322098", label: "WhatsApp" },
  ];

  return (
    <section id="contact" className="py-20 bg-secondary">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4" data-testid="contact-title">
            Let's Connect
          </h2>
          <p className="text-background/70 text-lg">
            We'd love to hear from you. Reach out for custom pieces, collaborations, or just to say hello.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            className="bg-card/10 backdrop-blur-sm rounded-lg p-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-2xl font-playfair font-bold text-foreground mb-6" data-testid="contact-form-title">
              Send us a Message
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" data-testid="contact-form">
              <div>
                <label htmlFor="name" className="block text-foreground font-medium mb-2">
                  Full Name
                </label>
                <Input
                  id="name"
                  {...register("name")}
                  className="w-full px-4 py-3 bg-input border border-primary/30 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pulse-glow"
                  placeholder="Your full name"
                  data-testid="contact-name-input"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-foreground font-medium mb-2">
                  Email Address
                </label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-3 bg-input border border-primary/30 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pulse-glow"
                  placeholder="your@email.com"
                  data-testid="contact-email-input"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-foreground font-medium mb-2">
                  Message
                </label>
                <Textarea
                  id="message"
                  {...register("message")}
                  rows={5}
                  className="w-full px-4 py-3 bg-input border border-primary/30 rounded-lg text-foreground placeholder-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none pulse-glow"
                  placeholder="Tell us about your vision..."
                  data-testid="contact-message-input"
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || contactMutation.isPending}
                className="w-full glow-hover bg-primary text-white py-4 rounded-lg font-medium tracking-wider transition-all duration-300 hover:bg-primary/90"
                data-testid="contact-submit-button"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting || contactMutation.isPending ? "SENDING..." : "SEND MESSAGE"}
              </Button>
            </form>
          </motion.div>

          {/* Social Media & Info */}
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div>
              <h3 className="text-2xl font-playfair font-bold text-foreground mb-6" data-testid="social-title">
                Follow Our Journey
              </h3>
              <p className="text-background/70 text-lg mb-8">
                Stay connected with us on social media for the latest collections, behind-the-scenes content, and styling inspiration.
              </p>
              
              {/* Social Icons */}
              <div className="flex space-x-6">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    className="text-3xl text-primary hover:text-background transition-colors neon-glow"
                    whileHover={{ scale: 1.2, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 400 }}
                    data-testid={`social-link-${social.label.toLowerCase()}`}
                  >
                    <social.icon className="h-8 w-8" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Newsletter Subscription */}
            <motion.div
              className="bg-primary/10 backdrop-blur-sm rounded-lg p-6"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h4 className="text-xl font-playfair font-bold text-foreground mb-4" data-testid="newsletter-title">
                Join Our Newsletter
              </h4>
              <p className="text-background/70 mb-4">
                Be the first to know about new collections and exclusive offers.
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
                <Input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 px-4 py-2 bg-input border border-primary/30 rounded text-foreground placeholder-foreground/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  required
                  data-testid="newsletter-email-input"
                />
                <Button
                  type="submit"
                  disabled={newsletterMutation.isPending}
                  className="glow-hover px-6 py-2 bg-primary text-white rounded font-medium transition-all duration-300 hover:bg-primary/90"
                  data-testid="newsletter-submit-button"
                >
                  {newsletterMutation.isPending ? "..." : "Subscribe"}
                </Button>
              </form>
            </motion.div>

            {/* Contact Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-background/90" data-testid="contact-email">
                <Mail className="h-5 w-5 text-primary" />
                <span>reyanluxe@gmail.com</span>
              </div>
              <div className="flex items-center space-x-4 text-background/90" data-testid="contact-phone">
                <Phone className="h-5 w-5 text-primary" />
                <span>+91 9025322098</span>
              </div>
              <div className="flex items-center space-x-4 text-background/90" data-testid="contact-location">
                <MapPin className="h-5 w-5 text-primary" />
                <span>Tuticorin </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
