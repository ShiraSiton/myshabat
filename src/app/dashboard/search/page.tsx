'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { getStatusLabel } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { sendEmail } from '@/lib/api/email';
import {
  createMatchRequest,
  getActiveGuestProfiles,
  getActiveHostProfiles,
  getRelationshipsForUsers,
  type RelationshipStatus,
} from '@/lib/api/matches';
import { MapPin, Star } from 'lucide-react';
import type { Gender, GuestProfile, HostProfile, HostingType, MaritalStatus } from '@/lib/types';

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

const accommodationOptions = [
  { value: '', label: 'הכל' },
  { value: 'yes', label: 'כולל/צריך לינה' },
  { value: 'no', label: 'ללא/לא צריך לינה' },
];

const hostingTypeOptions = [
  { value: '', label: 'הכל' },
  { value: 'meals_only', label: 'סעודות בלבד' },
  { value: 'full_shabbat', label: 'שבת מלאה' },
];

const maritalStatusOptions = [
  { value: '', label: 'הכל' },
  { value: 'single', label: 'רווק/ה' },
  { value: 'married', label: 'נשוי/אה' },
  { value: 'divorced', label: 'גרוש/ה' },
  { value: 'widowed', label: 'אלמן/ה' },
];

type SearchProfile = HostProfile | GuestProfile;

function isHostProfile(profile: SearchProfile): profile is HostProfile {
  return 'family_name' in profile;
}

function getRelationshipLabel(status: RelationshipStatus) {
  const labels: Record<RelationshipStatus, string> = {
    none: '',
    pending: 'בקשה ממתינה',
    approved: 'בקשה אושרה',
    rejected: 'בקשה נדחתה',
    cancelled: 'בקשה בוטלה',
    matched: 'קיימת התאמה',
  };

  return labels[status];
}

export default function SearchPage() {
  const { user, isHost } = useAuth();
  const [hosts, setHosts] = useState<HostProfile[]>([]);
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [relationships, setRelationships] = useState<Record<string, RelationshipStatus>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState('');
  const [ageFrom, setAgeFrom] = useState('');
  const [ageTo, setAgeTo] = useState('');
  const [accommodation, setAccommodation] = useState('');
  const [hostingType, setHostingType] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<SearchProfile | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([getActiveHostProfiles(), getActiveGuestProfiles()])
      .then(async ([hostData, guestData]) => {
        if (cancelled) return;
        setHosts(hostData.filter((host) => host.user_id !== user.id));
        setGuests(guestData.filter((guest) => guest.user_id !== user.id));

        const targetIds = isHost
          ? guestData.map((guest) => guest.user_id)
          : hostData.map((host) => host.user_id);
        const relationshipData = await getRelationshipsForUsers(user.id, targetIds);
        if (!cancelled) setRelationships(relationshipData);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת תוצאות החיפוש נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isHost, user]);

  const results = useMemo(() => {
    const minAge = ageFrom ? Number(ageFrom) : null;
    const maxAge = ageTo ? Number(ageTo) : null;

    if (isHost) {
      return guests.filter((guest) => {
        if (city && guest.city !== city) return false;
        if (gender && guest.gender !== gender) return false;
        if (minAge !== null && guest.age < minAge) return false;
        if (maxAge !== null && guest.age > maxAge) return false;
        if (accommodation === 'yes' && !guest.needs_accommodation) return false;
        if (accommodation === 'no' && guest.needs_accommodation) return false;
        if (maritalStatus && guest.marital_status !== maritalStatus) return false;
        return guest.is_active;
      });
    }

    return hosts.filter((host) => {
      if (city && host.city !== city) return false;
      if (gender && !host.preferred_guests.includes(gender as Gender)) return false;
      if (minAge !== null && host.max_age < minAge) return false;
      if (maxAge !== null && host.min_age > maxAge) return false;
      if (accommodation === 'yes' && !host.includes_accommodation) return false;
      if (accommodation === 'no' && host.includes_accommodation) return false;
      if (hostingType && host.hosting_type !== hostingType) return false;
      return host.is_active;
    });
  }, [accommodation, ageFrom, ageTo, city, gender, guests, hosts, hostingType, isHost, maritalStatus]);

  const handleSendRequest = async () => {
    if (!user || !selectedProfile || user.role === 'admin') return;

    const relationship = relationships[selectedProfile.user_id] || 'none';
    if (relationship !== 'none' && relationship !== 'rejected' && relationship !== 'cancelled') {
      setError('כבר קיימת בקשה או התאמה מול המשתמש הזה');
      setSelectedProfile(null);
      return;
    }

    try {
      setSending(true);
      setError('');
      await createMatchRequest({
        senderId: user.id,
        receiverId: selectedProfile.user_id,
        senderRole: user.role,
        message,
      });
      await sendEmail({
        to: selectedProfile.email,
        subject: 'בקשת התאמה חדשה ב־MyShabat',
        text: 'שלום, קיבלת בקשת התאמה חדשה במערכת MyShabat. ניתן להתחבר למערכת ולצפות בפנייה.',
        html: '<p>שלום,</p><p>קיבלת בקשת התאמה חדשה במערכת MyShabat.</p><p>ניתן להתחבר למערכת ולצפות בפנייה.</p>',
      }).catch(() => null);
      setRelationships((current) => ({ ...current, [selectedProfile.user_id]: 'pending' }));
      setSuccessMessage('בקשת ההתאמה נשלחה בהצלחה');
      setSelectedProfile(null);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שליחת הבקשה נכשלה');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">חיפוש</h1>

      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      {successMessage && <div className="rounded-lg bg-green-50 p-3 text-sm text-green-700">{successMessage}</div>}

      <Modal isOpen={!!selectedProfile} onClose={() => setSelectedProfile(null)} title="שליחת בקשת התאמה">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ניתן לצרף הודעה אישית לצד השני. פרטי קשר ייחשפו רק לאחר אישור הבקשה.
          </p>
          <textarea
            rows={4}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="הודעה אישית (רשות)"
            className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <Button onClick={handleSendRequest} isLoading={sending}>שליחה</Button>
            <Button variant="outline" onClick={() => setSelectedProfile(null)}>ביטול</Button>
          </div>
        </div>
      </Modal>

      <Card>
        <CardContent className="grid gap-4 pt-4 md:grid-cols-2 lg:grid-cols-4">
          <Select label="עיר" options={cityOptions} value={city} onChange={(event) => setCity(event.target.value)} />
          <Select label="מגדר" options={genderOptions} value={gender} onChange={(event) => setGender(event.target.value)} />
          <Input label="גיל מ־" type="number" value={ageFrom} onChange={(event) => setAgeFrom(event.target.value)} />
          <Input label="גיל עד" type="number" value={ageTo} onChange={(event) => setAgeTo(event.target.value)} />
          <Select label="לינה" options={accommodationOptions} value={accommodation} onChange={(event) => setAccommodation(event.target.value)} />
          {!isHost && <Select label="סוג אירוח" options={hostingTypeOptions} value={hostingType} onChange={(event) => setHostingType(event.target.value as HostingType | '')} />}
          {isHost && <Select label="מצב משפחתי" options={maritalStatusOptions} value={maritalStatus} onChange={(event) => setMaritalStatus(event.target.value as MaritalStatus | '')} />}
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setCity('');
                setGender('');
                setAgeFrom('');
                setAgeTo('');
                setAccommodation('');
                setHostingType('');
                setMaritalStatus('');
              }}
            >
              ניקוי סינון
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-lg font-semibold">
          {isHost ? 'מתארחים פוטנציאליים' : 'מארחים'} ({results.length})
        </h2>
        {loading ? (
          <p className="py-8 text-center text-gray-500">טוען תוצאות...</p>
        ) : results.length === 0 ? (
          <p className="py-8 text-center text-gray-500">לא נמצאו תוצאות מתאימות</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {results.map((profile) => {
              const relationship = relationships[profile.user_id] || 'none';
              const canSendRequest = relationship === 'none' || relationship === 'rejected' || relationship === 'cancelled';
              const publicHref = isHostProfile(profile)
                ? `/dashboard/public/hosts/${profile.user_id}`
                : `/dashboard/public/guests/${profile.user_id}`;

              return (
                <Card key={profile.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="pt-4">
                    <div className="mb-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {isHostProfile(profile) ? profile.family_name[0] : profile.first_name[0]}
                      </div>
                      <div>
                        <p className="font-medium">{isHostProfile(profile) ? `משפחת ${profile.family_name}` : profile.first_name}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" /> {profile.city}
                        </div>
                      </div>
                    </div>

                    {isHostProfile(profile) && profile.images.length > 0 && (
                      <div className="mb-3 overflow-hidden rounded-lg border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={profile.images[0]} alt="תמונת אירוח" className="h-32 w-full object-cover" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1 text-xs text-gray-600">
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {isHostProfile(profile) ? profile.preferred_guests.map(getStatusLabel).join(', ') : getStatusLabel(profile.gender)}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {isHostProfile(profile) ? getStatusLabel(profile.hosting_type) : `${profile.age} שנים`}
                      </span>
                      <span className="rounded bg-gray-100 px-2 py-1">
                        {isHostProfile(profile)
                          ? profile.includes_accommodation ? 'כולל לינה' : 'ללא לינה'
                          : profile.needs_accommodation ? 'צריך לינה' : 'לא צריך לינה'}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm text-gray-600">
                      {isHostProfile(profile) ? profile.description : profile.spiritual_journey}
                    </p>
                    {profile.avg_rating > 0 && (
                      <div className="mt-2 flex items-center gap-1 text-sm text-yellow-600">
                        <Star className="h-4 w-4 fill-current" /> {profile.avg_rating}
                      </div>
                    )}
                    {relationship !== 'none' && (
                      <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
                        {getRelationshipLabel(relationship)}
                      </div>
                    )}
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <Link href={publicHref}>
                        <Button className="w-full" size="sm" variant="outline">צפייה בפרופיל</Button>
                      </Link>
                      <Button className="w-full" size="sm" variant="outline" disabled={!canSendRequest} onClick={() => setSelectedProfile(profile)}>
                        שליחת בקשה
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
