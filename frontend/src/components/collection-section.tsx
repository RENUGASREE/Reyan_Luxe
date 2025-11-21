import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gem, Heart, Star, Leaf, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResponsiveContainer } from "@/components/responsive-utils";
import axios from "axios";
import { API_BASE_URL } from "@/lib/queryClient";
import { useNavigate } from "react-router-dom";

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
  signature_category: string;
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
  const dynamicFilters: string[] = ["all", "trending", "none"]; // Show actual signature categories based on data
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        // Fetch both bracelets and chains that are signature pieces
        const [braceletsResponse, chainsResponse] = await Promise.all([
          axios.get<BraceletCard[]>(`${API_BASE_URL}/api/bracelets/`, {
            params: { is_signature_piece: true }
          }),
          axios.get<BraceletCard[]>(`${API_BASE_URL}/api/chains/`, {
            params: { is_signature_piece: true }
          })
        ]);
        
        // Combine and map the data
        const bracelets = braceletsResponse.data.map(item => ({
          ...item,
          product_type: 'bracelet'
        }));
        const chains = chainsResponse.data.map(item => ({
          ...item,
          product_type: 'chain'
        }));
        
        setBracelets([...bracelets, ...chains]);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch signature pieces.");
        console.error(err);
        setLoading(false);
      }
    };

    fetch();
  }, []);

  const filteredBracelets = bracelets.filter((bracelet) => {
    if (activeFilter === "all") return bracelet.is_signature_piece === true;
    return bracelet.is_signature_piece === true && (bracelet.signature_category === activeFilter || (bracelet.signature_category === null && activeFilter === "none"));
  });

  if (loading) {
    return <div className="text-center py-20">Loading favorites...</div>;
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
            Customer Favorites
          </h2>
          <p className="text-background/70 text-lg max-w-2xl mx-auto">
            Discover our most loved pieces, carefully selected by our customers for their exceptional craftsmanship and timeless elegance.
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
              className="card-hover bg-card rounded-lg overflow-hidden relative group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              layout
              data-testid={`bracelet-card-${bracelet.id}`}
              onClick={() => navigate(`/product/${bracelet.id}`)}
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
                  className="text-xl font-playfair font-bold text-card-foreground mb-2 cursor-pointer hover:text-primary transition-colors"
                  data-testid={`bracelet-name-${bracelet.id}`}
                  onClick={(e) => { e.stopPropagation(); navigate(`/product/${bracelet.id}`); }}
                >
                  {bracelet.name}
                </h3>
                <p
                  className="text-card-foreground/70 mb-4 cursor-pointer"
                  data-testid={`bracelet-description-${bracelet.id}`}
                  onClick={(e) => { e.stopPropagation(); navigate(`/product/${bracelet.id}`); }}
                >
                  {bracelet.description}
                </p>
                <div className="flex justify-between items-center">
                  <span
                    className="text-primary font-bold text-lg cursor-pointer"
                    data-testid={`bracelet-price-${bracelet.id}`}
                    onClick={(e) => { e.stopPropagation(); navigate(`/product/${bracelet.id}`); }}
                  >
                    <p className="text-lg font-semibold mt-2">₹{bracelet.price}</p>
                  </span>
                  <motion.div
                    className="rotate-charm cursor-pointer"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    onClick={(e) => { e.stopPropagation(); navigate(`/product/${bracelet.id}`); }}
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

// interface BraceletProps {
//   id: number;
//   name: string;
//   description: string;
//   price: string;
//   image_upload: string; // New field for uploaded image
//   image_url: string; // New field for image URL
//   is_signature_piece: boolean;
//   category: string;
//   signature_category: string;
// }
