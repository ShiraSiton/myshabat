'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getMyConversations } from '@/lib/api/messages';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import type { Conversation } from '@/lib/types';

export default function ChatListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getMyConversations(user.id)
      .then((data) => {
        if (!cancelled) setConversations(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת השיחות נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">צ׳אט</h1>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Card>
        <CardHeader><h2 className="font-semibold">השיחות שלי</h2></CardHeader>
        <CardContent>
          {loading ? (
            <p className="py-8 text-center text-gray-500">טוען שיחות...</p>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <MessageCircle className="mx-auto mb-2 h-8 w-8" />
              <p>אין שיחות פעילות</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const otherId = conversation.participant_one === user?.id ? conversation.participant_two : conversation.participant_one;
                return (
                  <Link key={conversation.id} href={`/dashboard/chat/${conversation.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                      <div>
                        <p className="font-medium">שיחה עם משתמש {otherId.slice(0, 8)}</p>
                        <p className="text-sm text-gray-500">לחצי לפתיחת השיחה</p>
                      </div>
                      <p className="text-xs text-gray-400">{formatDate(conversation.updated_at)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
