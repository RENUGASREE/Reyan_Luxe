import Footer from "@/components/footer";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ProductReviews } from "@/components/ProductReviews";
import { SEO } from "@/components/SEO";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  badge: string;
  is_signature_piece: boolean;
  stock_quantity: number;
  is_in_stock: boolean;
  is_active: boolean;
  category_slug?: string;
  category_name?: string;
}

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const normalizedCategory = (value?: string | null) => {
    if (!value) return "";
    return value.toLowerCase() === "necklace" ? "Chain" : value;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let response;
        try {
          response = await axios.get(`${API_BASE_URL}/api/bracelets/${productId}/`);
        } catch (braceletError: any) {
          if (braceletError.response && braceletError.response.status === 404) {
            response = await axios.get(`${API_BASE_URL}/api/chains/${productId}/`);
          } else {
            throw braceletError;
          }
        }
        const p: any = response.data;
        setProduct({
          ...p,
          image: p.imageUrl || p.image,
        } as Product);
      } catch (err) {
        setError("Failed to fetch product details.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const addToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to your cart",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!product || !product.is_in_stock || product.stock_quantity < quantity) {
      toast({
        title: "Out of Stock",
        description: "This product is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    setAddingToCart(true);
    try {
      const isChain = (product?.category_name?.toLowerCase()?.includes('chain') || product?.category?.toLowerCase() === 'chain' || product?.category?.toLowerCase() === 'necklace');
      const productType = isChain ? 'chain' : 'bracelet';
      const response = await fetch(`${API_BASE_URL}/api/cart-items/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          product_id: `${productType}-${product.id}`,
          name: product.name,
          price: product.price,
          quantity: quantity,
          image_url: product.image,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success!",
          description: "Product added to cart successfully",
        });
        navigate("/cart");
      } else {
        throw new Error('Failed to add to cart');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add product to cart",
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const addToWishlist = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to add items to wishlist",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    try {
      const isChain = (product?.category_name?.toLowerCase()?.includes('chain') || product?.category?.toLowerCase() === 'chain' || product?.category?.toLowerCase() === 'necklace');
      const productType = isChain ? 'chain' : 'bracelet';
      const response = await fetch(`${API_BASE_URL}/api/wishlist/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          product_type: productType,
          product_id: product!.id,
        }),
      });
      if (response.ok) {
        toast({ title: "Added to Wishlist", description: "You can view it in your wishlist." });
      } else {
        toast({ title: "Error", description: "Failed to add to wishlist", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to add to wishlist", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <>
        <SEO
          title="Loading Product - Reyan Luxe"
          description="Loading product details..."
          image="/logo.png"
          type="product"
          keywords="loading, product, Reyan Luxe"
          canonicalUrl={`http://localhost:5173/Reyan_Luxe/product/${productId}`}
        />
        <div className="min-h-screen bg-background flex flex-col">
          <main className="flex-grow container mx-auto px-4 py-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Loading Product...</h1>
          </main>
          <Footer />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p>{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <p>The product you are looking for does not exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl text-primary-foreground mb-6">₹{product.price}</p>
            <p className="text-lg mb-6">{product.description}</p>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Details:</h2>
              <ul className="list-disc list-inside ml-4">
                <li>Category: {normalizedCategory(product.category)}</li>
                <li>Badge: {product.badge}</li>
                <li>Signature Piece: {product.is_signature_piece ? "Yes" : "No"}</li>
                <li>Stock: {product.is_in_stock ? `${product.stock_quantity} available` : "Out of Stock"}</li>
              </ul>
            </div>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  const isChain = product.category_name?.toLowerCase()?.includes('chain') ?? false;
                  const productType = isChain ? 'chain' : 'bracelet';
                  navigate(`/customize/${productType}/${product.id}`);
                }}
                disabled={!product.is_in_stock}
                className="flex-1"
              >
                Customize This Product
              </Button>
              <Button
                variant="outline"
                onClick={addToWishlist}
                className="flex-1"
              >
                Add to Wishlist
              </Button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                variant="outline"
                disabled={!product.is_in_stock}
              >
                -
              </Button>
              <span className="text-xl">{quantity}</span>
              <Button
                onClick={() => setQuantity(quantity + 1)}
                variant="outline"
                disabled={!product.is_in_stock || quantity >= product.stock_quantity}
              >
                +
              </Button>
              <Button
                className="ml-4"
                onClick={addToCart}
                disabled={!product.is_in_stock || addingToCart}
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </Button>
            </div>
            {!product.is_in_stock && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                This product is currently out of stock
              </div>
            )}
          </div>
        </div>
      </main>
      <div className="container mx-auto px-4 py-8">
        <ProductReviews productType={(product.category?.toLowerCase() === 'chain' || product.category?.toLowerCase() === 'necklace' || (product.category_name?.toLowerCase()?.includes('chain') ?? false)) ? 'chain' : 'bracelet'} productId={parseInt(productId!)} productName={product.name} />
      </div>
      <Footer />
    </div>
  );
}