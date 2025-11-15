import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/footer";
import { SEO } from "@/components/SEO";
import { useNavigate } from "react-router-dom";

const formatCategoryName = (slugOrCategory, categoryName) => {
  if (categoryName) return categoryName;
  if (!slugOrCategory) return "";
  const normalized = String(slugOrCategory);
  if (normalized.toLowerCase() === "necklace") return "Chain";
  return normalized
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterLabel, setFilterLabel] = useState("All Categories");
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [categories, setCategories] = useState([]);
  const [braceletCategories, setBraceletCategories] = useState([]);
  const [chainCategories, setChainCategories] = useState([]);
  const navigate = useNavigate();

  // const braceletSubcategories = [
  //   { value: "all_bracelets", label: "All Bracelets" },
  //   { value: "womens_bracelets", label: "Womens Bracelets" },
  //   { value: "mens_bracelets", label: "Mens Bracelets" },
  //   { value: "armband_bracelets", label: "Armband Bracelets" },
  //   { value: "gold_bracelets", label: "Gold Bracelets" },
  //   { value: "charm_bracelets", label: "Charm Bracelets" },
  //   { value: "couple_bracelets", label: "Couple Bracelets" },
  //   { value: "handmade_bracelets", label: "Handmade Bracelets" },
  //   { value: "gemstone_bracelets", label: "Gemstone Bracelets" },
  //   { value: "crystal_bracelets", label: "Crystal Bracelets" },
  //   { value: "fashion_bracelets", label: "Fashion Bracelets" },
  // ];

  // const chainSubcategories = [
  //   { value: "all_chains", label: "All Chains" },
  //   { value: "cuban_chain", label: "Cuban Chain" },
  //   { value: "rope_chain", label: "Rope Chain" },
  //   { value: "figaro_chain", label: "Figaro Chain" },
  //   { value: "gold_chain", label: "Gold Chain" },
  //   { value: "silver_chain", label: "Silver Chain" },
  // ];

  const signatureSubcategories = [
    { value: "signature_all", label: "All" },
    { value: "signature_fashion", label: "Fashion Bracelets" },
    { value: "signature_trending", label: "Trending Bracelets" },
    { value: "signature_latest", label: "Latest Bracelet" },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const braceletsRes = await axios.get(`${API_BASE_URL}/api/bracelets/`);
        const chainsRes = await axios.get(`${API_BASE_URL}/api/chains/`);

        const fetchedBracelets = (braceletsRes.data as any[]).map((p) => ({
          ...p,
          category: p.category,
          imageUrl: p.imageUrl,
          category_slug: p.category_slug ?? null,
          category_name: p.category_name ?? null,
          id: `bracelet-${p.id}`,
          api_id: p.id,
        }));

        const fetchedChains = (chainsRes.data as any[]).map((p) => ({
          ...p,
          category: p.category,
          imageUrl: p.imageUrl,
          category_slug: p.category_slug ?? null,
          category_name: p.category_name ?? null,
          id: `chain-${p.id}`,
          api_id: p.id,
        }));

        setAllProducts([...fetchedBracelets, ...fetchedChains]);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filterCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories/`);
        const cats = res.data || [];
        // setCategories(cats);
        const braceletCats = cats
          .filter((c) => c.group === "bracelet" && c.show_in_menu)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        setBraceletCategories(braceletCats);
        const chainCats = cats
          .filter((c) => c.group === "chain" && c.show_in_menu)
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
        setChainCategories(chainCats);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  const matchSubcategory = (product, sub) => {
    const name = (product.name || "").toLowerCase();
    switch (sub) {
      case "all_bracelets":
        return product.category === "Bracelet";
      case "womens_bracelets":
        return product.category === "Bracelet" && /women|lady|ladies|girl/.test(name);
      case "mens_bracelets":
        return product.category === "Bracelet" && /men|male|boy|gent/.test(name);
      case "armband_bracelets":
        return product.category === "Bracelet" && name.includes("armband");
      case "gold_bracelets":
        return product.category === "Bracelet" && name.includes("gold");
      case "charm_bracelets":
        return product.category === "Bracelet" && name.includes("charm");
      case "couple_bracelets":
        return product.category === "Bracelet" && /couple|love|pair/.test(name);
      case "handmade_bracelets":
        return product.category === "Bracelet" && /handmade|artisan|crafted/.test(name);
      case "gemstone_bracelets":
        return product.category === "Bracelet" && /(gem|stone|onyx|ruby|emerald|sapphire|diamond)/.test(name);
      case "crystal_bracelets":
        return product.category === "Bracelet" && name.includes("crystal");
      case "fashion_bracelets":
        return product.category === "Bracelet" && /fashion|style|trend/.test(name);
      case "all_chains":
        return product.category === "Necklace" || product.category === "Chain" || name.includes("chain");
      case "cuban_chain":
        return (product.category === "Necklace" || product.category === "Chain" || name.includes("chain")) && name.includes("cuban");
      case "rope_chain":
        return (product.category === "Necklace" || product.category === "Chain" || name.includes("chain")) && name.includes("rope");
      case "figaro_chain":
        return (product.category === "Necklace" || product.category === "Chain" || name.includes("chain")) && name.includes("figaro");
      case "gold_chain":
        return (product.category === "Necklace" || product.category === "Chain" || name.includes("chain")) && name.includes("gold");
      case "silver_chain":
        return (product.category === "Necklace" || product.category === "Chain" || name.includes("chain")) && name.includes("silver");
      case "signature_fashion":
        return product.is_signature_piece === true && product.signature_category === "fashion";
      case "signature_trending":
        return product.is_signature_piece === true && product.signature_category === "trending";
      case "signature_latest":
        return product.is_signature_piece === true && product.signature_category === "latest";
      default:
        return true;
    }
  };

  const matchesCategory = (product) => {
    switch (filterCategory) {
      case "all":
        return true;
      case "signature":
        return product.is_signature_piece === true;
      case "bracelet":
        return product.category === "Bracelet";
      case "chain":
        return product.category === "Necklace" || product.category === "Chain" || (product.name || "").toLowerCase().includes("chain");
      default: {
        if (typeof filterCategory === "string" && filterCategory.startsWith("cat:")) {
          const target = filterCategory.slice(4);
          return product.category_slug === target;
        }
        return matchSubcategory(product, filterCategory);
      }
    }
  };

  const filteredProducts = allProducts.filter((product) => {
    const matchesSearch = (product.name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesSearch && matchesCategory(product);
  });

  if (loading) return <div className="text-center text-xl mt-10">Loading products...</div>;
  if (error) return <div className="text-center text-xl mt-10 text-red-500">Error: {error.message}</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title="Our Products - Reyan Luxe"
        description="Discover our exquisite collection of luxury bracelets and chains. Shop from our curated selection of premium jewelry with customization options."
        keywords="luxury bracelets, chains, custom jewelry, womens bracelets, mens bracelets, gold chains, silver chains"
        url="https://reyanluxe.com/products"
      />
      {/* <Navbar /> */}
      <main className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-5xl font-bold text-center mb-12">Our Products</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="min-w-[180px] justify-between">
                {filterLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuItem onClick={() => { setFilterCategory("all"); setFilterLabel("All Categories"); }}>All Categories</DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Our Signature Pieces</DropdownMenuSubTrigger>
                <DropdownMenuSubContent avoidCollisions={false} sideOffset={10}>
                  {signatureSubcategories.map((item) => (
                    <DropdownMenuItem key={item.value} onClick={() => { setFilterCategory(item.value === "signature_all" ? "signature" : item.value); setFilterLabel(item.label); }}>
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Bracelet</DropdownMenuSubTrigger>
                <DropdownMenuSubContent avoidCollisions={false} sideOffset={10}>
                  <DropdownMenuItem onClick={() => { setFilterCategory("bracelet"); setFilterLabel("Bracelet - All"); }}>
                    All
                  </DropdownMenuItem>
                  {braceletCategories.map((cat) => (
                    <DropdownMenuItem key={cat.slug} onClick={() => { setFilterCategory(`cat:${cat.slug}`); setFilterLabel(cat.name); }}>
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Chain</DropdownMenuSubTrigger>
                <DropdownMenuSubContent avoidCollisions={false} sideOffset={10}>
                  <DropdownMenuItem onClick={() => { setFilterCategory("chain"); setFilterLabel("Chain - All"); }}>
                    All
                  </DropdownMenuItem>
                  {chainCategories.map((cat) => (
                    <DropdownMenuItem key={cat.slug} onClick={() => { setFilterCategory(`cat:${cat.slug}`); setFilterLabel(cat.name); }}>
                      {cat.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => {
            setSearchTerm("");
            setFilterCategory("all");
            setFilterLabel("All Categories");
          }}>Reset Filters</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-lg font-semibold mb-2">₹{product.price}</p>
                <p className="text-sm text-muted-foreground">
                  Category: {formatCategoryName(product.category, product.category_name)}
                </p>
                <Button className="mt-4 w-full" onClick={() => navigate(`/product/${product.api_id}`)}>View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredProducts.length === 0 && !loading && (
          <p className="text-center text-xl mt-10">No products found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}

// interface Product {
//   id: number;
//   name: string;
//   description: string;
//   price: string;
//   imageUrl: string; // Updated field for image URL
//   is_signature_piece: boolean;
//   category: string;
//   signature_category: string;
// }