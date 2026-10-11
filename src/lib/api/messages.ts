import { supabase } from '@/lib/supabase';
import type { Conversation, Message } from '@/lib/types';

export async function getMyConversations(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Conversation[];
}

export async function getConversationMessages(conversationId: string) {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data || []) as Message[];
}

export async function sendMessage(input: { conversationId: string; senderId: string; content: string }) {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: input.conversationId,
      sender_id: input.senderId,
      content: input.content,
    })
    .select('*')
    .single();

  if (error) throw error;

  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', input.conversationId);

  return data as Message;
}
