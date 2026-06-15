'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function CommunityRequestsPage() {
  const store = getStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">בקשות היכרות</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">בקשות שהתקבלו</h2></CardHeader>
        <CardContent>
          {store.communityConnections.filter((c) => c.status === 'pending').length === 0 ? (
            <p className="text-center text-gray-500 py-8">אין בקשות ממתינות</p>
          ) : (
            <div className="space-y-3">
              {store.communityConnections.map((conn) => (
                <div key={conn.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{store.communityProfiles.find((p) => p.user_id === conn.requester_id)?.display_name || 'משתמש'}</p>
                      <p className="text-sm text-gray-500">{formatDate(conn.created_at)}</p>
                    </div>
                    <Badge status={conn.status} />
                  </div>
                  {conn.message && <p className="mt-2 text-sm text-gray-600">{conn.message}</p>}
                  {conn.status === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <Button size="sm">אשר</Button>
                      <Button size="sm" variant="danger">דחה</Button>
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
