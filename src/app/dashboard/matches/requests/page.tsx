'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getMyMatchRequests, updateMatchRequestStatus } from '@/lib/api/matches';
import { formatDate } from '@/lib/utils';
import type { MatchRequest, MatchRequestStatus } from '@/lib/types';

export default function MatchRequestsPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getMyMatchRequests(user.id)
      .then((data) => {
        if (!cancelled) setRequests(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת הפניות נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const incoming = useMemo(() => requests.filter((request) => request.receiver_id === user?.id), [requests, user]);
  const outgoing = useMemo(() => requests.filter((request) => request.sender_id === user?.id), [requests, user]);

  const handleStatusUpdate = async (request: MatchRequest, status: MatchRequestStatus) => {
    try {
      setUpdatingId(request.id);
      setError('');
      const updated = await updateMatchRequestStatus(request, status);
      setRequests((current) => current.map((item) => (item.id === request.id ? updated : item)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'עדכון הפנייה נכשל');
    } finally {
      setUpdatingId(null);
    }
  };

  const renderRequest = (request: MatchRequest, direction: 'incoming' | 'outgoing') => (
    <div key={request.id} className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-medium">
            {direction === 'incoming'
              ? request.sender_role === 'host' ? 'פנייה ממארח' : 'פנייה ממתארח'
              : request.sender_role === 'host' ? 'פנייה למתארח' : 'פנייה למארח'}
          </p>
          <p className="text-sm text-gray-500">{formatDate(request.created_at)}</p>
        </div>
        <Badge status={request.status} />
      </div>
      {request.message && <p className="mt-2 text-sm text-gray-600">{request.message}</p>}
      {direction === 'incoming' && request.status === 'pending' && (
        <div className="mt-3 flex gap-2">
          <Button size="sm" isLoading={updatingId === request.id} onClick={() => handleStatusUpdate(request, 'approved')}>
            אשר
          </Button>
          <Button size="sm" variant="danger" isLoading={updatingId === request.id} onClick={() => handleStatusUpdate(request, 'rejected')}>
            דחה
          </Button>
        </div>
      )}
      {direction === 'outgoing' && request.status === 'pending' && (
        <div className="mt-3">
          <Button size="sm" variant="outline" isLoading={updatingId === request.id} onClick={() => handleStatusUpdate(request, 'cancelled')}>
            בטל פנייה
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">פניות</h1>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      {loading ? (
        <p className="py-8 text-center text-gray-500">טוען פניות...</p>
      ) : (
        <>
          <Card>
            <CardHeader><h2 className="font-semibold">פניות נכנסות ({incoming.length})</h2></CardHeader>
            <CardContent>
              {incoming.length === 0 ? (
                <p className="text-center text-gray-500 py-4">אין פניות נכנסות</p>
              ) : (
                <div className="space-y-3">{incoming.map((request) => renderRequest(request, 'incoming'))}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><h2 className="font-semibold">פניות יוצאות ({outgoing.length})</h2></CardHeader>
            <CardContent>
              {outgoing.length === 0 ? (
                <p className="text-center text-gray-500 py-4">אין פניות יוצאות</p>
              ) : (
                <div className="space-y-3">{outgoing.map((request) => renderRequest(request, 'outgoing'))}</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
