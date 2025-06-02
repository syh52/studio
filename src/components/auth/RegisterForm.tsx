"use client";
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import Link from 'next/link';

export default function RegisterForm() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await register(username, email, password);
    if (success) {
      toast({ title: "Registration Successful", description: "Welcome! Please log in." });
      router.push('/login');
    } else {
      toast({ title: "Registration Failed", description: "User may already exist or invalid data.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto pixel-border shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center text-accent">Register</CardTitle>
        <CardDescription className="text-center">Create your Aviation Lexicon Trainer account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="input-pixel"
              placeholder="Pilot123"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-pixel"
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-pixel"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" className="w-full btn-pixel bg-accent text-accent-foreground hover:bg-accent/90" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Login here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}