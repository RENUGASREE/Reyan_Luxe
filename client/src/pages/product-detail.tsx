import Footer from "@/components/footer";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState } from "react";

// Dummy product data (replace with actual data fetching)
const dummyProducts = [
  {
    id: "1",
    name: "Luxury Watch",
    description:
      "A timeless piece of craftsmanship, featuring a Swiss movement and a sapphire crystal face. Perfect for the discerning individual.",
    price: "$10,000",
    category: "Accessories",
    image: "https://via.placeholder.com/400x300",
    details: [
      "Swiss Automatic Movement",
      "Water Resistant up to 100m",
      "Stainless Steel Casing",
      "Leather Strap",
    ],
  },
  {
    id: "2",
    name: "Designer Handbag",
    description:
      "An elegant and spacious handbag, crafted from genuine leather with bespoke hardware. A statement piece for any occasion.",
    price: "$5,000",
    category: "Accessories",
    image: "https://via.placeholder.com/400x300",
    details: [
      "Genuine Leather",
      "Hand-stitched",
      "Gold-plated Hardware",
      "Multiple Compartments",
    ],
  },
];

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const [quantity, setQuantity] = useState(1);

  // In a real application, you would fetch product data based on the 'productId'
  const product = dummyProducts.find((p) => p.id === productId); // Using dummy data for now

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* <Navbar /> */}
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
      {/* <Navbar /> */}
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
            <p className="text-2xl text-primary-foreground mb-6">
              {product.price}
            </p>
            <p className="text-lg mb-6">{product.description}</p>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Details:</h2>
              <ul className="list-disc list-inside ml-4">
                {product.details.map((detail, index) => (
                  <li key={index}>{detail}</li>
                ))}
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

            <p className="text-sm text-muted-foreground">
              Category: {product.category}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}