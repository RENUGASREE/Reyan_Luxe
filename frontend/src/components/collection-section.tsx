import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gem, Heart, Star, Leaf, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer } from "@/components/responsive-utils";
import axios from "axios";
import { API_BASE_URL } from "@/lib/queryClient";

interface BraceletCard {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string; // Renamed from 'image' to reflect the backend change to a single image URL
  category: string;
  icon: string;
  badge: string;
  is_signature_piece: boolean;
}

const iconMap: { [key: string]: typeof Gem } = {
  Gem: Gem,
  Heart: Heart,
  Star: Star,
  Leaf: Leaf,
  Moon: Moon,
};

const formatCategoryName = (category: string) => {
  if (category === "all") return "All";
  if (category === "trending_bracelets") return "Trending Bracelets";
  if (category === "latest_bracelet") return "Latest Bracelet";
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function CollectionSection() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [bracelets, setBracelets] = useState<BraceletCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dynamicFilters, setDynamicFilters] = useState<string[]>(["all", "fashion_bracelets", "trending_bracelets", "latest_bracelet"]); // Fixed filters

  useEffect(() => {
    const fetchBracelets = async () => {
      try {
        const response = await axios.get<BraceletCard[]>(
          `${API_BASE_URL}/api/bracelets/`,
          { params: { category: activeFilter !== "all" ? activeFilter : undefined } }
        );
        setBracelets(response.data);
      } catch (err) {
        setError("Failed to fetch bracelets.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBracelets();
  }, [activeFilter]);

  const filteredBracelets = bracelets.filter((bracelet) =>
    activeFilter === "all" || bracelet.category === activeFilter
  );

  if (loading) {
    return <div className="text-center py-20">Loading bracelets...</div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-500">Error: {error}</div>;
  }

  return (
    <section id="collection" className="py-20 bg-secondary">
      <ResponsiveContainer className="px-6">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2
            className="text-4xl md:text-5xl font-playfair font-bold text-foreground mb-4"
            data-testid="collection-title"
          >
            Our Signature Pieces
          </h2>
          <p className="text-background/70 text-lg max-w-2xl mx-auto">
            Each bracelet is meticulously handcrafted, embodying our commitment
            to luxury and artisanal excellence.
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
          {dynamicFilters.map((filter) => (
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
              {formatCategoryName(filter)}
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
                  src={bracelet.imageUrl}
                  alt={bracelet.name}
                  className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  data-testid={`bracelet-image-${bracelet.id}`}
                />
                <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {bracelet.badge}
                </div>
              </div>

              <div className="p-6">
                <h3
                  className="text-xl font-playfair font-bold text-card-foreground mb-2"
                  data-testid={`bracelet-name-${bracelet.id}`}
                >
                  {bracelet.name}
                </h3>
                <p
                  className="text-card-foreground/70 mb-4"
                  data-testid={`bracelet-description-${bracelet.id}`}
                >
                  {bracelet.description}
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className="text-primary font-bold text-lg"
                    data-testid={`bracelet-price-${bracelet.id}`}
                  >
                    <p className="text-lg font-semibold mt-2">₹{bracelet.price}</p>
                  </span>
                  <motion.div
                    className="rotate-charm"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {iconMap[bracelet.icon] &&
                      React.createElement(iconMap[bracelet.icon], {
                        className: "h-6 w-6 text-primary",
                      })}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </ResponsiveContainer>
    </section>
  );
}

interface BraceletProps {
  id: number;
  name: string;
  description: string;
  price: string;
  image_upload: string; // New field for uploaded image
  image_url: string; // New field for image URL
  is_signature_piece: boolean;
  category: string;
  signature_category: string;
}
