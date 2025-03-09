'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle } from 'lucide-react';

export default function AdminRegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !email || !password || !secretKey) {
      setError('All fields are required');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      console.log('Submitting admin registration form...');
      
      // Create a simple object for the request body
      const requestData = {
        name,
        email,
        password,
        secretKey
      };
      
      console.log('Request data prepared:', { ...requestData, password: '***' });
      
      const response = await fetch('/api/auth/admin-register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });
      
      console.log('Response received:', response.status, response.statusText);
      
      let data;
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (isJson) {
        // If the response is JSON, parse it
        data = await response.json();
        console.log('Response data:', data);
      } else {
        // If not JSON, get the text
        const text = await response.text();
        console.log('Response text:', text);
        data = { message: text || 'Unknown error' };
      }
      
      if (!response.ok) {
        setError(data.message || `Error: ${response.status} ${response.statusText}`);
        return;
      }
      
      // Success - redirect to login page
      console.log('Registration successful, redirecting...');
      router.push('/auth/login?success=Admin account created successfully');
      
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'An unexpected error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin Registration</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new admin account
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start gap-2">
            <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Name</div>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Email</div>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john@example.com"
              className="mt-1"
            />
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Password</div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
          </div>
          
          <div>
            <div className="text-sm font-medium text-gray-700 mb-1">Admin Secret Key</div>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="••••••••"
              className="mt-1"
            />
            <p className="mt-1 text-sm text-gray-500">
              This key is required to create an admin account
            </p>
          </div>
          
          <Button
            type="submit"
            className="w-full bg-black hover:bg-orange-500"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Admin Account'}
          </Button>
          
          <div className="text-center text-sm">
            <Link href="/auth/login" className="text-blue-600 hover:underline">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
