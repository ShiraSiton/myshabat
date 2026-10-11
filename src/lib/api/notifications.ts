import { supabase } from '@/lib/supabase';
import type { Notification } from '@/lib/types';

export async function getMyNotifications(userId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Notification[];
}

export async function getUnreadNotificationsCount(userId: string) {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count || 0;
}

export async function createNotification(input: {
  userId: string;
  title: string;
  content: string;
  type: string;
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: input.userId,
      title: input.title,
      content: input.content,
      type: input.type,
      is_read: false,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Notification;
}

export async function markNotificationRead(notificationId: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Notification;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}
