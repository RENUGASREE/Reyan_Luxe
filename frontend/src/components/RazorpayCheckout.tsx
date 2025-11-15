import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/queryClient';
import { useNavigate } from 'react-router-dom';

// Load Razorpay script dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface RazorpayCheckoutProps {
  orderId: number;
  amount: number; // Amount in rupees
  onSuccess?: (response: any) => void;
  onFailure?: (error: any) => void;
}

export const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  orderId,
  amount,
  onSuccess,
  onFailure,
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then((loaded) => {
      setRazorpayLoaded(loaded as boolean);
      if (!loaded) {
        toast({
          title: 'Error',
          description: 'Failed to load payment gateway',
          variant: 'destructive',
        });
      }
    });
  }, []);

  const createRazorpayOrder = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/razorpay/create_order/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          amount: amount * 100, // Convert to paise
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize payment',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const verifyPayment = async (paymentResponse: any) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/razorpay/verify_payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      toast({
        title: 'Error',
        description: 'Payment gateway not loaded',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Create Razorpay order
      const razorpayOrderData = await createRazorpayOrder();

      if (!razorpayOrderData.success) {
        throw new Error(razorpayOrderData.error || 'Failed to create payment order');
      }

      // Razorpay options
      const options = {
        key: razorpayOrderData.key_id,
        amount: razorpayOrderData.amount,
        currency: razorpayOrderData.currency,
        name: razorpayOrderData.name,
        description: razorpayOrderData.description,
        order_id: razorpayOrderData.razorpay_order_id,
        prefill: razorpayOrderData.prefill,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verificationResult = await verifyPayment(response);
            
            if (verificationResult.success) {
              toast({
                title: 'Payment Successful',
                description: 'Your payment has been processed successfully',
              });
              
              if (onSuccess) {
                onSuccess(verificationResult);
              } else {
                // Navigate to order success page
                navigate('/order-success');
              }
            } else {
              throw new Error('Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast({
              title: 'Payment Failed',
              description: 'Payment verification failed. Please contact support.',
              variant: 'destructive',
            });
            
            if (onFailure) {
              onFailure(error);
            }
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast({
              title: 'Payment Cancelled',
              description: 'Payment was cancelled',
              variant: 'destructive',
            });
          },
        },
        theme: {
          color: '#3399cc',
        },
      };

      // Open Razorpay checkout
      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Payment Error',
        description: 'Failed to process payment. Please try again.',
        variant: 'destructive',
      });
      
      if (onFailure) {
        onFailure(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secure Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              ₹{amount.toFixed(2)}
            </p>
            <p className="text-sm text-muted-foreground">
              Total amount to pay
            </p>
          </div>
          
          <Button
            onClick={handlePayment}
            disabled={loading || !razorpayLoaded}
            className="w-full"
          >
            {loading ? 'Processing...' : 'Pay with Razorpay'}
          </Button>
          
          <div className="text-center text-xs text-muted-foreground">
            <p>🔒 Secure payment powered by Razorpay</p>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
