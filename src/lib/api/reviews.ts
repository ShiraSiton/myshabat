import { supabase } from '@/lib/supabase';
import type { Review, ReviewStatus } from '@/lib/types';

export async function getReviews() {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Review[];
}

export async function getMyReviews(userId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewer_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Review[];
}

export async function createReview(input: {
  reviewerId: string;
  revieweeId: string;
  matchId: string;
  title: string;
  content: string;
  rating: number;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      reviewer_id: input.reviewerId,
      reviewee_id: input.revieweeId,
      match_id: input.matchId,
      title: input.title,
      content: input.content,
      rating: input.rating,
      status: 'pending',
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as Review;
}

export async function updateReviewStatus(reviewId: string, status: ReviewStatus) {
  const { data, error } = await supabase
    .from('reviews')
    .update({ status, moderated_at: new Date().toISOString() })
    .eq('id', reviewId)
    .select('*')
    .single();

  if (error) throw error;
  return data as Review;
}
