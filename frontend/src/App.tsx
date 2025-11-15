import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingScreen } from "./components/loading-screen";
import Home from "./pages/home";
import NotFound from "./pages/not-found";
import About from "./pages/about";
import Contact from "./pages/contact";
import Products from "./pages/products";
import ProductDetail from "./pages/product-detail";
import CustomizationPage from "./pages/customization";
import Cart from "./pages/cart";
import Checkout from "./pages/checkout";
import Wishlist from "./pages/wishlist";
import OrderSuccess from "./pages/order-success";
import Login from "./pages/login";
import Register from "./pages/register";
import ForgotPassword from "./pages/forgot-password";
import ResetPassword from "./pages/reset-password";
import AccountPage from "./pages/account";
import Admin from "./pages/admin";
import { FloatingParticles, PageTransition } from "@/components/visual-effects";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Navbar from "./components/navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { HelmetProvider } from 'react-helmet-async';

function App() {
  const [loading, setLoading] = useState(true);

  const handleFinishLoading = () => {
    console.log("onFinishLoading called");
    setLoading(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router basename="/Reyan_Luxe/">
            {loading && <LoadingScreen onFinishLoading={handleFinishLoading} />}
            {!loading && <Navbar />}
            <FloatingParticles />
            <PageTransition>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/customize/:productType/:productId?" element={<CustomizationPage />} />
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <ProtectedRoute>
                      <Wishlist />
                    </ProtectedRoute>
                  }
                />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/account"
                  element={
                    <ProtectedRoute>
                      <AccountPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/*"
                  element={
                    <ProtectedRoute>
                      <Admin />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </PageTransition>
          </Router>
        </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
