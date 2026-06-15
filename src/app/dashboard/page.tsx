'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getStore } from '@/lib/store';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';
import { Bell, MessageCircle, Star, Users } from 'lucide-react';

export default function DashboardPage() {
  const { user, isHost, isGuest } = useAuth();
  const store = getStore();
  const notifications = store.notifications.filter((n) => !n.is_read);
  const matchRequests = store.matchRequests.filter((r) => r.receiver_id === user?.id && r.status === 'pending');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">אזור אישי</h1>
        <Badge status={user?.status || 'pending'} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="rounded-full bg-blue-100 p-3"><Bell className="h-5 w-5 text-blue-600" /></div>
            <div><p className="text-2xl font-bold">{notifications.length}</p><p className="text-sm text-gray-600">התראות</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="rounded-full bg-green-100 p-3"><MessageCircle className="h-5 w-5 text-green-600" /></div>
            <div><p className="text-2xl font-bold">{store.conversations.length}</p><p className="text-sm text-gray-600">שיחות</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="rounded-full bg-purple-100 p-3"><Star className="h-5 w-5 text-purple-600" /></div>
            <div><p className="text-2xl font-bold">{matchRequests.length}</p><p className="text-sm text-gray-600">בקשות ממתינות</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-4">
            <div className="rounded-full bg-orange-100 p-3"><Users className="h-5 w-5 text-orange-600" /></div>
            <div><p className="text-2xl font-bold">{store.matches.length}</p><p className="text-sm text-gray-600">התאמות</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-semibold">בקשות התאמה ממתינות</h2></CardHeader>
          <CardContent>
            {matchRequests.length === 0 ? (
              <p className="text-sm text-gray-500">אין בקשות ממתינות</p>
            ) : (
              <div className="space-y-3">
                {matchRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="text-sm font-medium">{store.users.find((u) => u.id === req.sender_id)?.email}</p>
                      <p className="text-xs text-gray-500">{formatDate(req.created_at)}</p>
                    </div>
                    <Badge status={req.status} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">התראות אחרונות</h2></CardHeader>
          <CardContent>
            {store.notifications.length === 0 ? (
              <p className="text-sm text-gray-500">אין התראות</p>
            ) : (
              <div className="space-y-3">
                {store.notifications.slice(0, 5).map((n) => (
                  <div key={n.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className={`mt-1 h-2 w-2 rounded-full ${n.is_read ? 'bg-gray-300' : 'bg-blue-500'}`} />
                    <div>
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.content}</p>
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
