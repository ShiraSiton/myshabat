'use client';

import { Card, CardContent } from '@/components/ui/Card';
import { getStore } from '@/lib/store';
import { Users, FileText, Star, Bell } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  const store = getStore();
  const pendingUsers = store.users.filter((u) => u.status === 'pending');
  const pendingReviews = store.reviews.filter((r) => r.status === 'pending');

  const stats = [
    { label: 'משתמשים ממתינים', value: pendingUsers.length, icon: Users, color: 'bg-yellow-100 text-yellow-700', href: '/admin/users' },
    { label: 'משובים לאישור', value: pendingReviews.length, icon: Star, color: 'bg-purple-100 text-purple-700', href: '/admin/reviews' },
    { label: 'סה"כ משתמשים', value: store.users.length, icon: Users, color: 'bg-blue-100 text-blue-700', href: '/admin/users' },
    { label: 'התאמות', value: store.matches.length, icon: Bell, color: 'bg-green-100 text-green-700', href: '/admin/reports' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ניהול מערכת</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className={`flex items-center gap-4 pt-4`}>
                <div className={`rounded-full p-3 ${s.color}`}>
                  <s.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-sm text-gray-600">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
