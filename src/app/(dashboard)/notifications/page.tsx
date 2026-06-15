'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function NotificationsPage() {
  const { user } = useAuth();
  const store = getStore();
  const notifications = store.notifications.filter((n) => n.user_id === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">התראות</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">כל ההתראות ({notifications.length})</h2></CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">אין התראות</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((n) => (
                <div key={n.id} className={`rounded-lg border p-4 ${n.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{n.title}</p>
                      <p className="text-sm text-gray-600">{n.content}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!n.is_read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      <span className="text-xs text-gray-400">{formatDate(n.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
