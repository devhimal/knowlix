"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [userType, setUserType] = useState<'student' | 'senior' | 'mentor' | 'admin'>('student');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password, userType);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Academic Hub</h1>
          <p className="text-muted-foreground">Sign in to access your resources</p>
        </div>

        <Tabs defaultValue="student" onValueChange={(value) => setUserType(value as any)}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="student">Student</TabsTrigger>
            <TabsTrigger value="senior">Senior</TabsTrigger>
            <TabsTrigger value="mentor">Mentor</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isSignup={isSignup}
              setIsSignup={setIsSignup}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="senior">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isSignup={isSignup}
              setIsSignup={setIsSignup}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="mentor">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isSignup={isSignup}
              setIsSignup={setIsSignup}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <TabsContent value="admin">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              isSignup={isSignup}
              setIsSignup={setIsSignup}
              onSubmit={handleSubmit}
            />
          </TabsContent>
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
  isSignup,
  setIsSignup,
  onSubmit,
}: {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  isSignup: boolean;
  setIsSignup: (isSignup: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
}) => (
  <form onSubmit={onSubmit} className="space-y-4">
    <div>
      <Label htmlFor="email">Email</Label>
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

    {isSignup && (
      <div>
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          required
        />
      </div>
    )}

    <Button type="submit" className="w-full">
      {isSignup ? 'Sign Up' : 'Sign In'}
    </Button>

    <div className="text-center text-sm">
      <button
        type="button"
        onClick={() => setIsSignup(!isSignup)}
        className="text-primary hover:underline"
      >
        {isSignup ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
      </button>
    </div>
  </form>
);