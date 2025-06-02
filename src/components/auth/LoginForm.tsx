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

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    if (success) {
      toast({ title: "Login Successful", description: "Welcome back!" });
      router.push('/');
    } else {
      toast({ title: "Login Failed", description: "Invalid email or password.", variant: "destructive" });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto pixel-border shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-center text-accent">Login</CardTitle>
        <CardDescription className="text-center">Access your Aviation Lexicon Trainer account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
        <Button variant="outline" className="w-full mt-4 btn-pixel" disabled={isLoading}>
          {/* Placeholder for WeChat Login */}
          Log in with WeChat (Coming Soon)
        </Button>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm">
          Don't have an account?{' '}
          <Link href="/register" className="text-accent hover:underline">
            Register here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}