import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";
import { Input } from "@/components/ui/input";

// Dummy cart data
const dummyCartItems = [
  {
    id: "1",
    name: "Luxury Watch",
    price: 10000,
    quantity: 1,
    image: "https://via.placeholder.com/100",
  },
  {
    id: "2",
    name: "Designer Handbag",
    price: 5000,
    quantity: 2,
    image: "https://via.placeholder.com/100",
  },
];

export default function Cart() {
  const [cartItems, setCartItems] = useState(dummyCartItems);

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <Navbar /> */}
      <main className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-5xl font-bold text-center mb-12">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="text-center">
            <p className="text-xl mb-4">Your cart is empty.</p>
            <Button asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center border-b py-4"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md mr-4"
                  />
                  <div className="flex-grow">
                    <h2 className="text-xl font-semibold">{item.name}</h2>
                    <p className="text-lg text-muted-foreground">
                      ${item.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity === 1}
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateQuantity(item.id, parseInt(e.target.value))
                      }
                      className="w-16 text-center"
                      min="1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="lg:col-span-1">
              <div className="border p-6 rounded-lg shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
                <div className="flex justify-between text-lg mb-2">
                  <span>Subtotal:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg mb-4">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="flex justify-between text-2xl font-bold mb-6">
                  <span>Total:</span>
                  <span>${total.toLocaleString()}</span>
                </div>
                <Button asChild className="w-full">
                  <Link to="/checkout">Proceed to Checkout</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}