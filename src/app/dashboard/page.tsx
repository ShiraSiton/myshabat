'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { getDashboardSummary, type DashboardSummary } from '@/lib/api/dashboard';
import { Bell, MessageCircle, Star, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getDashboardSummary(user.id)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת הדשבורד נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const stats = [
    {
      label: 'התראות',
      value: summary?.unreadNotificationsCount || 0,
      icon: Bell,
      color: 'bg-blue-100 text-blue-600',
      href: '/dashboard/notifications',
    },
    {
      label: 'שיחות',
      value: summary?.conversationsCount || 0,
      icon: MessageCircle,
      color: 'bg-green-100 text-green-600',
      href: '/dashboard/chat',
    },
    {
      label: 'בקשות ממתינות',
      value: summary?.pendingRequestsCount || 0,
      icon: Star,
      color: 'bg-purple-100 text-purple-600',
      href: '/dashboard/matches/requests',
    },
    {
      label: 'התאמות',
      value: summary?.matchesCount || 0,
      icon: Users,
      color: 'bg-orange-100 text-orange-600',
      href: '/dashboard/matches',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">אזור אישי</h1>
        <Badge status={user?.status || 'pending'} />
      </div>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="block">
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-center gap-4 pt-4">
                <div className={`rounded-full p-3 ${stat.color}`}><stat.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{loading ? '...' : stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-semibold">בקשות התאמה ממתינות</h2></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">טוען...</p>
            ) : !summary || summary.pendingRequests.length === 0 ? (
              <p className="text-sm text-gray-500">אין בקשות ממתינות</p>
            ) : (
              <div className="space-y-3">
                {summary.pendingRequests.map((request) => (
                  <div key={request.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">
                        {request.sender_role === 'host' ? 'פנייה ממארח' : 'פנייה ממתארח'}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(request.created_at)}</p>
                    </div>
                    <Badge status={request.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">התראות אחרונות</h2></CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-sm text-gray-500">טוען...</p>
            ) : !summary || summary.recentNotifications.length === 0 ? (
              <p className="text-sm text-gray-500">אין התראות</p>
            ) : (
              <div className="space-y-3">
                {summary.recentNotifications.map((notification) => (
                  <div key={notification.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${notification.is_read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-gray-500">{notification.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
