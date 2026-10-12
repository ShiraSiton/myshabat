-- Demo data for presentation
-- Creates 5 hosts and 5 guests for search/profile display.
-- These users are application demo records, not Supabase Auth login accounts.

-- Clean previous demo data if re-running this file
DELETE FROM host_profiles
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'demo-host-%@myshabat.local'
);

DELETE FROM guest_profiles
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'demo-guest-%@myshabat.local'
);

DELETE FROM notifications
WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE 'demo-%@myshabat.local'
);

DELETE FROM match_requests
WHERE sender_id IN (SELECT id FROM users WHERE email LIKE 'demo-%@myshabat.local')
   OR receiver_id IN (SELECT id FROM users WHERE email LIKE 'demo-%@myshabat.local');

DELETE FROM matches
WHERE host_id IN (SELECT id FROM users WHERE email LIKE 'demo-%@myshabat.local')
   OR guest_id IN (SELECT id FROM users WHERE email LIKE 'demo-%@myshabat.local');

DELETE FROM users
WHERE email LIKE 'demo-%@myshabat.local';

-- Demo users
INSERT INTO users (id, email, role, status, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111101', 'demo-host-1@myshabat.local', 'host', 'active', now(), now()),
  ('11111111-1111-1111-1111-111111111102', 'demo-host-2@myshabat.local', 'host', 'active', now(), now()),
  ('11111111-1111-1111-1111-111111111103', 'demo-host-3@myshabat.local', 'host', 'active', now(), now()),
  ('11111111-1111-1111-1111-111111111104', 'demo-host-4@myshabat.local', 'host', 'active', now(), now()),
  ('11111111-1111-1111-1111-111111111105', 'demo-host-5@myshabat.local', 'host', 'active', now(), now()),
  ('22222222-2222-2222-2222-222222222201', 'demo-guest-1@myshabat.local', 'guest', 'active', now(), now()),
  ('22222222-2222-2222-2222-222222222202', 'demo-guest-2@myshabat.local', 'guest', 'active', now(), now()),
  ('22222222-2222-2222-2222-222222222203', 'demo-guest-3@myshabat.local', 'guest', 'active', now(), now()),
  ('22222222-2222-2222-2222-222222222204', 'demo-guest-4@myshabat.local', 'guest', 'active', now(), now()),
  ('22222222-2222-2222-2222-222222222205', 'demo-guest-5@myshabat.local', 'guest', 'active', now(), now());

-- Demo host profiles
INSERT INTO host_profiles (
  user_id, family_name, city, neighborhood, capacity, preferred_guests,
  min_age, max_age, includes_accommodation, hosting_type, description,
  images, phone, email, is_active, joined_at, avg_rating, hosting_count
)
VALUES
  (
    '11111111-1111-1111-1111-111111111101', 'כהן', 'ירושלים', 'רמות', 4,
    ARRAY['male', 'female'], 18, 35, true, 'full_shabbat',
    'משפחה ירושלמית חמה עם ילדים, אוהבת לארח לשבת מלאה באווירה נעימה ומקרבת.',
    ARRAY['https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=900&q=80'],
    '050-1111111', 'demo-host-1@myshabat.local', true, now(), 4.8, 12
  ),
  (
    '11111111-1111-1111-1111-111111111102', 'לוי', 'בני ברק', 'מרכז', 2,
    ARRAY['male'], 20, 45, false, 'meals_only',
    'משפחה חרדית במרכז בני ברק המזמינה בחורים לסעודות שבת באווירה תורנית וחמה.',
    ARRAY['https://images.unsplash.com/photo-1547573854-74d2a71d0826?auto=format&fit=crop&w=900&q=80'],
    '052-2222222', 'demo-host-2@myshabat.local', true, now(), 4.6, 8
  ),
  (
    '11111111-1111-1111-1111-111111111103', 'מזרחי', 'תל אביב', 'צפון הישן', 3,
    ARRAY['female', 'couple'], 24, 55, true, 'full_shabbat',
    'זוג דתי לאומי המארח לשבת מלאה בלב תל אביב, עם שיח פתוח ואווירה ביתית.',
    ARRAY['https://images.unsplash.com/photo-1522444195799-478538b28823?auto=format&fit=crop&w=900&q=80'],
    '053-3333333', 'demo-host-3@myshabat.local', true, now(), 5.0, 6
  ),
  (
    '11111111-1111-1111-1111-111111111104', 'אוחנה', 'חיפה', 'אחוזה', 5,
    ARRAY['male', 'female', 'couple'], 18, 60, true, 'full_shabbat',
    'משפחה גדולה ושמחה בחיפה, מתאימה לאורחים שמחפשים שבת משפחתית עם שירה ודברי תורה.',
    ARRAY['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'],
    '054-4444444', 'demo-host-4@myshabat.local', true, now(), 4.9, 15
  ),
  (
    '11111111-1111-1111-1111-111111111105', 'פרידמן', 'מודיעין', 'השבטים', 2,
    ARRAY['couple'], 25, 45, false, 'meals_only',
    'זוג צעיר במודיעין המזמין זוגות לסעודות שבת, מתאים להיכרות ראשונית עם אווירת שבת.',
    ARRAY['https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80'],
    '055-5555555', 'demo-host-5@myshabat.local', true, now(), 4.4, 4
  );

-- Demo guest profiles
INSERT INTO guest_profiles (
  user_id, first_name, age, gender, city, marital_status, spiritual_journey,
  people_count, needs_accommodation, bio, phone, email, is_active,
  joined_at, avg_rating, hosting_count
)
VALUES
  (
    '22222222-2222-2222-2222-222222222201', 'יוסי', 27, 'male', 'תל אביב', 'single',
    'בתהליך התחזקות בשנתיים האחרונות, מחפש להכיר שבת משפחתית וקהילה תומכת.',
    1, true, 'עובד בהייטק, אוהב מוזיקה ושיחות עומק.',
    '050-6666661', 'demo-guest-1@myshabat.local', true, now(), 4.7, 3
  ),
  (
    '22222222-2222-2222-2222-222222222202', 'נועה', 24, 'female', 'ירושלים', 'single',
    'מתקרבת ליהדות בהדרגה ומחפשת שבת באווירה נשית, מכבדת ונעימה.',
    1, false, 'סטודנטית, אוהבת ספרים והתנדבות.',
    '050-6666662', 'demo-guest-2@myshabat.local', true, now(), 5.0, 2
  ),
  (
    '22222222-2222-2222-2222-222222222203', 'דניאל ורות', 31, 'couple', 'מודיעין', 'married',
    'זוג בתחילת דרך של התחזקות, מעוניינים להכיר שבת מלאה אצל משפחה מארחת.',
    2, true, 'זוג צעיר, אוהבים טבע, שיח ומשפחתיות.',
    '050-6666663', 'demo-guest-3@myshabat.local', true, now(), 4.5, 1
  ),
  (
    '22222222-2222-2222-2222-222222222204', 'אבי', 38, 'male', 'חיפה', 'divorced',
    'חוזר בהדרגה לשמירת שבת ומחפש חיבור רגוע, מכבד ולא שיפוטי.',
    1, false, 'עצמאי, אוהב לימוד, טיולים ואנשים.',
    '050-6666664', 'demo-guest-4@myshabat.local', true, now(), 4.2, 2
  ),
  (
    '22222222-2222-2222-2222-222222222205', 'מיכל', 29, 'female', 'בני ברק', 'single',
    'מחפשת שבת חמה ומחזקת אצל משפחה שיכולה להסביר וללוות בסבלנות.',
    1, true, 'עובדת בחינוך, אוהבת ילדים ואווירה משפחתית.',
    '050-6666665', 'demo-guest-5@myshabat.local', true, now(), 4.9, 4
  );
