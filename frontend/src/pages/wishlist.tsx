import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../lib/queryClient";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface WishlistItem {
  id: number;
  product_type: 'bracelet' | 'chain';
  product_id: number;
  created_at: string;
}

interface ProductInfo {
  id: number;
  name: string;
  imageUrl?: string;
  price: string;
}

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await axios.get(`${API_BASE_URL}/api/wishlist/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setItems(res.data as WishlistItem[]);
    } catch (e: any) {
      setError(e.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeItem = async (id: number) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_BASE_URL}/api/wishlist/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {}
  };

  if (loading) return <div className="text-center text-xl mt-10">Loading wishlist...</div>;
  if (error) return <div className="text-center text-xl mt-10 text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-5xl font-bold text-center mb-12">My Wishlist</h1>

        {items.length === 0 ? (
          <div className="text-center">
            <p className="text-xl mb-4">Your wishlist is empty.</p>
            <Button onClick={() => navigate('/products')}>Browse Products</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <WishlistCard key={item.id} item={item} onRemove={removeItem} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

function WishlistCard({ item, onRemove }: { item: WishlistItem; onRemove: (id: number) => void }) {
  const [product, setProduct] = useState<ProductInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/${item.product_type === 'chain' ? 'chains' : 'bracelets'}/${item.product_id}/`);
        setProduct(res.data as ProductInfo);
      } catch {}
    };
    fetchProduct();
  }, [item]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        {product?.imageUrl && (
          <img src={product.imageUrl} alt={product.name} className="w-full h-48 object-cover rounded-md mb-4" />
        )}
        <CardTitle>{product?.name || `${item.product_type} #${item.product_id}`}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-2">
        <Button onClick={() => navigate(`/product/${item.product_id}`)}>View Details</Button>
        <Button variant="outline" onClick={() => onRemove(item.id)}>Remove</Button>
      </CardContent>
    </Card>
  );
}