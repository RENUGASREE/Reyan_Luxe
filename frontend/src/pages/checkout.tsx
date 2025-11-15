import { useState, useEffect } from "react";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RazorpayCheckout } from "@/components/RazorpayCheckout";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/queryClient";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

interface CartItem {
  id: number;
  product_type: string;
  product_id: number;
  quantity: number;
  price: number;
  product?: {
    name: string;
    image?: string;
  };
}

// interface OrderData {
//   shipping_address: string;
//   billing_address: string;
//   phone_number: string;
//   email: string;
//   notes?: string;
//   payment_method: string;
// }

export default function Checkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);
  
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    address: "",
    city: "",
    zip: "",
    country: "India",
    phone: "",
    email: "",
  });
  
  const [billingInfo, setBillingInfo] = useState({
    sameAsShipping: true,
    fullName: "",
    address: "",
    city: "",
    zip: "",
    country: "India",
  });
  
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [orderNotes, setOrderNotes] = useState("");

  // Calculate total
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 1000 ? 0 : 50; // Free shipping over ₹1000
  const total = subtotal + shipping;

  useEffect(() => {
    fetchCartItems();
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        fullName: user.username || '',
        email: user.email || '',
        phone: (user as any).phone_number || '',
      }));
    }
  }, [user]);

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart-items/`, {
        headers: {
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      } else {
        throw new Error('Failed to fetch cart items');
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
      toast({
        title: 'Error',
        description: 'Failed to load cart items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async () => {
    if (!validateForm()) {
      return null;
    }

    try {
      setOrderProcessing(true);
      
      const orderData = {
        shipping_address: `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zip}, ${shippingInfo.country}`,
        billing_address: billingInfo.sameAsShipping 
          ? `${shippingInfo.fullName}, ${shippingInfo.address}, ${shippingInfo.city}, ${shippingInfo.zip}, ${shippingInfo.country}`
          : `${billingInfo.fullName}, ${billingInfo.address}, ${billingInfo.city}, ${billingInfo.zip}, ${billingInfo.country}`,
        phone_number: shippingInfo.phone,
        email: shippingInfo.email,
        notes: orderNotes,
        payment_method: paymentMethod,
        total_amount: total,
      };

      const response = await fetch(`${API_BASE_URL}/api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        setCreatedOrderId(order.id);
        return order;
      } else {
        throw new Error('Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create order',
        variant: 'destructive',
      });
      return null;
    } finally {
      setOrderProcessing(false);
    }
  };

  const validateForm = () => {
    if (!shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || 
        !shippingInfo.zip || !shippingInfo.phone || !shippingInfo.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all shipping information',
        variant: 'destructive',
      });
      return false;
    }

    if (!billingInfo.sameAsShipping) {
      if (!billingInfo.fullName || !billingInfo.address || !billingInfo.city || !billingInfo.zip) {
        toast({
          title: 'Missing Information',
          description: 'Please fill in all billing information',
          variant: 'destructive',
        });
        return false;
      }
    }

    if (cartItems.length === 0) {
      toast({
        title: 'Empty Cart',
        description: 'Your cart is empty',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    const order = await createOrder();
    if (order && paymentMethod === 'razorpay') {
      // Razorpay payment will be handled by the RazorpayCheckout component
      toast({
        title: 'Order Created',
        description: 'Please complete the payment to place your order',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Loading Checkout...</h1>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Your cart is empty</h1>
          <Button onClick={() => navigate('/products')} className="mt-4">
            Continue Shopping
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO 
        title="Checkout - Reyan Luxe"
        description="Complete your purchase of luxury customized jewelry. Secure checkout process for your bracelets and chains with multiple payment options."
        keywords="checkout, secure payment, jewelry purchase, custom jewelry checkout, reyan luxe payment"
        url="https://reyanluxe.com/checkout"
      />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-12">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Information */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={shippingInfo.address}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="sameAsShipping"
                    checked={billingInfo.sameAsShipping}
                    onChange={(e) => setBillingInfo({ ...billingInfo, sameAsShipping: e.target.checked })}
                  />
                  <Label htmlFor="sameAsShipping">Same as shipping address</Label>
                </div>
                
                {!billingInfo.sameAsShipping && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingFullName">Full Name</Label>
                      <Input
                        id="billingFullName"
                        value={billingInfo.fullName}
                        onChange={(e) => setBillingInfo({ ...billingInfo, fullName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="billingAddress">Address</Label>
                      <Input
                        id="billingAddress"
                        value={billingInfo.address}
                        onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingCity">City</Label>
                      <Input
                        id="billingCity"
                        value={billingInfo.city}
                        onChange={(e) => setBillingInfo({ ...billingInfo, city: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingZip">ZIP Code</Label>
                      <Input
                        id="billingZip"
                        value={billingInfo.zip}
                        onChange={(e) => setBillingInfo({ ...billingInfo, zip: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="razorpay" id="razorpay" />
                    <Label htmlFor="razorpay">Razorpay (Credit/Debit Card, UPI, Net Banking)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cod" id="cod" />
                    <Label htmlFor="cod">Cash on Delivery</Label>
                  </div>
                </RadioGroup>
                
                {paymentMethod === 'razorpay' && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      🔒 Secure payment powered by Razorpay. We accept all major credit/debit cards, UPI, and net banking.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Order Notes (Optional)</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Any special instructions for your order..."
                  rows={3}
                />
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {item.product?.name || `Product ${item.product_id}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping:</span>
                      <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span>₹{total.toFixed(2)}</span>
                    </div>
                  </div>

                  {paymentMethod === 'razorpay' && createdOrderId ? (
                    <RazorpayCheckout
                      orderId={createdOrderId}
                      amount={total}
                      onSuccess={() => {
                        toast({
                          title: 'Order Placed Successfully',
                          description: 'Your order has been placed and payment received',
                        });
                        navigate('/order-success');
                      }}
                      onFailure={(_error) => {
                        toast({
                          title: 'Payment Failed',
                          description: 'Payment failed. Please try again.',
                          variant: 'destructive',
                        });
                      }}
                    />
                  ) : (
                    <Button
                      onClick={handlePlaceOrder}
                      disabled={orderProcessing || paymentMethod === 'razorpay'}
                      className="w-full"
                    >
                      {orderProcessing ? 'Processing...' : 'Place Order'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
