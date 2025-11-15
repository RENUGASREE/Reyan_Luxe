import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/footer";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

export default function ResetPassword() {
  // const { token } = useParams<{ token: string }>(); // Token not currently used
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", description: "Please confirm both passwords are identical.", variant: "destructive" });
      return;
    }

    try {
      // Step 1: Verify OTP
      const verifyResponse = await apiRequest('POST', '/api/verify-otp/', { email, otp_code: otp });

      if (verifyResponse.ok) {
        // Step 2: Reset Password if OTP is verified
        const resetResponse = await apiRequest('POST', '/api/reset-password/', {
          email,
          otp_code: otp,
          new_password: password,
        });

        if (resetResponse.ok) {
          toast({ title: "Password reset successful", description: "You can now log in." });
          navigate("/login");
        }
      }
    } catch (error: any) {
      console.error("Error during password reset:", error);
      const message = error?.message || 'Password reset failed. Please try again.';
      toast({ title: "Password reset failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <SEO 
        title="Reset Password - Reyan Luxe"
        description="Reset your Reyan Luxe account password. Create a new password for your account."
        keywords="reset password, new password, reyan luxe password reset, account security"
        url="https://reyanluxe.com/reset-password"
      />
      {/* <Navbar /> */}
      <div className="w-full max-w-md">
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="w-full max-w-md border p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-center mb-6">Reset Password</h1>
            <p className="text-center text-muted-foreground mb-6">
              Enter the OTP sent to your email and your new password.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="bg-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              <Link to="/login" className="text-primary hover:underline">
                Back to Login
              </Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}