import { supabase } from '@/lib/supabase';
import type { MatchRequest, Notification } from '@/lib/types';

export interface DashboardSummary {
  unreadNotificationsCount: number;
  conversationsCount: number;
  pendingRequestsCount: number;
  matchesCount: number;
  pendingRequests: MatchRequest[];
  recentNotifications: Notification[];
}

async function countQuery(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
}

export async function getDashboardSummary(userId: string): Promise<DashboardSummary> {
  const [
    unreadNotificationsCount,
    conversationsCount,
    pendingRequestsCount,
    matchesCount,
    pendingRequestsResult,
    recentNotificationsResult,
  ] = await Promise.all([
    countQuery(
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
    ),
    countQuery(
      supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
    ),
    countQuery(
      supabase
        .from('match_requests')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('status', 'pending')
    ),
    countQuery(
      supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    ),
    supabase
      .from('match_requests')
      .select('*')
      .eq('receiver_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5),
  ]);

  if (pendingRequestsResult.error) throw pendingRequestsResult.error;
  if (recentNotificationsResult.error) throw recentNotificationsResult.error;

  return {
    unreadNotificationsCount,
    conversationsCount,
    pendingRequestsCount,
    matchesCount,
    pendingRequests: (pendingRequestsResult.data || []) as MatchRequest[],
    recentNotifications: (recentNotificationsResult.data || []) as Notification[],
  };
}
