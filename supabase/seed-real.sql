-- 1. הפוך את siton329 למנהלת + סטטוס אקטיבי
UPDATE users SET role = 'admin', status = 'active' WHERE email = 'siton329@gmail.com';

-- 2. פרופילי מארחים לדוגמה (כולם תחת המשתמש שלך)
INSERT INTO host_profiles (user_id, family_name, city, neighborhood, capacity, preferred_guests, includes_accommodation, hosting_type, description, phone, email, is_active, avg_rating, hosting_count)
SELECT id, 'כהן', 'ירושלים', 'רמות', 4, ARRAY['male','female'], true, 'full_shabbat', 'משפחת כהן שמחה לארח אורחים לשבת מלאה. אנו משפחה חמה ומסבירת פנים עם ניסיון רב באירוח.', '050-1111111', 'cohen@example.com', true, 4.8, 12
FROM users WHERE email = 'siton329@gmail.com';

INSERT INTO host_profiles (user_id, family_name, city, neighborhood, capacity, preferred_guests, includes_accommodation, hosting_type, description, phone, email, is_active, avg_rating, hosting_count)
SELECT id, 'לוי', 'בני ברק', 'מרכז', 2, ARRAY['male'], false, 'meals_only', 'משפחת לוי מזמינה אתכם לסעודות שבת באווירה משפחתית חמה.', '052-2222222', 'levi@example.com', true, 4.5, 8
FROM users WHERE email = 'siton329@gmail.com';

INSERT INTO host_profiles (user_id, family_name, city, neighborhood, capacity, preferred_guests, includes_accommodation, hosting_type, description, phone, email, is_active, avg_rating, hosting_count)
SELECT id, 'רבקה', 'מודיעין', 'השבטים', 3, ARRAY['female','couple'], true, 'full_shabbat', 'משפחת רבקה אוהבת לארח ומחכה לכם בזרועות פתוחות. שבת מלאה של חום ואהבה.', '054-3333333', 'rivka@example.com', true, 5.0, 5
FROM users WHERE email = 'siton329@gmail.com';

-- 3. פרופילי מתארחים לדוגמה
INSERT INTO guest_profiles (user_id, first_name, age, gender, city, marital_status, spiritual_journey, people_count, needs_accommodation, bio, phone, email, is_active, avg_rating, hosting_count)
SELECT id, 'יוסי', 28, 'male', 'תל אביב', 'single', 'בתהליך התחזקות מזה שנתיים. מחפש חיבור לקהילה וחוויית שבת אמיתית.', 1, true, 'אדם חיפאי במקור, גר בתל אביב. עובד בהייטק ומחפש משמעות.', '053-4444444', 'yossi@example.com', true, 4.2, 3
FROM users WHERE email = 'siton329@gmail.com';

INSERT INTO guest_profiles (user_id, first_name, age, gender, city, marital_status, spiritual_journey, people_count, needs_accommodation, bio, phone, email, is_active)
SELECT id, 'דוד', 32, 'male', 'חיפה', 'single', 'התחלתי להתקרב לפני שנה, מחפש משפחה שתעזור לי להכיר את עולם השבת.', 1, true, 'מהנדס במקצועי, אוהב מוזיקה וטיולים.', '055-5555555', 'david@example.com', false
FROM users WHERE email = 'siton329@gmail.com';

-- 4. הודעה ראשונה בצ'אט (ליוסי מול משפחת כהן)
WITH host_user AS (
  SELECT user_id FROM host_profiles WHERE family_name = 'כהן' LIMIT 1
), guest_user AS (
  SELECT user_id FROM guest_profiles WHERE first_name = 'יוסי' LIMIT 1
), conv AS (
  INSERT INTO conversations (participant_one, participant_two)
  SELECT hu.user_id, gu.user_id FROM host_user hu, guest_user gu
  WHERE NOT EXISTS (SELECT 1 FROM conversations c WHERE c.participant_one = hu.user_id AND c.participant_two = gu.user_id)
  RETURNING id
)
INSERT INTO messages (conversation_id, sender_id, content, created_at)
SELECT conv.id, hu.user_id, 'ברוכים הבאים! אנחנו ממש שמחים לארח אתכם', now() - interval '2 days'
FROM conv, host_user hu;

WITH host_user AS (
  SELECT user_id FROM host_profiles WHERE family_name = 'כהן' LIMIT 1
), guest_user AS (
  SELECT user_id FROM guest_profiles WHERE first_name = 'יוסי' LIMIT 1
), conv AS (
  SELECT id FROM conversations
  WHERE participant_one = (SELECT user_id FROM host_user)
    AND participant_two = (SELECT user_id FROM guest_user)
  LIMIT 1
)
INSERT INTO messages (conversation_id, sender_id, content, created_at)
SELECT conv.id, gu.user_id, 'תודה רבה! אנחנו מתרגשים להגיע', now() - interval '1 day'
FROM conv, guest_user gu;

-- 5. משוב לדוגמה
WITH host_user AS (SELECT user_id FROM host_profiles WHERE family_name = 'כהן' LIMIT 1),
     guest_user AS (SELECT user_id FROM guest_profiles WHERE first_name = 'יוסי' LIMIT 1)
INSERT INTO reviews (reviewer_id, reviewee_id, title, content, rating, status, created_at)
SELECT gu.user_id, hu.user_id, 'אירוח מושלם', 'משפחה מדהימה! קיבלו אותנו באהבה גדולה, האוכל היה טעים והאווירה הייתה מיוחדת. ממליץ בחום!', 5, 'approved', now() - interval '1 day'
FROM host_user hu, guest_user gu;
