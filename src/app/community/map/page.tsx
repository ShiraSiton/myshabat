'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getStore } from '@/lib/store';
import { MapPin, Search } from 'lucide-react';

export default function CommunityMapPage() {
  const store = getStore();
  const [search, setSearch] = useState('');
  const profiles = store.communityProfiles.filter((p) => {
    if (!search) return true;
    return p.city.includes(search) || p.display_name.includes(search) || p.area.includes(search);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">מפת משתדלי השבת</h1>
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="חפש לפי עיר, אזור או שם..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-gray-200 bg-gray-100 p-8 text-center">
        <MapPin className="mx-auto mb-2 h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-500">מפת Google Maps תשולב כאן בהמשך</p>
        <p className="text-xs text-gray-400">בינתיים מוצגת רשימת החברים</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((p) => (
          <Card key={p.id} className="transition-shadow hover:shadow-md">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 font-bold text-purple-700">
                  {p.display_name[0]}
                </div>
                <div>
                  <p className="font-medium">{p.display_name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" /> {p.city}, {p.area}
                  </div>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">{p.bio}</p>
              <div className="mt-2 flex gap-2">
                <span className="text-xs text-gray-400">{p.age} שנים</span>
                <Button size="sm" variant="outline">שלח בקשת היכרות</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
