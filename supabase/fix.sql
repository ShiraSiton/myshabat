-- 1. Trigger: auto-create user row after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  selected_role TEXT;
BEGIN
  selected_role := COALESCE(NEW.raw_user_meta_data ->> 'role', 'guest');

  IF selected_role NOT IN ('host', 'guest') THEN
    selected_role := 'guest';
  END IF;

  INSERT INTO public.users (id, email, role, status)
  VALUES (NEW.id, NEW.email, selected_role, 'pending')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 2. Fix RLS: allow inserting users during signup
DROP POLICY IF EXISTS "users_insert" ON users;
CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (auth.uid() = id OR auth.uid() IS NULL);

-- 3. Also add policy for service role
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 4. Helper functions for role checks in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = auth.uid()
      AND role = 'admin'
      AND status = 'active'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 5. Make admin policies work from the users table instead of relying on JWT custom claims
DROP POLICY IF EXISTS "users_read_own" ON users;
CREATE POLICY "users_read_own" ON users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "users_update_admin" ON users;
CREATE POLICY "users_update_admin" ON users
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reviews_update_admin" ON reviews;
CREATE POLICY "reviews_update_admin" ON reviews
  FOR UPDATE USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "reviews_read" ON reviews;
CREATE POLICY "reviews_read" ON reviews
  FOR SELECT USING (status = 'approved' OR auth.uid() = reviewer_id OR auth.uid() = reviewee_id OR public.is_admin());

-- 6. Match and conversation policies
DROP POLICY IF EXISTS "matches_read_participants" ON matches;
CREATE POLICY "matches_read_participants" ON matches
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = guest_id OR public.is_admin());

DROP POLICY IF EXISTS "matches_insert_participants" ON matches;
CREATE POLICY "matches_insert_participants" ON matches
  FOR INSERT WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id OR public.is_admin());

DROP POLICY IF EXISTS "conversations_read_participants" ON conversations;
CREATE POLICY "conversations_read_participants" ON conversations
  FOR SELECT USING (auth.uid() = participant_one OR auth.uid() = participant_two OR public.is_admin());

DROP POLICY IF EXISTS "conversations_insert_participants" ON conversations;
CREATE POLICY "conversations_insert_participants" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = participant_one OR auth.uid() = participant_two OR public.is_admin());

-- 7. Notifications policies
DROP POLICY IF EXISTS "notifications_read" ON notifications;
CREATE POLICY "notifications_read" ON notifications
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_update" ON notifications;
CREATE POLICY "notifications_update" ON notifications
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "notifications_insert_authenticated" ON notifications;
CREATE POLICY "notifications_insert_authenticated" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 8. Database-side notification triggers
-- This makes notifications reliable even when the browser/client cannot insert them directly.
CREATE OR REPLACE FUNCTION public.notify_match_request_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, content, type, is_read)
  VALUES (
    NEW.receiver_id,
    'בקשת התאמה חדשה',
    'קיבלת בקשת התאמה חדשה. ניתן לצפות בה במסך הפניות.',
    'match_request_created',
    false
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_match_request_created ON match_requests;
CREATE TRIGGER on_match_request_created
  AFTER INSERT ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_match_request_created();

CREATE OR REPLACE FUNCTION public.notify_match_request_status_changed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NEW.status = 'approved' THEN
    INSERT INTO public.notifications (user_id, title, content, type, is_read)
    VALUES (
      NEW.sender_id,
      'בקשת ההתאמה אושרה',
      'בקשת ההתאמה שלך אושרה ונפתחה שיחה חדשה.',
      'match_request_approved',
      false
    );
  ELSIF NEW.status = 'rejected' THEN
    INSERT INTO public.notifications (user_id, title, content, type, is_read)
    VALUES (
      NEW.sender_id,
      'בקשת ההתאמה נדחתה',
      'בקשת ההתאמה שלך נדחתה.',
      'match_request_rejected',
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_match_request_status_changed ON match_requests;
CREATE TRIGGER on_match_request_status_changed
  AFTER UPDATE OF status ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_match_request_status_changed();

CREATE OR REPLACE FUNCTION public.notify_message_created()
RETURNS TRIGGER AS $$
DECLARE
  receiver_id UUID;
BEGIN
  SELECT
    CASE
      WHEN participant_one = NEW.sender_id THEN participant_two
      ELSE participant_one
    END
  INTO receiver_id
  FROM conversations
  WHERE id = NEW.conversation_id;

  IF receiver_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, title, content, type, is_read)
    VALUES (
      receiver_id,
      'הודעה חדשה',
      'קיבלת הודעה חדשה בצ׳אט.',
      'message_created',
      false
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON messages;
CREATE TRIGGER on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_message_created();

-- 9. Prevent duplicate active match requests in both directions
CREATE OR REPLACE FUNCTION public.prevent_duplicate_match_request()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM matches
    WHERE (host_id = NEW.sender_id AND guest_id = NEW.receiver_id)
       OR (host_id = NEW.receiver_id AND guest_id = NEW.sender_id)
  ) THEN
    RAISE EXCEPTION 'כבר קיימת התאמה מול המשתמש הזה';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM match_requests
    WHERE status IN ('pending', 'approved')
      AND (
        (sender_id = NEW.sender_id AND receiver_id = NEW.receiver_id)
        OR
        (sender_id = NEW.receiver_id AND receiver_id = NEW.sender_id)
      )
  ) THEN
    RAISE EXCEPTION 'כבר קיימת בקשה פעילה מול המשתמש הזה';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_match_request_prevent_duplicate ON match_requests;
CREATE TRIGGER on_match_request_prevent_duplicate
  BEFORE INSERT ON match_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_duplicate_match_request();

-- 10. Host images storage bucket and policies
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'host-images',
  'host-images',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

DROP POLICY IF EXISTS "host_images_public_read" ON storage.objects;
CREATE POLICY "host_images_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'host-images');

DROP POLICY IF EXISTS "host_images_insert_own_folder" ON storage.objects;
CREATE POLICY "host_images_insert_own_folder" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'host-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "host_images_update_own_folder" ON storage.objects;
CREATE POLICY "host_images_update_own_folder" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'host-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'host-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "host_images_delete_own_folder" ON storage.objects;
CREATE POLICY "host_images_delete_own_folder" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'host-images'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
