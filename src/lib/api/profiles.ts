import { supabase } from '@/lib/supabase';
import type { GuestProfile, HostProfile } from '@/lib/types';

export type HostProfilePayload = Omit<
  HostProfile,
  'id' | 'joined_at' | 'avg_rating' | 'hosting_count' | 'images'
> & {
  images?: string[];
};

export type GuestProfilePayload = Omit<
  GuestProfile,
  'id' | 'joined_at' | 'avg_rating' | 'hosting_count'
>;

export async function getMyHostProfile(userId: string) {
  const { data, error } = await supabase
    .from('host_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as HostProfile | null;
}

export async function getHostProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('host_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data as HostProfile | null;
}

export async function saveHostProfile(payload: HostProfilePayload) {
  const { data, error } = await supabase
    .from('host_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data as HostProfile;
}

export async function uploadHostImage(userId: string, file: File) {
  const extension = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from('host-images')
    .upload(path, file, { upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from('host-images').getPublicUrl(path);
  return data.publicUrl;
}

export async function getMyGuestProfile(userId: string) {
  const { data, error } = await supabase
    .from('guest_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data as GuestProfile | null;
}

export async function getGuestProfileByUserId(userId: string) {
  const { data, error } = await supabase
    .from('guest_profiles')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) throw error;
  return data as GuestProfile | null;
}

export async function saveGuestProfile(payload: GuestProfilePayload) {
  const { data, error } = await supabase
    .from('guest_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('*')
    .single();

  if (error) throw error;
  return data as GuestProfile;
}
