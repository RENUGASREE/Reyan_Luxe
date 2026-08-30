import React from 'react';
import { useForm } from "react-hook-form";

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiRequest } from '../lib/queryClient';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const registerSchema = z.object({
  username: z.string().min(2, 'Username must be at least 2 characters').max(50, 'Username must be less than 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Za-z]/, 'Password must contain a letter')
    .regex(/[0-9]/, 'Password must contain a number'),
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
      // Use the dedicated registration endpoint
      const response = await apiRequest('POST', '/api/v1/auth/register', {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      const registerData = await response.json();
      toast({
        title: "Registration successful!",
        description: "Logging you in...",
        variant: "default",
      });
      // Automatically log in after registration using email-based auth
      const loginResponse = await apiRequest('POST', '/api/v1/auth/login', {
        email: data.email,
        password: data.password,
      });
      const loginData = await loginResponse.json();
      login(loginData.data.accessToken, {
        id: String(loginData.data.user.id),
        username: loginData.data.user.username || data.username,
        email: loginData.data.user.email,
        role: loginData.data.user.role,
      });
      navigate(redirectPath || '/');
    } catch (error: any) {
        console.error("Registration error:", error);
        const errorMessage = (error?.message) || 'Registration failed. Please try again.';
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
          placeholder="Password"
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