import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/footer";

export default function OrderSuccess() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      {/* <Navbar /> */}
      <div className="w-full max-w-md text-center">
        <main className="flex-grow container mx-auto px-4 py-8 flex flex-col items-center justify-center text-center">
          <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
          <h1 className="text-5xl font-bold mb-4">Order Placed Successfully!</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been confirmed and will be
            shipped soon.
          </p>
          <div className="flex gap-4">
            <Button asChild>
              <Link to="/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/order-history">View Order History</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}