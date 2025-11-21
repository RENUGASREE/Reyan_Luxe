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
import { useNavigate, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

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
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

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
    { value: "signature_trending", label: "Trending" },
    { value: "signature_none", label: "General" },
  ];

  // Handle URL parameters for filtering
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    if (filterParam === 'signature') {
      setFilterCategory('signature');
      setFilterLabel('Customer Favorites');
    }
  }, [location.search]);

  // Fetch wishlist items
  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const res = await axios.get(`${API_BASE_URL}/api/wishlist/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setWishlistItems(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch wishlist:', error);
    }
  };

  // Add to wishlist
  const addToWishlist = async (productId, productType) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      const response = await fetch(`${API_BASE_URL}/api/wishlist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          product_type: productType,
        }),
      });

      if (response.ok) {
        fetchWishlist(); // Refresh wishlist
      } else {
        console.error('Wishlist error:', await response.text());
      }
    } catch (error) {
      console.error('Failed to add to wishlist:', error);
    }
  };

  // Remove from wishlist
  const removeFromWishlist = async (wishlistId) => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await axios.delete(`${API_BASE_URL}/api/wishlist/${wishlistId}/`, {
          headers: { Authorization: `Token ${token}` },
        });
        fetchWishlist(); // Refresh wishlist
      }
    } catch (error) {
      console.error('Failed to remove from wishlist:', error);
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId, productType) => {
    return wishlistItems.some(item => 
      item.product_id === productId && item.product_type === productType
    );
  };

  // Get wishlist ID for a product
  const getWishlistId = (productId, productType) => {
    const item = wishlistItems.find(item => 
      item.product_id === productId && item.product_type === productType
    );
    return item ? item.id : null;
  };

  // Add to cart
  const addToCart = async (productId, productType, productName, productPrice, productImage) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }
      
      // Use the same format as the existing cart functionality
      const response = await fetch(`${API_BASE_URL}/api/cart-items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`,
        },
        body: JSON.stringify({
          product_id: `${productType}-${productId}`,
          name: productName,
          price: productPrice,
          quantity: 1,
          image_url: productImage,
        }),
      });

      if (response.ok) {
        alert('Item added to cart!');
      } else {
        const errorData = await response.json();
        console.error('Cart error:', errorData);
        alert('Failed to add to cart. Please try again.');
      }
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart. Please try again.');
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("Fetching products from API:", API_BASE_URL);
        const braceletsRes = await axios.get(`${API_BASE_URL}/api/bracelets/`);
        console.log("Bracelets fetched successfully:", braceletsRes.data.length);
        const chainsRes = await axios.get(`${API_BASE_URL}/api/chains/`);
        console.log("Chains fetched successfully:", chainsRes.data.length);

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
        console.error("Error fetching products:", err);
        setError(err);
        const fallbackProducts = [
          {
            id: "bracelet-101",
            api_id: 101,
            name: "Aurora Gold Bracelet",
            description: "Elegant gold bracelet with minimalist design",
            price: "3999",
            imageUrl: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: true,
            signature_category: "fashion",
            category: "Bracelet",
            category_slug: "gold_bracelets",
            category_name: "Gold Bracelets",
          },
          {
            id: "bracelet-102",
            api_id: 102,
            name: "Crystal Luxe Bracelet",
            description: "Handmade crystal bracelet for refined style",
            price: "2999",
            imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: true,
            signature_category: "trending",
            category: "Bracelet",
            category_slug: "crystal_bracelets",
            category_name: "Crystal Bracelets",
          },
          {
            id: "chain-201",
            api_id: 201,
            name: "Rope Chain Necklace",
            description: "Classic rope chain with polished finish",
            price: "4999",
            imageUrl: "https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: false,
            signature_category: null,
            category: "Chain",
            category_slug: "rope_chain",
            category_name: "Rope Chain",
          },
          {
            id: "chain-202",
            api_id: 202,
            name: "Figaro Chain Necklace",
            description: "Premium figaro chain for everyday wear",
            price: "4599",
            imageUrl: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: false,
            signature_category: null,
            category: "Chain",
            category_slug: "figaro_chain",
            category_name: "Figaro Chain",
          },
          {
            id: "bracelet-103",
            api_id: 103,
            name: "Galaxy Charm Bracelet",
            description: "Celestial charm bracelet with star accents",
            price: "3499",
            imageUrl: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: true,
            signature_category: "fashion",
            category: "Bracelet",
            category_slug: "charm_bracelets",
            category_name: "Charm Bracelets",
          },
          {
            id: "bracelet-104",
            api_id: 104,
            name: "Couple Minimalist Bracelets",
            description: "Matching minimalist bracelets for couples",
            price: "3999",
            imageUrl: "https://images.unsplash.com/photo-1523294575204-2b6c2a49f9b2?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: true,
            signature_category: "trending",
            category: "Bracelet",
            category_slug: "couple_bracelets",
            category_name: "Couple Bracelets",
          },
          {
            id: "bracelet-105",
            api_id: 105,
            name: "Handmade Gemstone Bracelet",
            description: "Artisan bracelet with onyx and crystal gems",
            price: "3299",
            imageUrl: "https://images.unsplash.com/photo-1608041789771-3c0a3f1a371f?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: false,
            signature_category: null,
            category: "Bracelet",
            category_slug: "gemstone_bracelets",
            category_name: "Gemstone Bracelets",
          },
          {
            id: "chain-203",
            api_id: 203,
            name: "Cuban Chain Necklace",
            description: "Bold cuban chain with premium finish",
            price: "5599",
            imageUrl: "https://images.unsplash.com/photo-1543294001-f7cd6f3e62b0?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: false,
            signature_category: null,
            category: "Chain",
            category_slug: "cuban_chain",
            category_name: "Cuban Chain",
          },
          {
            id: "chain-204",
            api_id: 204,
            name: "Classic Gold Chain",
            description: "Timeless gold chain for everyday elegance",
            price: "6499",
            imageUrl: "https://images.unsplash.com/photo-1622062492192-0eafc2238ed6?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: false,
            signature_category: null,
            category: "Chain",
            category_slug: "gold_chain",
            category_name: "Gold Chain",
          },
          {
            id: "bracelet-106",
            api_id: 106,
            name: "Onyx Signature Bracelet",
            description: "Latest signature onyx bracelet with matte beads",
            price: "3799",
            imageUrl: "https://images.unsplash.com/photo-1522312340740-496f6d136cc3?auto=format&fit=crop&w=1200&q=60",
            is_signature_piece: true,
            signature_category: "latest",
            category: "Bracelet",
            category_slug: "fashion_bracelets",
            category_name: "Fashion Bracelets",
          },
        ];
        setAllProducts(fallbackProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filterCategory]);

  useEffect(() => {
    fetchWishlist(); // Fetch wishlist items when component loads
    
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories/`);
        const cats = res.data || [];
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
        setBraceletCategories([
          { slug: "gold_bracelets", name: "Gold Bracelets" },
          { slug: "crystal_bracelets", name: "Crystal Bracelets" },
          { slug: "fashion_bracelets", name: "Fashion Bracelets" },
          { slug: "charm_bracelets", name: "Charm Bracelets" },
          { slug: "couple_bracelets", name: "Couple Bracelets" },
          { slug: "gemstone_bracelets", name: "Gemstone Bracelets" },
        ] as any);
        setChainCategories([
          { slug: "rope_chain", name: "Rope Chain" },
          { slug: "figaro_chain", name: "Figaro Chain" },
          { slug: "cuban_chain", name: "Cuban Chain" },
          { slug: "gold_chain", name: "Gold Chain" },
        ] as any);
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
      case "signature_none":
        return product.is_signature_piece === true && (product.signature_category === null || product.signature_category === "");
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

  // Debug: Log products being displayed
  useEffect(() => {
    console.log(`Total products: ${allProducts.length}, Filtered products: ${filteredProducts.length}`);
    console.log("All products summary:", filteredProducts.map(p => ({id: p.id, api_id: p.api_id, name: p.name, price: p.price, category: p.category})));
    
    // Check for duplicates by ID
    const ids = filteredProducts.map(p => p.id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicates.length > 0) {
      console.log("Duplicate IDs found:", duplicates);
    } else {
      console.log("No duplicate IDs found - all products are unique");
    }
    
    // Group by name to see if there are name duplicates
    const nameGroups = filteredProducts.reduce((acc, product) => {
      const name = product.name;
      if (!acc[name]) acc[name] = [];
      acc[name].push(product);
      return acc;
    }, {});
    
    const nameDuplicates = Object.entries(nameGroups).filter(([name, products]) => products.length > 1);
    if (nameDuplicates.length > 0) {
      console.log("Products with duplicate names:", nameDuplicates);
    }
  }, [allProducts, filteredProducts]);

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
          {filteredProducts.map((product) => {
            const productType = product.id.startsWith('bracelet') ? 'bracelet' : 'chain';
            const inWishlist = isInWishlist(product.api_id, productType);
            const wishlistId = inWishlist ? getWishlistId(product.api_id, productType) : null;
            
            return (
              <Card key={product.id} className="flex flex-col">
                {/* Debug info */}
                <div className="hidden debug-info" data-product-id={product.id} data-product-name={product.name}>
                  ID: {product.id}, API_ID: {product.api_id}, Name: {product.name}
                </div>
                <CardHeader className="relative">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-md mb-4"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                    onClick={() => {
                      if (inWishlist) {
                        removeFromWishlist(wishlistId);
                      } else {
                        addToWishlist(product.api_id, productType);
                      }
                    }}
                  >
                    <Heart className={`h-5 w-5 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                  </Button>
                  <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col justify-between">
                  <p className="text-lg font-semibold mb-2">₹{product.price}</p>
                  <p className="text-sm text-muted-foreground">
                    Category: {formatCategoryName(product.category, product.category_name)}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1" 
                      onClick={() => navigate(`/product/${product.api_id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => addToCart(product.api_id, productType, product.name, product.price, product.imageUrl)}
                    >
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
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