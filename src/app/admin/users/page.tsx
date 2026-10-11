'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getUsers, updateUserStatus } from '@/lib/api/users';
import { sendEmail } from '@/lib/api/email';
import { formatDate } from '@/lib/utils';
import type { User, UserStatus } from '@/lib/types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getUsers()
      .then((data) => {
        if (!cancelled) setUsers(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת המשתמשים נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleStatusUpdate = async (userId: string, status: UserStatus) => {
    try {
      setUpdatingId(userId);
      setError('');
      setNotice('');
      const updated = await updateUserStatus(userId, status);
      setUsers((current) => current.map((user) => (user.id === userId ? updated : user)));

      if (status === 'active') {
        try {
          const emailResult = await sendEmail({
            to: updated.email,
            subject: 'החשבון שלך ב־MyShabat אושר',
            text: 'שלום, החשבון שלך ב־MyShabat אושר וניתן להתחבר למערכת.',
            html: '<p>שלום,</p><p>החשבון שלך ב־MyShabat אושר וניתן להתחבר למערכת.</p>',
          });

          if (emailResult.skipped) {
            setNotice(`המשתמש אושר, אך המייל לא נשלח: ${emailResult.reason || 'לא הוגדר שירות מייל'}`);
          } else {
            setNotice(`המשתמש אושר ונשלח מייל אל ${updated.email}`);
          }
        } catch (mailErr) {
          setNotice(
            `המשתמש אושר, אך שליחת המייל נכשלה: ${mailErr instanceof Error ? mailErr.message : 'שגיאה לא ידועה'}`
          );
        }
      } else {
        setNotice('סטטוס המשתמש עודכן בהצלחה');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'עדכון המשתמש נכשל');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ניהול משתמשים</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">כל המשתמשים ({users.length})</h2></CardHeader>
        <CardContent>
          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {notice && <div className="mb-4 rounded-lg bg-blue-50 p-3 text-sm text-blue-700">{notice}</div>}
          {loading ? (
            <p className="py-8 text-center text-gray-500">טוען משתמשים...</p>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-right">
                  <th className="pb-3 font-medium text-gray-500">אימייל</th>
                  <th className="pb-3 font-medium text-gray-500">תפקיד</th>
                  <th className="pb-3 font-medium text-gray-500">סטטוס</th>
                  <th className="pb-3 font-medium text-gray-500">תאריך הצטרפות</th>
                  <th className="pb-3 font-medium text-gray-500">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3">{u.email}</td>
                    <td className="py-3"><Badge status={u.role} /></td>
                    <td className="py-3"><Badge status={u.status} /></td>
                    <td className="py-3 text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {u.status === 'pending' && (
                          <Button size="sm" isLoading={updatingId === u.id} onClick={() => handleStatusUpdate(u.id, 'active')}>
                            אשר
                          </Button>
                        )}
                        {u.status !== 'blocked' && (
                          <Button size="sm" variant="danger" isLoading={updatingId === u.id} onClick={() => handleStatusUpdate(u.id, 'blocked')}>
                            חסום
                          </Button>
                        )}
                        {u.status === 'blocked' && (
                          <Button size="sm" variant="outline" isLoading={updatingId === u.id} onClick={() => handleStatusUpdate(u.id, 'active')}>
                            החזר לפעילות
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
