"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { updatePassword } = useAuth();

  const accessToken = searchParams?.get('access_token');

  useEffect(() => {
    if (!accessToken) {
      setMessage('Invalid or expired reset link. Please try again.');
    }
  }, [accessToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      setLoading(false);
      return;
    }

    if (!accessToken) {
      setMessage('Access token missing. Cannot reset password.');
      setLoading(false);
      return;
    }

    try {
      const { success, error } = await updatePassword(password, accessToken);

      if (success) {
        toast.success('Your password has been reset successfully!');
        setMessage('Password reset successfully. Redirecting to login...');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage(error || 'Failed to reset password.');
        toast.error(error || 'Failed to reset password.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setMessage('An unexpected error occurred. Please try again.');
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (!accessToken) {
    return (
      <Card className="w-full max-w-md p-8 shadow-2xl border-none text-center">
        <BookOpen className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset</h1>
        <p className="text-red-500 mb-4">{message || 'Loading...'}</p>
        <Link href="/forgot-password" className="text-sm text-primary hover:underline">
          Request a new reset link
        </Link>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md p-8 shadow-2xl border-none">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
        <p className="text-gray-500">Set your new password</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={loading}>
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'Reset Password'
          )}
        </Button>
        {message && (
          <p className={`text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <div className="text-center text-sm text-gray-500 mt-4">
          <Link href="/login" className="text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </form>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex items-center justify-center px-4 py-12 bg-gray-50 min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
