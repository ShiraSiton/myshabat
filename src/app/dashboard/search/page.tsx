'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { getStore } from '@/lib/store';
import { getStatusLabel } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { MapPin, Star, Users, Bed, Search as SearchIcon } from 'lucide-react';
import type { HostProfile, GuestProfile } from '@/lib/types';

const cityOptions = [
  { value: '', label: 'הכל' },
  { value: 'ירושלים', label: 'ירושלים' },
  { value: 'בני ברק', label: 'בני ברק' },
  { value: 'מודיעין', label: 'מודיעין' },
  { value: 'תל אביב', label: 'תל אביב' },
  { value: 'חיפה', label: 'חיפה' },
];

const genderOptions = [
  { value: '', label: 'הכל' },
  { value: 'male', label: 'גברים' },
  { value: 'female', label: 'נשים' },
  { value: 'couple', label: 'זוגות' },
];

export default function SearchPage() {
  const { isHost } = useAuth();
  const store = getStore();
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');

  const hosts = store.hostProfiles.filter((h) => {
    if (city && h.city !== city) return false;
    if (gender && !h.preferred_guests.includes(gender as any)) return false;
    return h.is_active;
  });

  const guests = store.guestProfiles.filter((g) => {
    if (city && g.city !== city) return false;
    if (gender && g.gender !== gender) return false;
    return g.is_active;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">חיפוש</h1>

      <Card>
        <CardContent className="flex flex-wrap gap-4 pt-4">
          <Select
            label="עיר"
            options={cityOptions}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <Select
            label="מגדר"
            options={genderOptions}
            value={gender}
            onChange={(e) => setGender(e.target.value)}
          />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {isHost ? 'מתארחים פוטנציאליים' : 'מארחים'} ({isHost ? guests.length : hosts.length})
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {(isHost ? guests : hosts).map((profile: any) => (
            <Card key={profile.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-4">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                    {'family_name' in profile ? profile.family_name[0] : profile.first_name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{'family_name' in profile ? `משפחת ${profile.family_name}` : profile.first_name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3" /> {profile.city}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 text-xs text-gray-600">
                  <span className="rounded bg-gray-100 px-2 py-1">{'preferred_guests' in profile ? profile.preferred_guests.map(getStatusLabel).join(', ') : getStatusLabel(profile.gender)}</span>
                  <span className="rounded bg-gray-100 px-2 py-1">{'hosting_type' in profile ? getStatusLabel(profile.hosting_type) : `${profile.age} שנים`}</span>
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                  {'description' in profile ? profile.description : profile.spiritual_journey}
                </p>
                {'avg_rating' in profile && profile.avg_rating > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-yellow-600">
                    <Star className="h-4 w-4 fill-current" /> {profile.avg_rating}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
