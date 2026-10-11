'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getHostProfileByUserId } from '@/lib/api/profiles';
import { getRelationshipStatus } from '@/lib/api/matches';
import { getStatusLabel } from '@/lib/utils';
import type { HostProfile } from '@/lib/types';
import { Bed, Mail, MapPin, Phone, Users } from 'lucide-react';

export default function PublicHostProfilePage() {
  const params = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [canViewContact, setCanViewContact] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([
      getHostProfileByUserId(params.userId),
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
        <h1 className="text-2xl font-bold">פרופיל מארח</h1>
        <Link href="/dashboard/search"><Button variant="outline">חזרה לחיפוש</Button></Link>
      </div>

      {!canViewContact && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          פרטי קשר ושכונה מדויקת יוצגו רק לאחר אישור התאמה.
        </div>
      )}

      <Card>
        <CardContent className="space-y-5 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              {profile.family_name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">משפחת {profile.family_name}</h2>
              <Badge status={profile.is_active ? 'active' : 'suspended'} />
            </div>
          </div>

          {profile.images.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profile.images.map((url) => (
                <div key={url} className="overflow-hidden rounded-lg border bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="תמונת אירוח" className="h-40 w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" /> {profile.city}{canViewContact ? `, ${profile.neighborhood}` : ''}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Users className="h-4 w-4" /> עד {profile.capacity} אורחים</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Bed className="h-4 w-4" /> {profile.includes_accommodation ? 'כולל לינה' : 'ללא לינה'}</div>
            {canViewContact && <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4" /> {profile.phone}</div>}
            {canViewContact && <div className="flex items-center gap-2 text-sm text-gray-600"><Mail className="h-4 w-4" /> {profile.email}</div>}
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">{getStatusLabel(profile.hosting_type)}</span>
            {profile.preferred_guests.map((guestType) => (
              <span key={guestType} className="rounded-full bg-green-100 px-3 py-1 text-sm">{getStatusLabel(guestType)}</span>
            ))}
          </div>

          <div>
            <h3 className="mb-2 font-medium">אודות המשפחה</h3>
            <p className="text-sm text-gray-600">{profile.description}</p>
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
