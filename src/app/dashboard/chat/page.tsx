'use client';

import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export default function ChatListPage() {
  const { user } = useAuth();
  const store = getStore();
  const myConversations = store.conversations.filter(
    (c) => c.participant_one === user?.id || c.participant_two === user?.id
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">צ'אט</h1>
      <Card>
        <CardHeader><h2 className="font-semibold">השיחות שלי</h2></CardHeader>
        <CardContent>
          {myConversations.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <MessageCircle className="mx-auto mb-2 h-8 w-8" />
              <p>אין שיחות פעילות</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myConversations.map((conv) => {
                const otherId = conv.participant_one === user?.id ? conv.participant_two : conv.participant_one;
                const otherUser = store.users.find((u) => u.id === otherId);
                const lastMsg = [...store.messages].reverse().find((m) => m.conversation_id === conv.id);
                return (
                  <Link key={conv.id} href={`/chat/${conv.id}`}>
                    <div className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50">
                      <div>
                        <p className="font-medium">{otherUser?.email || 'משתמש'}</p>
                        {lastMsg && <p className="text-sm text-gray-500 truncate max-w-xs">{lastMsg.content}</p>}
                      </div>
                      {lastMsg && <p className="text-xs text-gray-400">{formatDate(lastMsg.created_at)}</p>}
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
