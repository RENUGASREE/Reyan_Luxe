import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('POST', '/api/send-otp/', { email });
      const data = await response.json().catch(() => ({}));
      toast({ title: "OTP request", description: data?.message ? `${data.message}${data?.email === 'failed' ? ' (email failed)' : ''}` : 'Request processed.', variant: data?.email === 'failed' ? 'destructive' : 'default' });
      // In DEBUG, we may have an OTP preview to aid development
      if (data?.debug?.otp_preview) {
        console.log('DEBUG OTP:', data.debug.otp_preview);
      }
      navigate("/reset-password", { state: { email } });
    } catch (error: any) {
      console.error("Error sending OTP request:", error);
      const message = error?.message || 'Failed to send OTP. Please try again.';
      toast({ title: "OTP failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <SEO 
        title="Forgot Password - Reyan Luxe"
        description="Reset your Reyan Luxe account password. Enter your email to receive a password reset link."
        keywords="forgot password, password reset, reyan luxe password, account recovery"
        url="https://reyanluxe.com/forgot-password"
      />
      {/* <Navbar /> */}
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md border p-8 rounded-lg shadow-lg">
          <h1 className="text-4xl font-bold text-center mb-6">Forgot Password</h1>
          <p className="text-center text-muted-foreground mb-6">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="reyanluxe@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Send Reset Link
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Remember your password?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}