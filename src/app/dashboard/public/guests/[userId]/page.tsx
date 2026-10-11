'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getGuestProfileByUserId } from '@/lib/api/profiles';
import { getRelationshipStatus } from '@/lib/api/matches';
import { getStatusLabel } from '@/lib/utils';
import type { GuestProfile } from '@/lib/types';
import { Bed, Mail, MapPin, Phone, Users } from 'lucide-react';

export default function PublicGuestProfilePage() {
  const params = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [canViewContact, setCanViewContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([
      getGuestProfileByUserId(params.userId),
      user.id === params.userId ? Promise.resolve('matched') : getRelationshipStatus(user.id, params.userId),
    ])
      .then(([profileData, relationship]) => {
        if (cancelled) return;
        setProfile(profileData);
        setCanViewContact(user.id === params.userId || relationship === 'matched');
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת הפרופיל נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.userId, user]);

  if (loading) return <p className="py-8 text-center text-gray-500">טוען פרופיל...</p>;
  if (error) return <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>;
  if (!profile) return <p className="py-8 text-center text-gray-500">הפרופיל לא נמצא</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">פרופיל מתארח</h1>
        <Link href="/dashboard/search"><Button variant="outline">חזרה לחיפוש</Button></Link>
      </div>

      {!canViewContact && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          פרטי קשר יוצגו רק לאחר אישור התאמה.
        </div>
      )}

      <Card>
        <CardContent className="space-y-5 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-xl font-bold text-green-700">
              {profile.first_name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">{profile.first_name}</h2>
              <p className="text-sm text-gray-500">{profile.age} | {getStatusLabel(profile.gender)} | {getStatusLabel(profile.marital_status)}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="h-4 w-4" /> {profile.city}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Users className="h-4 w-4" /> {profile.people_count} נפשות</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Bed className="h-4 w-4" /> {profile.needs_accommodation ? 'צריך לינה' : 'לא צריך לינה'}</div>
            {canViewContact && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4" /> {profile.phone}</div>}
            {canViewContact && <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="h-4 w-4" /> {profile.email}</div>}
          </div>

          <div>
            <h3 className="mb-2 font-medium">תהליך התחזקות</h3>
            <p className="text-sm text-gray-600">{profile.spiritual_journey}</p>
          </div>

          <div>
            <h3 className="mb-2 font-medium">תיאור אישי</h3>
            <p className="text-sm text-gray-600">{profile.bio}</p>
          </div>

          <div className="flex gap-4 text-sm text-gray-500">
            <span>⭐ {profile.avg_rating} / 5</span>
            <span>🛏️ {profile.hosting_count} אירוחים</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
