export type UserStatus = 'pending' | 'active' | 'suspended' | 'blocked';
export type UserRole = 'host' | 'guest' | 'admin';
export type Gender = 'male' | 'female' | 'couple';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';
export type HostingType = 'meals_only' | 'full_shabbat';
export type MatchRequestStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type ConnectionStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

export interface HostProfile {
  id: string;
  user_id: string;
  family_name: string;
  city: string;
  neighborhood: string;
  capacity: number;
  preferred_guests: Gender[];
  min_age: number;
  max_age: number;
  includes_accommodation: boolean;
  hosting_type: HostingType;
  description: string;
  images: string[];
  phone: string;
  email: string;
  is_active: boolean;
  joined_at: string;
  avg_rating: number;
  hosting_count: number;
}

export interface GuestProfile {
  id: string;
  user_id: string;
  first_name: string;
  age: number;
  gender: Gender;
  city: string;
  marital_status: MaritalStatus;
  spiritual_journey: string;
  people_count: number;
  needs_accommodation: boolean;
  bio: string;
  phone: string;
  email: string;
  is_active: boolean;
  joined_at: string;
  avg_rating: number;
  hosting_count: number;
}

export interface HostImage {
  id: string;
  host_id: string;
  url: string;
  is_approved: boolean;
  created_at: string;
}

export interface MatchRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_role: UserRole;
  message?: string;
  status: MatchRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  host_id: string;
  guest_id: string;
  match_request_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  match_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  reviewee_id: string;
  match_id: string;
  title: string;
  content: string;
  rating: number;
  status: ReviewStatus;
  created_at: string;
  moderated_at?: string;
}

export interface CommunityProfile {
  id: string;
  user_id: string;
  display_name: string;
  city: string;
  area: string;
  bio: string;
  age: number;
  gender: Gender;
  joined_at: string;
  is_active: boolean;
}

export interface CommunityConnection {
  id: string;
  requester_id: string;
  target_id: string;
  message?: string;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminAction {
  id: string;
  admin_id: string;
  action_type: string;
  target_id: string;
  details: string;
  created_at: string;
}
