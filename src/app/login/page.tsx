"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/context/AuthContext';
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
  const [currentTab, setCurrentTab] = useState('signin'); // 'signin' or 'signup'
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const { signIn, signUp, loading } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentTab === 'signup') {
      const { success, error } = await signUp(email, password, selectedRole);
      if (success) {
        toast.success('Account created! Please check your email to verify and then sign in.');
        setCurrentTab('signin');
      } else {
        toast.error(error || 'Signup failed.');
      }
    } else { // signin
      const { success, error } = await signIn(email, password);
      if (success) {
        toast.success('Signed in successfully!');
        router.push('/dashboard');
      } else {
        toast.error(error || 'Sign in failed.');
      }
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
          <p className="text-gray-500">
            {currentTab === 'signup' ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-4">
          {currentTab === 'signup' && (
            <div className="mb-4">
              <Label htmlFor="role">I am a:</Label>
              <Tabs value={selectedRole || 'student'} onValueChange={(value) => setSelectedRole(value as UserRole)} className="mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="student">Student</TabsTrigger>
                  <TabsTrigger value="mentor">Mentor</TabsTrigger>
                  <TabsTrigger value="admin">Admin</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          )}

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
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
            ) : currentTab === 'signup' ? (
              'Sign Up'
            ) : (
              'Sign In'
            )}
          </Button>
        </form>
      </Card>
    </div>
  );
}
