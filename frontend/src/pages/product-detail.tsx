import Footer from "@/components/footer";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "@/lib/queryClient";

interface Bracelet {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  badge: string;
  is_signature_piece: boolean;
}

interface Product {
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

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState<Bracelet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/bracelets/${productId}/`);
        const p: any = response.data;
        setProduct({
          ...p,
          image: p.imageUrl || p.image,
        } as Bracelet);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Loading Product...</h1>
        </main>
        <Footer />
      </div>
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
              src={product.image_url || product.image_upload}
              alt={product.name}
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
            <p className="text-2xl text-primary-foreground mb-6">
              ₹{product.price}
            </p>
            <p className="text-lg mb-6">{product.description}</p>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Details:</h2>
              <ul className="list-disc list-inside ml-4">
                <li>Category: {product.category}</li>
                <li>Badge: {product.badge}</li>
                <li>Signature Piece: {product.is_signature_piece ? "Yes" : "No"}</li>
              </ul>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                variant="outline"
              >
                -
              </Button>
              <span className="text-xl">{quantity}</span>
              <Button onClick={() => setQuantity(quantity + 1)} variant="outline">
                +
              </Button>
              <Button className="ml-4">Add to Cart</Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}