"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userType, setUserType] = useState<'student' | 'senior' | 'mentor' | 'admin'>('student');
  const { login, signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        await signUp(email, password, name);
        toast.success('Account created! Please sign in.');
        setIsSignup(false);
      } else {
        await login(email, password, userType);
        router.push('/dashboard');
        toast.success('Logged in successfully');
      }
    } catch (error: any) {
      console.error('Auth operation failed:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center px-4 py-12 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-md p-8 shadow-2xl border-none">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <BookOpen className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">Padyantra</h1>
          <p className="text-gray-500">{isSignup ? 'Create your student account' : 'Sign in to your account'}</p>
        </div>

        <Tabs defaultValue="student" onValueChange={(value) => setUserType(value as any)}>
          {!isSignup && (
            <TabsList className="grid w-full grid-cols-4 mb-6 bg-gray-100 p-1">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="senior">Senior</TabsTrigger>
              <TabsTrigger value="mentor">Mentor</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
          )}

          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            name={name}
            setName={setName}
            isSignup={isSignup}
            setIsSignup={setIsSignup}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </Tabs>
      </Card>
    </div>
  );
};

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName,
  isSignup,
  setIsSignup,
  onSubmit,
  loading,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
  isSignup: boolean;
  setIsSignup: (isSignup: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    {isSignup && (
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
    )}

    <div>
      <Label htmlFor="email">Email Address</Label>
      <Input
        id="email"
        type="email"
        placeholder="student@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
    </div>

    <div>
      <Label htmlFor="password">Password</Label>
      <Input
        id="password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
    </div>

    <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        isSignup ? 'Create Account' : 'Sign In'
      )}
    </Button>

    <div className="text-center text-sm pt-2">
      <button
        type="button"
        onClick={() => setIsSignup(!isSignup)}
        className="text-primary font-semibold hover:underline"
      >
        {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
    </div>
  </form>
);