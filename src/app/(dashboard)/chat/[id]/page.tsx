'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getStore } from '@/lib/store';
import { formatDate } from '@/lib/utils';
import { ArrowRight, Send } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const store = getStore();
  const conv = store.conversations.find((c) => c.id === id);
  const messages = store.messages.filter((m) => m.conversation_id === id);
  const [text, setText] = useState('');

  const otherId = conv?.participant_one === user?.id ? conv?.participant_two : conv?.participant_one;
  const otherUser = store.users.find((u) => u.id === otherId);

  if (!conv) {
    return <div className="text-center py-8 text-gray-500">שיחה לא נמצאה</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link href="/chat" className="text-gray-500 hover:text-gray-700">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">{otherUser?.email || 'משתמש'}</h1>
      </div>

      <Card className="flex h-[60vh] flex-col">
        <CardContent className="flex-1 space-y-3 overflow-y-auto pt-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.sender_id === user?.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-blue-200' : 'text-gray-500'}`}>
                  {formatDate(msg.created_at)}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={(e) => { e.preventDefault(); setText(''); }} className="flex gap-2">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="כתוב הודעה..." className="flex-1" />
            <Button type="submit" size="sm"><Send className="h-4 w-4" /></Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
