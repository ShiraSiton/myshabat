'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const store = getStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ניהול משתמשים</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">כל המשתמשים ({store.users.length})</h2></CardHeader>
        <CardContent>
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
                {store.users.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3">{u.email}</td>
                    <td className="py-3"><Badge status={u.role} /></td>
                    <td className="py-3"><Badge status={u.status} /></td>
                    <td className="py-3 text-gray-500">{formatDate(u.created_at)}</td>
                    <td className="py-3">
                      <div className="flex gap-1">
                        {u.status === 'pending' && <Button size="sm">אשר</Button>}
                        <Button size="sm" variant="danger">חסום</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
