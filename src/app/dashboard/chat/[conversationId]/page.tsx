'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { getConversationMessages, sendMessage } from '@/lib/api/messages';
import { formatDate } from '@/lib/utils';
import type { Message } from '@/lib/types';

export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getConversationMessages(params.conversationId)
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'טעינת ההודעות נכשלה');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params.conversationId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user || !content.trim()) return;

    try {
      setSending(true);
      setError('');
      const message = await sendMessage({
        conversationId: params.conversationId,
        senderId: user.id,
        content: content.trim(),
      });
      setMessages((current) => [...current, message]);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שליחת ההודעה נכשלה');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">שיחה</h1>
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <Card>
        <CardHeader><h2 className="font-semibold">הודעות</h2></CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="py-8 text-center text-gray-500">טוען הודעות...</p>
          ) : messages.length === 0 ? (
            <p className="py-8 text-center text-gray-500">אין הודעות עדיין</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => {
                const isMine = message.sender_id === user?.id;
                return (
                  <div key={message.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-xl px-4 py-2 text-sm ${isMine ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                      <p>{message.content}</p>
                      <p className={`mt-1 text-xs ${isMine ? 'text-blue-100' : 'text-gray-500'}`}>{formatDate(message.created_at)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
            <input
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="כתיבת הודעה..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <Button type="submit" isLoading={sending}>שליחה</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
