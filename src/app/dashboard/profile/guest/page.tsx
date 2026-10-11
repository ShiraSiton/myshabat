'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getMyGuestProfile, saveGuestProfile } from '@/lib/api/profiles';
import { getStatusLabel } from '@/lib/utils';
import { guestProfileSchema } from '@/lib/validations';
import type { Gender, GuestProfile, MaritalStatus } from '@/lib/types';
import { MapPin, Phone, Users, Bed } from 'lucide-react';

interface GuestProfileForm {
  first_name: string;
  age: string;
  gender: Gender;
  city: string;
  marital_status: MaritalStatus;
  spiritual_journey: string;
  people_count: string;
  needs_accommodation: boolean;
  bio: string;
  phone: string;
}

const emptyForm: GuestProfileForm = {
  first_name: '',
  age: '',
  gender: 'male',
  city: '',
  marital_status: 'single',
  spiritual_journey: '',
  people_count: '1',
  needs_accommodation: false,
  bio: '',
  phone: '',
};

function profileToForm(profile: GuestProfile): GuestProfileForm {
  return {
    first_name: profile.first_name,
    age: String(profile.age),
    gender: profile.gender,
    city: profile.city,
    marital_status: profile.marital_status,
    spiritual_journey: profile.spiritual_journey,
    people_count: String(profile.people_count),
    needs_accommodation: profile.needs_accommodation,
    bio: profile.bio,
    phone: profile.phone,
  };
}

export default function GuestProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<GuestProfile | null>(null);
  const [form, setForm] = useState<GuestProfileForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getMyGuestProfile(user.id)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        if (data) {
          setForm(profileToForm(data));
          setIsEditing(false);
        }
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
  }, [user]);

  const updateField = <K extends keyof GuestProfileForm>(field: K, value: GuestProfileForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const payload = {
      first_name: form.first_name,
      age: Number(form.age),
      gender: form.gender,
      city: form.city,
      marital_status: form.marital_status,
      spiritual_journey: form.spiritual_journey,
      people_count: Number(form.people_count),
      needs_accommodation: form.needs_accommodation,
      bio: form.bio,
      phone: form.phone,
    };

    const result = guestProfileSchema.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      setSaving(true);
      setError('');
      const saved = await saveGuestProfile({
        ...result.data,
        user_id: user.id,
        email: user.email,
        is_active: true,
      });
      setProfile(saved);
      setForm(profileToForm(saved));
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שמירת הפרופיל נכשלה');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="py-8 text-center text-gray-500">טוען פרופיל...</p>;
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{profile ? 'עריכת פרופיל מתארח' : 'יצירת פרופיל מתארח'}</h1>
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="שם פרטי" value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} required />
                <Input label="גיל" type="number" value={form.age} onChange={(e) => updateField('age', e.target.value)} required />
                <Select label="מגדר" value={form.gender} onChange={(e) => updateField('gender', e.target.value as Gender)} options={[
                  { value: 'male', label: 'גבר' },
                  { value: 'female', label: 'אישה' },
                  { value: 'couple', label: 'זוג' },
                ]} />
                <Select label="מצב משפחתי" value={form.marital_status} onChange={(e) => updateField('marital_status', e.target.value as MaritalStatus)} options={[
                  { value: 'single', label: 'רווק/ה' },
                  { value: 'married', label: 'נשוי/אה' },
                  { value: 'divorced', label: 'גרוש/ה' },
                  { value: 'widowed', label: 'אלמן/ה' },
                ]} />
                <Input label="עיר מגורים" value={form.city} onChange={(e) => updateField('city', e.target.value)} required />
                <Input label="מספר אנשים" type="number" value={form.people_count} onChange={(e) => updateField('people_count', e.target.value)} required />
                <Input label="טלפון" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.needs_accommodation} onChange={(e) => updateField('needs_accommodation', e.target.checked)} />
                צריך לינה
              </label>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">תיאור תהליך ההתחזקות</label>
                <textarea rows={4} value={form.spiritual_journey} onChange={(e) => updateField('spiritual_journey', e.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">תיאור אישי</label>
                <textarea rows={4} value={form.bio} onChange={(e) => updateField('bio', e.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={saving}>שמירה</Button>
                {profile && <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>ביטול</Button>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">פרופיל מתארח</h1>
        <Button variant="outline" onClick={() => setIsEditing(true)}>עריכת פרופיל</Button>
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
