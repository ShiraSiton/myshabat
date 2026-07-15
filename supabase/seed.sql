-- Seed data for MyShabat
-- Run this AFTER creating an admin user via the app's registration form

-- Insert admin user (replace ID with actual user ID from auth)
-- First, register an admin via the app, then run:

-- UPDATE users SET status = 'active' WHERE email = 'admin@myshabat.com';
-- UPDATE users SET role = 'admin' WHERE email = 'admin@myshabat.com';

-- Sample host profiles (will work after users exist)
-- INSERT INTO host_profiles (user_id, family_name, city, neighborhood, capacity, preferred_guests, includes_accommodation, hosting_type, description, phone, email)
-- VALUES 
-- ('USER_ID_HERE', 'כהן', 'ירושלים', 'רמות', 4, ARRAY['male','female'], true, 'full_shabbat', 'משפחת כהן שמחה לארח אורחים לשבת מלאה.', '050-1111111', 'cohen@example.com');

-- Sample guest profiles
-- INSERT INTO guest_profiles (user_id, first_name, age, gender, city, marital_status, spiritual_journey, people_count, needs_accommodation, bio, phone, email)
-- VALUES
-- ('USER_ID_HERE', 'יוסי', 28, 'male', 'תל אביב', 'single', 'בתהליך התחזקות מזה שנתיים.', 1, true, 'אדם חיפאי במקור, גר בתל אביב.', '053-4444444', 'yossi@example.com');
