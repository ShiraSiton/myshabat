'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { Star } from 'lucide-react';

export default function AdminReviewsPage() {
  const store = getStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ניהול משובים</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">כל המשובים</h2></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {store.reviews.map((review) => (
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
                    <Button size="sm">אשר פרסום</Button>
                    <Button size="sm" variant="danger">דחה</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
