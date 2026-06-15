'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getStore } from '@/lib/store';
import { MessageCircle } from 'lucide-react';

export default function CommunityChatPage() {
  const store = getStore();
  const approved = store.communityConnections.filter((c) => c.status === 'approved');

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">צ'אט קהילתי</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">חיבורים פעילים</h2></CardHeader>
        <CardContent>
          {approved.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <MessageCircle className="mx-auto mb-2 h-8 w-8" />
              <p>עדיין אין חיבורים מאושרים</p>
              <p className="text-sm">שלח בקשת היכרות דרך מפת משתדלי השבת</p>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">צ'אט קהילתי יפותח בשלב הבא</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
