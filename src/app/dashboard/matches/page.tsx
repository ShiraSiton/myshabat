'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getMyMatches } from '@/lib/api/matches';
import { formatDate } from '@/lib/utils';
import type { Match } from '@/lib/types';

export default function MatchesPage() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getMyMatches(user.id)
      .then((data) => {
        if (!cancelled) setMatches(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת ההתאמות נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">התאמות</h1>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Card>
        <CardHeader><h2 className="font-semibold">התאמות פעילות</h2></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">טוען התאמות...</p>
          ) : matches.length === 0 ? (
            <p className="text-center text-gray-500 py-8">אין התאמות עדיין</p>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <Card key={match.id}>
                  <CardContent className="flex items-center justify-between pt-4">
                    <div>
                      <p className="font-medium">התאמה מאושרת</p>
                      <p className="text-xs text-gray-500">{formatDate(match.created_at)}</p>
                    </div>
                    <Badge status="active" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
