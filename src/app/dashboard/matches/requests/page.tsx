'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function MatchRequestsPage() {
  const { user } = useAuth();
  const store = getStore();
  const incoming = store.matchRequests.filter((r) => r.receiver_id === user?.id);
  const outgoing = store.matchRequests.filter((r) => r.sender_id === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">פניות</h1>

      <Card>
        <CardHeader><h2 className="font-semibold">פניות נכנסות ({incoming.length})</h2></CardHeader>
        <CardContent>
          {incoming.length === 0 ? (
            <p className="text-center text-gray-500 py-4">אין פניות נכנסות</p>
          ) : (
            <div className="space-y-3">
              {incoming.map((req) => (
                <div key={req.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{req.sender_role === 'host' ? 'מארח' : 'מתארח'}</p>
                      <p className="text-sm text-gray-500">{formatDate(req.created_at)}</p>
                    </div>
                    <Badge status={req.status} />
                  </div>
                  {req.message && <p className="mt-2 text-sm text-gray-600">{req.message}</p>}
                  {req.status === 'pending' && (
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

      <Card>
        <CardHeader><h2 className="font-semibold">פניות יוצאות ({outgoing.length})</h2></CardHeader>
        <CardContent>
          {outgoing.length === 0 ? (
            <p className="text-center text-gray-500 py-4">אין פניות יוצאות</p>
          ) : (
            <div className="space-y-3">
              {outgoing.map((req) => (
                <div key={req.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{req.sender_role === 'host' ? 'למתארח' : 'למארח'}</p>
                      <p className="text-sm text-gray-500">{formatDate(req.created_at)}</p>
                    </div>
                    <Badge status={req.status} />
                  </div>
                  {req.message && <p className="mt-2 text-sm text-gray-600">{req.message}</p>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
