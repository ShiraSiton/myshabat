'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { registerSchema } from '@/lib/validations';
import { UserRole } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('guest');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = registerSchema.safeParse({ email, password, confirmPassword, role });
    if (!result.success) {
      setError(result.error.issues[0].message);
      setIsLoading(false);
      return;
    }

    const res = await register(email, password, role);
    if (res.success) {
      router.push('/');
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
          <h1 className="mb-6 text-center text-3xl font-bold text-gray-900">הרשמה</h1>
            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <Input label="כתובת אימייל" id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="סיסמה" id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Input label="אימות סיסמה" id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">סוג משתמש</label>
                <div className="flex gap-4">
                  {([['guest', 'מתארח'], ['host', 'מארח']] as const).map(([val, label]) => (
                    <label key={val} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="role" value={val} checked={role === val} onChange={() => setRole(val)} className="text-blue-600" />
                      <span className="text-sm">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading}>הרשמה</Button>
              <p className="text-center text-sm text-gray-600">
                כבר רשומים? <Link href="/login" className="text-blue-600 hover:underline">התחברות</Link>
              </p>
            </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
