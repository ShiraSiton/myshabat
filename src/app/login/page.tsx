'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { loginSchema } from '@/lib/validations';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      const returnTo = new URLSearchParams(window.location.search).get('returnTo') || '/dashboard';
      router.push(returnTo);
    } else {
      setError(res.error || 'אירעה שגיאה');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-md px-4">
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">התחברות</h1>
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            <Input label="כתובת אימייל" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <Input label="סיסמה" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <Button type="submit" className="w-full" isLoading={isLoading}>התחברות</Button>
            <p className="text-center text-sm text-gray-600">
              עוד לא רשומים? <Link href="/register" className="text-blue-600 hover:underline">הרשמה</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
