import { useState } from "react";
import { motion } from "framer-motion";
import { Gem, Heart, Star, Leaf, Moon, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BraceletCard {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string[];
  icon: typeof Gem;
  badge: string;
}

const bracelets: BraceletCard[] = [
  {
    id: 1,
    name: "Obsidian Elegance",
    description: "Handcrafted obsidian beads with rose gold accent",
    price: 149,
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    category: ["beaded"],
    icon: Gem,
    badge: "Premium Collection"
  },
  {
    id: 2,
    name: "The Grace",
    description: "Delicate rose gold chain with curated charms",
    price: 199,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    category: ["charms"],
    icon: Heart,
    badge: "Bestseller"
  },
  {
    id: 3,
    name: "Minimalist Chic",
    description: "Clean lines with subtle sophistication",
    price: 89,
    image: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    category: ["minimal"],
    icon: Star,
    badge: "New Arrival"
  },
  {
    id: 4,
    name: "Earthen Vibes",
    description: "Natural stone beads with earth tones",
    price: 129,
    image: "https://pixabay.com/get/g37654aaac49552584c34efc20e1b4e2b4aa5e915dd7ec08d528e2f9ac417278d5c9299a264bd7485d44212682aa2a63863429a75593dade23a44c94a3fefb21c_1280.jpg",
    category: ["beaded", "limited"],
    icon: Leaf,
    badge: "Limited Edition"
  },
  {
    id: 5,
    name: "Celestial Dreams",
    description: "Vintage-inspired celestial charm collection",
    price: 179,
    image: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600",
    category: ["charms"],
    icon: Moon,
    badge: "Featured"
  },
  {
    id: 6,
    name: "Pure Essence",
    description: "Contemporary design meets timeless appeal",
    price: 119,
    image: "https://pixabay.com/get/gd5e68d5546efe10fbc42d7f51b99e052cacecd8be37c6f6ad30f420cd7cebc5a49f5dab64719b91eca12a584c115d2f7520aad5179579b6acc62fe3f40f17cf5_1280.jpg",
    category: ["minimal"],
    icon: Circle,
    badge: "Modern Classic"
  }
];

const filters = ["all", "beaded", "charms", "limited", "minimal"];

export default function CollectionSection() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredBracelets = bracelets.filter(bracelet => 
    activeFilter === "all" || bracelet.category.includes(activeFilter)
  );

  return (
    <section id="collection" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-playfair font-bold text-background mb-4" data-testid="collection-title">
            Our Signature Pieces
          </h2>
          <p className="text-background/70 text-lg max-w-2xl mx-auto">
            Each bracelet is meticulously handcrafted, embodying our commitment to luxury and artisanal excellence.
          </p>
        </motion.div>

        {/* Filter Buttons */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filters.map((filter) => (
            <Button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              variant={activeFilter === filter ? "default" : "outline"}
              className={`px-6 py-2 border border-primary transition-all glow-hover ${
                activeFilter === filter
                  ? "bg-primary text-white"
                  : "text-primary hover:bg-primary hover:text-white"
              }`}
              data-testid={`filter-${filter}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </Button>
          ))}
        </motion.div>

        {/* Bracelet Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          layout
        >
          {filteredBracelets.map((bracelet, index) => (
            <motion.div
              key={bracelet.id}
              className="card-hover bg-card rounded-lg overflow-hidden relative group"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              layout
              data-testid={`bracelet-card-${bracelet.id}`}
            >
              <div className="relative overflow-hidden">
                <img
                  src={bracelet.image}
                  alt={bracelet.name}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  data-testid={`bracelet-image-${bracelet.id}`}
                />
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {bracelet.badge}
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-playfair font-bold text-card-foreground mb-2" data-testid={`bracelet-name-${bracelet.id}`}>
                  {bracelet.name}
                </h3>
                <p className="text-card-foreground/70 mb-4" data-testid={`bracelet-description-${bracelet.id}`}>
                  {bracelet.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-primary font-bold text-lg" data-testid={`bracelet-price-${bracelet.id}`}>
                    ${bracelet.price}
                  </span>
                  <motion.div
                    className="rotate-charm"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <bracelet.icon className="h-6 w-6 text-primary" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
