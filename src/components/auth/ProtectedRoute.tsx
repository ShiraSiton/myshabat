'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
  requireActive?: boolean;
}

export function ProtectedRoute({ children, adminOnly = false, requireActive = true }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, isAdmin, logout } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }

    if (adminOnly && !isAdmin) {
      router.replace('/dashboard');
    }
  }, [adminOnly, isAdmin, loading, pathname, router, user]);

  if (loading || !user || (adminOnly && !isAdmin)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-gray-500">
        טוען...
      </div>
    );
  }

  if (requireActive && user.status !== 'active' && !isAdmin) {
    return (
      <div className="mx-auto max-w-xl py-12">
        <Card>
          <CardContent className="space-y-4 p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900">החשבון ממתין לאישור</h1>
            <p className="text-gray-600">
              ההרשמה התקבלה בהצלחה. מנהל המערכת צריך לאשר את החשבון לפני קבלת גישה מלאה.
            </p>
            <div className="flex justify-center gap-3">
              <Link href="/">
                <Button variant="outline">חזרה לדף הבית</Button>
              </Link>
              <Button variant="ghost" onClick={logout}>התנתקות</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
