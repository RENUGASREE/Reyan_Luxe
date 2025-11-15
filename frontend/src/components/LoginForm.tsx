import React from 'react';
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import PasswordInput from "@/components/PasswordInput";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast'; // Import useToast

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

interface LoginFormProps {
  redirectPath?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ redirectPath }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialize useToast

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const payload = (data.identifier.includes('@'))
        ? { email: data.identifier, password: data.password }
        : { username: data.identifier, password: data.password };
      const response = await apiRequest('POST', '/api/login/', payload);
      const loginData = await response.json();
      login(loginData.token, { id: loginData.user_id, username: loginData.username || loginData.email, email: loginData.email });
      toast({
        title: "Login successful!",
        description: "Welcome back!",
        variant: "default",
      });
      navigate(redirectPath || '/'); // Redirect to home page or specified path after successful login
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.detail || 'Login failed. Please check your credentials.';
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="identifier" className="block text-sm font-medium text-foreground">Email or Username</label>
        <Input
          type="text"
          placeholder="Email or Username"
          {...register("identifier")}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
        />
        {errors.identifier && <p className="mt-1 text-sm text-red-600">{errors.identifier.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
        <PasswordInput
          placeholder="Password"
          {...register("password")}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-foreground"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;