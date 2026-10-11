'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getReviews, updateReviewStatus } from '@/lib/api/reviews';
import { formatDate } from '@/lib/utils';
import { Star } from 'lucide-react';
import type { Review, ReviewStatus } from '@/lib/types';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getReviews()
      .then((data) => {
        if (!cancelled) setReviews(data);
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
  }, []);

  const handleStatusUpdate = async (reviewId: string, status: ReviewStatus) => {
    try {
      setUpdatingId(reviewId);
      setError('');
      const updated = await updateReviewStatus(reviewId, status);
      setReviews((current) => current.map((review) => (review.id === reviewId ? updated : review)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'עדכון המשוב נכשל');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ניהול משובים</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">כל המשובים</h2></CardHeader>
        <CardContent>
          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {loading ? (
            <p className="py-8 text-center text-gray-500">טוען משובים...</p>
          ) : reviews.length === 0 ? (
            <p className="py-8 text-center text-gray-500">אין משובים להצגה</p>
          ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{review.title}</p>
                    <p className="text-xs text-gray-500">{formatDate(review.created_at)}</p>
                  </div>
                  <Badge status={review.status} />
                </div>
                <div className="flex gap-0.5 my-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} className={`h-4 w-4 ${n <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <p className="text-sm text-gray-600">{review.content}</p>
                {review.status === 'pending' && (
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" isLoading={updatingId === review.id} onClick={() => handleStatusUpdate(review.id, 'approved')}>
                      אשר פרסום
                    </Button>
                    <Button size="sm" variant="danger" isLoading={updatingId === review.id} onClick={() => handleStatusUpdate(review.id, 'rejected')}>
                      דחה
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
