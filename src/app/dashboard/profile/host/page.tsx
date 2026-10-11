'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { getMyHostProfile, saveHostProfile, uploadHostImage } from '@/lib/api/profiles';
import { getStatusLabel } from '@/lib/utils';
import { hostProfileSchema } from '@/lib/validations';
import type { Gender, HostProfile, HostingType } from '@/lib/types';
import { MapPin, Phone, Users, Bed } from 'lucide-react';

interface HostProfileForm {
  family_name: string;
  city: string;
  neighborhood: string;
  capacity: string;
  preferred_guests: Gender[];
  min_age: string;
  max_age: string;
  includes_accommodation: boolean;
  hosting_type: HostingType;
  description: string;
  phone: string;
}

const emptyForm: HostProfileForm = {
  family_name: '',
  city: '',
  neighborhood: '',
  capacity: '1',
  preferred_guests: [],
  min_age: '18',
  max_age: '120',
  includes_accommodation: false,
  hosting_type: 'full_shabbat',
  description: '',
  phone: '',
};

const guestTypes: { value: Gender; label: string }[] = [
  { value: 'male', label: 'גברים' },
  { value: 'female', label: 'נשים' },
  { value: 'couple', label: 'זוגות' },
];

function profileToForm(profile: HostProfile): HostProfileForm {
  return {
    family_name: profile.family_name,
    city: profile.city,
    neighborhood: profile.neighborhood,
    capacity: String(profile.capacity),
    preferred_guests: profile.preferred_guests,
    min_age: String(profile.min_age),
    max_age: String(profile.max_age),
    includes_accommodation: profile.includes_accommodation,
    hosting_type: profile.hosting_type,
    description: profile.description,
    phone: profile.phone,
  };
}

export default function HostProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HostProfile | null>(null);
  const [form, setForm] = useState<HostProfileForm>(emptyForm);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getMyHostProfile(user.id)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        if (data) {
          setForm(profileToForm(data));
          setImageUrls(data.images || []);
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

  const updateField = <K extends keyof HostProfileForm>(field: K, value: HostProfileForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const togglePreferredGuest = (guestType: Gender) => {
    setForm((current) => ({
      ...current,
      preferred_guests: current.preferred_guests.includes(guestType)
        ? current.preferred_guests.filter((item) => item !== guestType)
        : [...current.preferred_guests, guestType],
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !event.target.files?.length) return;

    try {
      setUploadingImage(true);
      setError('');
      const files = Array.from(event.target.files);
      const uploaded = await Promise.all(files.map((file) => uploadHostImage(user.id, file)));
      setImageUrls((current) => [...current, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'העלאת התמונה נכשלה');
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const removeImage = (url: string) => {
    setImageUrls((current) => current.filter((item) => item !== url));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const payload = {
      family_name: form.family_name,
      city: form.city,
      neighborhood: form.neighborhood,
      capacity: Number(form.capacity),
      preferred_guests: form.preferred_guests,
      min_age: Number(form.min_age),
      max_age: Number(form.max_age),
      includes_accommodation: form.includes_accommodation,
      hosting_type: form.hosting_type,
      description: form.description,
      phone: form.phone,
    };

    const result = hostProfileSchema.safeParse(payload);
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    try {
      setSaving(true);
      setError('');
      const saved = await saveHostProfile({
        ...result.data,
        user_id: user.id,
        email: user.email,
        images: imageUrls,
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
        <h1 className="text-2xl font-bold">{profile ? 'עריכת פרופיל מארח' : 'יצירת פרופיל מארח'}</h1>
        <Card>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="שם משפחה" value={form.family_name} onChange={(e) => updateField('family_name', e.target.value)} required />
                <Input label="עיר" value={form.city} onChange={(e) => updateField('city', e.target.value)} required />
                <Input label="שכונה" value={form.neighborhood} onChange={(e) => updateField('neighborhood', e.target.value)} required />
                <Input label="מספר מקומות אירוח" type="number" value={form.capacity} onChange={(e) => updateField('capacity', e.target.value)} required />
                <Input label="גיל מינימלי" type="number" value={form.min_age} onChange={(e) => updateField('min_age', e.target.value)} required />
                <Input label="גיל מקסימלי" type="number" value={form.max_age} onChange={(e) => updateField('max_age', e.target.value)} required />
                <Input label="טלפון" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} required />
                <Select label="סוג אירוח" value={form.hosting_type} onChange={(e) => updateField('hosting_type', e.target.value as HostingType)} options={[
                  { value: 'meals_only', label: 'סעודות בלבד' },
                  { value: 'full_shabbat', label: 'שבת מלאה' },
                ]} />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">סוג אורחים רצוי</p>
                <div className="flex flex-wrap gap-4">
                  {guestTypes.map((guestType) => (
                    <label key={guestType.value} className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={form.preferred_guests.includes(guestType.value)} onChange={() => togglePreferredGuest(guestType.value)} />
                      {guestType.label}
                    </label>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.includes_accommodation} onChange={(e) => updateField('includes_accommodation', e.target.checked)} />
                כולל לינה
              </label>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">תיאור המשפחה</label>
                <textarea rows={5} value={form.description} onChange={(e) => updateField('description', e.target.value)} className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">תמונות</label>
                  <Input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={uploadingImage} />
                  <p className="text-xs text-gray-500">התמונות יוצגו בפרופיל הציבורי. מומלץ להעלות תמונות כלליות של אווירת האירוח.</p>
                </div>
                {imageUrls.length > 0 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {imageUrls.map((url) => (
                      <div key={url} className="overflow-hidden rounded-lg border bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="תמונת אירוח" className="h-32 w-full object-cover" />
                        <button type="button" onClick={() => removeImage(url)} className="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                          הסרה
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button type="submit" isLoading={saving || uploadingImage}>שמירה</Button>
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
        <h1 className="text-2xl font-bold">פרופיל מארח</h1>
        <Button onClick={() => setIsEditing(true)} variant="outline">עריכת פרופיל</Button>
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
            {profile.preferred_guests.map((guestType) => (
              <span key={guestType} className="rounded-full bg-green-100 px-3 py-1 text-sm">{getStatusLabel(guestType)}</span>
            ))}
          </div>

          <div>
            <h3 className="mb-2 font-medium">אודות</h3>
            <p className="text-sm text-gray-600">{profile.description}</p>
          </div>

          {profile.images.length > 0 && (
            <div>
              <h3 className="mb-2 font-medium">תמונות</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {profile.images.map((url) => (
                  <div key={url} className="overflow-hidden rounded-lg border bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="תמונת אירוח" className="h-36 w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

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
