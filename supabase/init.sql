-- MyShabat Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('host', 'guest', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. HOST PROFILES
CREATE TABLE host_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  family_name TEXT NOT NULL,
  city TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  capacity INT NOT NULL,
  preferred_guests TEXT[] NOT NULL,
  min_age INT DEFAULT 0,
  max_age INT DEFAULT 120,
  includes_accommodation BOOLEAN DEFAULT false,
  hosting_type TEXT NOT NULL CHECK (hosting_type IN ('meals_only', 'full_shabbat')),
  description TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now(),
  avg_rating DECIMAL(2,1) DEFAULT 0,
  hosting_count INT DEFAULT 0
);

-- 3. GUEST PROFILES
CREATE TABLE guest_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  first_name TEXT NOT NULL,
  age INT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'couple')),
  city TEXT NOT NULL,
  marital_status TEXT NOT NULL CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed')),
  spiritual_journey TEXT NOT NULL,
  people_count INT NOT NULL,
  needs_accommodation BOOLEAN DEFAULT false,
  bio TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  joined_at TIMESTAMPTZ DEFAULT now(),
  avg_rating DECIMAL(2,1) DEFAULT 0,
  hosting_count INT DEFAULT 0
);

-- 4. MATCH REQUESTS
CREATE TABLE match_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. MATCHES
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_request_id UUID REFERENCES match_requests(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. CONVERSATIONS
CREATE TABLE conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  participant_one UUID REFERENCES users(id) ON DELETE CASCADE,
  participant_two UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. MESSAGES
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- 8. REVIEWS
CREATE TABLE reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  moderated_at TIMESTAMPTZ
);

-- 9. COMMUNITY PROFILES
CREATE TABLE community_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  display_name TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  bio TEXT NOT NULL,
  age INT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'couple')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- 10. COMMUNITY CONNECTIONS
CREATE TABLE community_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  target_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. NOTIFICATIONS
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. ADMIN ACTIONS
CREATE TABLE admin_actions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: everyone can read, only admins can update
CREATE POLICY "users_read_own" ON users FOR SELECT USING (auth.uid() = id OR auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "users_insert" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "users_update_admin" ON users FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Host profiles: anyone can read active, only owner can update
CREATE POLICY "host_profiles_read" ON host_profiles FOR SELECT USING (is_active = true OR auth.uid() = user_id);
CREATE POLICY "host_profiles_insert" ON host_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "host_profiles_update" ON host_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Guest profiles
CREATE POLICY "guest_profiles_read" ON guest_profiles FOR SELECT USING (is_active = true OR auth.uid() = user_id);
CREATE POLICY "guest_profiles_insert" ON guest_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "guest_profiles_update" ON guest_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Match requests: participants can read, sender can create
CREATE POLICY "match_requests_read" ON match_requests FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
CREATE POLICY "match_requests_insert" ON match_requests FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "match_requests_update" ON match_requests FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Messages: conversation participants can read and write
CREATE POLICY "messages_read" ON messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid()))
);
CREATE POLICY "messages_insert" ON messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM conversations c WHERE c.id = conversation_id AND (c.participant_one = auth.uid() OR c.participant_two = auth.uid()))
);

-- Reviews: everyone can read approved, participants can create
CREATE POLICY "reviews_read" ON reviews FOR SELECT USING (status = 'approved' OR auth.uid() = reviewer_id OR auth.uid() = reviewee_id);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews_update_admin" ON reviews FOR UPDATE USING (auth.jwt() ->> 'role' = 'admin');

-- Notifications: only the user can see their own
CREATE POLICY "notifications_read" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update" ON notifications FOR UPDATE USING (auth.uid() = user_id);
