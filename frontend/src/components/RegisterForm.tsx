import React from 'react';
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast'; // Import useToast

const registerSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  redirectPath?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ redirectPath }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast(); // Initialize useToast

  const onSubmit = async (data: RegisterFormInputs) => {
    try {
      const response = await apiRequest('POST', '/api/users/', data);
      toast({
        title: "Registration successful!",
        description: "You can now log in.",
        variant: "default",
      });
      // Automatically log in after registration
      const loginResponse = await apiRequest('POST', '/api/login/', {
        username: data.username,
        password: data.password,
      });
      const loginData = await loginResponse.json();
      login(loginData.token, { id: loginData.user_id, username: data.username, email: data.email });
      navigate(redirectPath || '/'); // Redirect to home page or specified path after successful login
    } catch (error: any) {
        console.error("Registration error:", error);
        const errorMessage = error.response?.data?.username?.[0] || 'Registration failed. Please try again.';
        toast({
          title: "Registration Failed",
          description: errorMessage,
          variant: "destructive",
        });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-foreground">Username</label>
        <input
          id="username"
          type="text"
          {...register('username')}
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-foreground"
        />
        {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
      </div>
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">Email</label>
        <input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-foreground"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
        <input
          id="password"
          type="password"
          {...register('password')}
          className="mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-foreground"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>
      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Register
      </button>
    </form>
  );
};

export default RegisterForm;