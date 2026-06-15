'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { getStore } from '@/lib/store';
import { communityProfileSchema } from '@/lib/validations';
import { MapPin, Edit3 } from 'lucide-react';

export default function CommunityProfilePage() {
  const { user } = useAuth();
  const store = getStore();
  const existing = store.communityProfiles.find((p) => p.user_id === user?.id);
  const [isEditing, setIsEditing] = useState(!existing);
  const [displayName, setDisplayName] = useState(existing?.display_name || '');
  const [city, setCity] = useState(existing?.city || '');
  const [area, setArea] = useState(existing?.area || '');
  const [bio, setBio] = useState(existing?.bio || '');
  const [age, setAge] = useState(existing?.age || 0);
  const [gender, setGender] = useState(existing?.gender || 'male');

  if (!isEditing && existing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">פרופיל קהילתי</h1>
          <Button variant="outline" onClick={() => setIsEditing(true)}><Edit3 className="h-4 w-4" /> עריכה</Button>
        </div>
        <Card>
          <CardContent className="space-y-4 pt-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-xl font-bold text-purple-700">
                {existing.display_name[0]}
              </div>
              <div>
                <h2 className="text-xl font-bold">{existing.display_name}</h2>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" /> {existing.city}, {existing.area}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">{existing.bio}</p>
            <div className="text-sm text-gray-500">{existing.age} שנים</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{existing ? 'עריכת פרופיל קהילתי' : 'יצירת פרופיל קהילתי'}</h1>
      <Card>
        <CardContent className="space-y-4 pt-4">
          <Input label="שם תצוגה" id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input label="עיר" id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          <Input label="אזור" id="area" value={area} onChange={(e) => setArea(e.target.value)} />
          <Input label="גיל" id="age" type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} />
          <Select label="מגדר" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} options={[
            { value: 'male', label: 'גבר' }, { value: 'female', label: 'אישה' }, { value: 'couple', label: 'זוג' },
          ]} />
          <div className="space-y-1">
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700">תיאור</label>
            <textarea id="bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <Button onClick={() => setIsEditing(false)}>שמירה</Button>
        </CardContent>
      </Card>
    </div>
  );
}
