'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';

export default function MatchesPage() {
  const { user } = useAuth();
  const store = getStore();
  const myMatches = store.matches.filter((m) => m.host_id === user?.id || m.guest_id === user?.id);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">התאמות</h1>

      <Card>
        <CardHeader><h2 className="font-semibold">התאמות פעילות</h2></CardHeader>
        <CardContent>
          {myMatches.length === 0 ? (
            <p className="text-center text-gray-500 py-8">אין התאמות עדיין</p>
          ) : (
            <div className="space-y-3">
              {myMatches.map((match) => {
                const host = store.hostProfiles.find((h) => h.user_id === match.host_id);
                const guest = store.guestProfiles.find((g) => g.user_id === match.guest_id);
                const req = store.matchRequests.find((r) => r.id === match.match_request_id);
                return (
                  <Card key={match.id}>
                    <CardContent className="flex items-center justify-between pt-4">
                      <div>
                        <p className="font-medium">{host ? `משפחת ${host.family_name}` : 'מארח'} ↔ {guest ? guest.first_name : 'מתארח'}</p>
                        <p className="text-xs text-gray-500">{formatDate(match.created_at)}</p>
                      </div>
                      <Badge status="active" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
