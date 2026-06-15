'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { getStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { reviewSchema } from '@/lib/validations';
import { Star } from 'lucide-react';

export default function ReviewsPage() {
  const { user } = useAuth();
  const store = getStore();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [error, setError] = useState('');

  const myReviews = store.reviews.filter((r) => r.reviewer_id === user?.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = reviewSchema.safeParse({ title, content, rating });
    if (!result.success) { setError(result.error.issues[0].message); return; }
    setIsOpen(false);
    setTitle('');
    setContent('');
    setRating(0);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">משובים</h1>
        <Button onClick={() => setIsOpen(true)}>כתיבת משוב</Button>
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="כתיבת משוב">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          <Input label="כותרת" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">תוכן</label>
            <textarea id="content" rows={4} value={content} onChange={(e) => setContent(e.target.value)} required className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">דירוג</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}>
                  <Star className={`h-6 w-6 ${n <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
          </div>
          <Button type="submit">שליחת משוב</Button>
        </form>
      </Modal>

      <Card>
        <CardHeader><h2 className="font-semibold">המשובים שלי</h2></CardHeader>
        <CardContent>
          {myReviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">עדיין לא כתבת משובים</p>
          ) : (
            <div className="space-y-3">
              {myReviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{review.title}</h3>
                      <Badge status={review.status} />
                    </div>
                    <div className="flex gap-0.5 my-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star key={n} className={`h-4 w-4 ${n <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
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
