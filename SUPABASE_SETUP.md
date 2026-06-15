# הגדרת Supabase לפרויקט MyShabat

## 1. יצירת פרויקט Supabase

1. היכנסי ל-https://supabase.com
2. לחצי על "Start a new project"
3. בחרי ארגון (או צרי חדש)
4. Name: `myshabat`
5. Database Password: **שמרי במקום בטוח!**
6. Region: בחרי הקרוב אלייך (למשל EU-West או Israel אם זמין)
7. לחצי "Create new project" (לוקח כדקה)

## 2. טבלאות בסיס - יש להריץ ב-SQL Editor

פתחי את SQL Editor והריצי:

```sql
-- Users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('host', 'guest', 'admin')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Host Profiles
CREATE TABLE host_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Guest Profiles
CREATE TABLE guest_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
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

-- Match Requests
CREATE TABLE match_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sender_role TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- Reviews
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  match_id UUID,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  moderated_at TIMESTAMPTZ
);

-- Community Profiles
CREATE TABLE community_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  city TEXT NOT NULL,
  area TEXT NOT NULL,
  bio TEXT NOT NULL,
  age INT NOT NULL,
  gender TEXT NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Notifications
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

## 3. הגדרת Auth

ב-Supabase Dashboard:
1. Authentication → Settings
2. תחת "Redirect URLs" הוסיפי: `http://localhost:3000/**`
3. הפעילי "Email" ב-Providers

## 4. חיבור לפרויקט

צרי קובץ `.env.local` בתיקיית הפרויקט:

```
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

(תמצאי את הערכים ב-Project Settings → API)

## 5. שימוש בפרויקט

החלפתי את שכבת ה-mock-data ב-Supabase client:

1. התקיני: `npm install @supabase/supabase-js @supabase/ssr`
2. צרי קובץ `src/lib/supabase.ts`
3. עדכני את `src/lib/store.ts` להתחבר לסופבייס במקום למוק
