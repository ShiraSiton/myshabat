'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getMyNotifications, markAllNotificationsRead, markNotificationRead } from '@/lib/api/notifications';
import { formatDate } from '@/lib/utils';
import type { Notification } from '@/lib/types';

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getMyNotifications(user.id)
      .then((data) => {
        if (!cancelled) setNotifications(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת ההתראות נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleMarkRead = async (notificationId: string) => {
    try {
      setUpdatingId(notificationId);
      setError('');
      const updated = await markNotificationRead(notificationId);
      setNotifications((current) => current.map((notification) => (
        notification.id === notificationId ? updated : notification
      )));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'עדכון ההתראה נכשל');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;

    try {
      setUpdatingId('all');
      setError('');
      await markAllNotificationsRead(user.id);
      setNotifications((current) => current.map((notification) => ({ ...notification, is_read: true })));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'עדכון ההתראות נכשל');
    } finally {
      setUpdatingId(null);
    }
  };

  const hasUnread = notifications.some((notification) => !notification.is_read);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">התראות</h1>
        {hasUnread && (
          <Button variant="outline" size="sm" isLoading={updatingId === 'all'} onClick={handleMarkAllRead}>
            סמן הכל כנקרא
          </Button>
        )}
      </div>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Card>
        <CardHeader><h2 className="font-semibold">כל ההתראות ({notifications.length})</h2></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">טוען התראות...</p>
          ) : notifications.length === 0 ? (
            <p className="text-center text-gray-500 py-8">אין התראות</p>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className={`rounded-lg border p-4 ${notification.is_read ? 'bg-white' : 'bg-blue-50 border-blue-200'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">{notification.title}</p>
                      <p className="text-sm text-gray-600">{notification.content}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {!notification.is_read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      <span className="text-xs text-gray-400">{formatDate(notification.created_at)}</span>
                    </div>
                  </div>
                  {!notification.is_read && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        isLoading={updatingId === notification.id}
                        onClick={() => handleMarkRead(notification.id)}
                      >
                        סמן כנקרא
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
