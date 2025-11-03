import axios from 'axios';
import { useState } from "react";
import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/footer";

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>(); // Assuming a token is passed in the URL
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Step 1: Verify OTP
      const verifyResponse = await axios.post(
        "/api/verify_otp/",
        {
          email,
          otp,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (verifyResponse.status === 200) {
        // Step 2: Reset Password if OTP is verified
        const resetResponse = await axios.post(
          "/api/reset_password/",
          {
            email,
            otp,
            new_password: password,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (resetResponse.status === 200) {
          alert("Password has been reset successfully!");
          navigate("/login");
        }
      }
    } catch (error: any) {
      console.error("Error during password reset:", error);
      if (error.response && error.response.data && error.response.data.detail) {
        alert(`Password reset failed: ${error.response.data.detail}`);
      } else {
        alert("Password reset failed. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
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