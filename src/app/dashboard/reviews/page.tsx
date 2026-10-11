'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/lib/utils';
import { reviewSchema } from '@/lib/validations';
import { createReview, getMyReviews } from '@/lib/api/reviews';
import { getMyMatches } from '@/lib/api/matches';
import type { Match, Review } from '@/lib/types';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    Promise.all([getMyReviews(user.id), getMyMatches(user.id)])
      .then(([reviewsData, matchesData]) => {
        if (cancelled) return;
        setReviews(reviewsData);
        setMatches(matchesData);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת המשובים נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  const reviewableMatches = useMemo(() => {
    const reviewedMatchIds = new Set(reviews.map((review) => review.match_id));
    return matches.filter((match) => !reviewedMatchIds.has(match.id));
  }, [matches, reviews]);

  const selectedMatch = reviewableMatches.find((match) => match.id === selectedMatchId);

  const resetForm = () => {
    setSelectedMatchId('');
    setTitle('');
    setContent('');
    setRating(0);
  };

  const handleOpenModal = () => {
    setError('');
    setSelectedMatchId(reviewableMatches[0]?.id || '');
    setIsOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !selectedMatch) return;

    const result = reviewSchema.safeParse({ title, content, rating });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    const revieweeId = selectedMatch.host_id === user.id ? selectedMatch.guest_id : selectedMatch.host_id;

    try {
      setSaving(true);
      setError('');
      const saved = await createReview({
        reviewerId: user.id,
        revieweeId,
        matchId: selectedMatch.id,
        ...result.data,
      });
      setReviews((current) => [saved, ...current]);
      resetForm();
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שמירת המשוב נכשלה');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">משובים</h1>
        <Button onClick={handleOpenModal} disabled={loading || reviewableMatches.length === 0}>
          כתיבת משוב
        </Button>
      </div>

      {error && !isOpen && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="כתיבת משוב">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Select
            label="התאמה"
            value={selectedMatchId}
            onChange={(event) => setSelectedMatchId(event.target.value)}
            options={reviewableMatches.map((match) => ({
              value: match.id,
              label: `התאמה מתאריך ${formatDate(match.created_at)}`,
            }))}
          />
          <Input label="כותרת" id="title" value={title} onChange={(event) => setTitle(event.target.value)} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">תוכן</label>
            <textarea
              id="content"
              rows={4}
              value={content}
              onChange={(event) => setContent(event.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">דירוג</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((number) => (
                <button key={number} type="button" onClick={() => setRating(number)}>
                  <Star className={`h-6 w-6 ${number <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <Button type="submit" isLoading={saving}>שליחת משוב</Button>
        </form>
      </Modal>

      <Card>
        <CardHeader><h2 className="font-semibold">המשובים שלי</h2></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500 py-8">טוען משובים...</p>
          ) : reviews.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>עדיין לא כתבת משובים</p>
              {matches.length === 0 && <p className="mt-1 text-sm">ניתן לכתוב משוב רק לאחר התאמה מאושרת.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{review.title}</h3>
                      <Badge status={review.status} />
                    </div>
                    <div className="flex gap-0.5 my-2">
                      {[1, 2, 3, 4, 5].map((number) => (
                        <Star key={number} className={`h-4 w-4 ${number <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{review.content}</p>
                    <p className="mt-2 text-xs text-gray-400">{formatDate(review.created_at)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
