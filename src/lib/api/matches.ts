import { supabase } from '@/lib/supabase';
import type { GuestProfile, HostProfile, Match, MatchRequest, MatchRequestStatus, UserRole } from '@/lib/types';

export type RelationshipStatus = 'none' | 'pending' | 'approved' | 'rejected' | 'cancelled' | 'matched';

export async function getActiveHostProfiles() {
  const { data, error } = await supabase
    .from('host_profiles')
    .select('*')
    .eq('is_active', true)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return (data || []) as HostProfile[];
}

export async function getActiveGuestProfiles() {
  const { data, error } = await supabase
    .from('guest_profiles')
    .select('*')
    .eq('is_active', true)
    .order('joined_at', { ascending: false });

  if (error) throw error;
  return (data || []) as GuestProfile[];
}

export async function createMatchRequest(input: {
  senderId: string;
  receiverId: string;
  senderRole: Extract<UserRole, 'host' | 'guest'>;
  message?: string;
}) {
  const existing = await getRelationshipStatus(input.senderId, input.receiverId);
  if (existing !== 'none' && existing !== 'rejected' && existing !== 'cancelled') {
    throw new Error('כבר קיימת בקשה או התאמה מול המשתמש הזה');
  }

  const { data, error } = await supabase
    .from('match_requests')
    .insert({
      sender_id: input.senderId,
      receiver_id: input.receiverId,
      sender_role: input.senderRole,
      message: input.message || null,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;

  return data as MatchRequest;
}

export async function getRelationshipStatus(userId: string, otherUserId: string): Promise<RelationshipStatus> {
  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .or(`and(host_id.eq.${userId},guest_id.eq.${otherUserId}),and(host_id.eq.${otherUserId},guest_id.eq.${userId})`)
    .limit(1);

  if (matchError) throw matchError;
  if (matches && matches.length > 0) return 'matched';

  const { data: requests, error: requestError } = await supabase
    .from('match_requests')
    .select('*')
    .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
    .order('created_at', { ascending: false })
    .limit(1);

  if (requestError) throw requestError;
  return (requests?.[0]?.status as RelationshipStatus | undefined) || 'none';
}

export async function getRelationshipsForUsers(userId: string, otherUserIds: string[]) {
  const uniqueIds = [...new Set(otherUserIds)].filter(Boolean);
  const relationships: Record<string, RelationshipStatus> = {};

  uniqueIds.forEach((id) => {
    relationships[id] = 'none';
  });

  if (uniqueIds.length === 0) return relationships;

  const { data: matches, error: matchError } = await supabase
    .from('matches')
    .select('*')
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`);

  if (matchError) throw matchError;

  (matches as Match[] | null)?.forEach((match) => {
    const otherId = match.host_id === userId ? match.guest_id : match.host_id;
    if (otherId in relationships) relationships[otherId] = 'matched';
  });

  const { data: requests, error: requestError } = await supabase
    .from('match_requests')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (requestError) throw requestError;

  (requests as MatchRequest[] | null)?.forEach((request) => {
    const otherId = request.sender_id === userId ? request.receiver_id : request.sender_id;
    if (otherId in relationships && relationships[otherId] === 'none') {
      relationships[otherId] = request.status as RelationshipStatus;
    }
  });

  return relationships;
}

export async function getMyMatchRequests(userId: string) {
  const { data, error } = await supabase
    .from('match_requests')
    .select('*')
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as MatchRequest[];
}

export async function updateMatchRequestStatus(request: MatchRequest, status: MatchRequestStatus) {
  const { data, error } = await supabase
    .from('match_requests')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', request.id)
    .select('*')
    .single();

  if (error) throw error;

  if (status === 'approved') {
    const hostId = request.sender_role === 'host' ? request.sender_id : request.receiver_id;
    const guestId = request.sender_role === 'guest' ? request.sender_id : request.receiver_id;

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert({ host_id: hostId, guest_id: guestId, match_request_id: request.id })
      .select('*')
      .single();

    if (matchError) throw matchError;

    const { error: conversationError } = await supabase
      .from('conversations')
      .insert({ participant_one: hostId, participant_two: guestId, match_id: match.id });

    if (conversationError) throw conversationError;
  }

  return data as MatchRequest;
}

export async function getMyMatches(userId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Match[];
}
