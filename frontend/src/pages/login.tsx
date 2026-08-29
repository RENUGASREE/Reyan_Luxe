import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Footer from "@/components/footer";
import { apiRequest } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiRequest('POST', '/api/v1/auth/login', { email: identifier, password });
      const data = await response.json();
      console.log("Login successful:", data);
      login(data.data.accessToken, {
        id: data.data.user.id,
        username: data.data.user.username,
        email: data.data.user.email,
        role: data.data.user.role,
      });
      toast({ title: "Login successful", description: "Welcome back!" });
      navigate("/"); // Redirect to home page or dashboard
    } catch (error: any) {
      console.error("Login failed:", error);
      const message = error?.message || 'Login failed. Please check your credentials.';
      toast({ title: "Login failed", description: message, variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <SEO 
        title="Login - Reyan Luxe"
        description="Login to your Reyan Luxe account to access your orders, customize jewelry, and manage your profile."
        keywords="login, account access, reyan luxe login, jewelry account, customer login"
        url="https://reyanluxe.com/login"
      />
      <div className="w-full max-w-md">
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="w-full max-w-md border p-8 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-center mb-6">Login</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="identifier">Email or Username</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Email or Username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary hover:underline">
                Register
              </Link>
            </p>
            <p className="text-center text-sm text-muted-foreground mt-2">
              <Link to="/forgot-password" className="text-primary hover:underline">
                Forgot Password?
              </Link>
            </p>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}