'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStore } from '@/lib/store';
import { getStatusLabel } from '@/lib/utils';
import { MapPin, Phone, Users, Bed, Heart } from 'lucide-react';

export default function GuestProfilePage() {
  const { user } = useAuth();
  const store = getStore();
  const profile = store.guestProfiles.find((p) => p.user_id === user?.id);

  if (!profile) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">פרופיל מתארח</h1>
        <Card><CardContent className="py-8 text-center"><p className="text-gray-500">טרם יצרת פרופיל מתארח.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">פרופיל מתארח</h1>
        <Button variant="outline">עריכת פרופיל</Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4">
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
            <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4" /> {profile.phone}</div>
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
