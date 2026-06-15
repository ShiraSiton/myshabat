'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getStore } from '@/lib/store';
import { getStatusLabel } from '@/lib/utils';
import { MapPin, Phone, Users, Bed } from 'lucide-react';

export default function HostProfilePage() {
  const { user } = useAuth();
  const store = getStore();
  const profile = store.hostProfiles.find((p) => p.user_id === user?.id);
  const [isEditing, setIsEditing] = useState(false);

  if (!profile) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">פרופיל מארח</h1>
        <Card><CardContent className="py-8 text-center"><p className="text-gray-500">טרם יצרת פרופיל מארח.</p></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">פרופיל מארח</h1>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline">
          {isEditing ? 'ביטול' : 'עריכת פרופיל'}
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-4 pt-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-bold text-blue-700">
              {profile.family_name[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold">משפחת {profile.family_name}</h2>
              <Badge status={profile.is_active ? 'active' : 'suspended'} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2 text-sm text-gray-600"><MapPin className="h-4 w-4" /> {profile.city}, {profile.neighborhood}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Users className="h-4 w-4" /> עד {profile.capacity} אורחים</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Bed className="h-4 w-4" /> {profile.includes_accommodation ? 'כולל לינה' : 'ללא לינה'}</div>
            <div className="flex items-center gap-2 text-sm text-gray-600"><Phone className="h-4 w-4" /> {profile.phone}</div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm">{getStatusLabel(profile.hosting_type)}</span>
            {profile.preferred_guests.map((g) => (
              <span key={g} className="rounded-full bg-green-100 px-3 py-1 text-sm">{getStatusLabel(g)}</span>
            ))}
          </div>

          <div>
            <h3 className="mb-2 font-medium">אודות</h3>
            <p className="text-sm text-gray-600">{profile.description}</p>
          </div>

          <div className="flex gap-4 text-sm text-gray-500">
            <span>⭐ {profile.avg_rating} / 5</span>
            <span>🛏️ {profile.hosting_count} אירוחים</span>
            <span>📅 הצטרף: {new Date(profile.joined_at).toLocaleDateString('he-IL')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
