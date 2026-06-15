import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
});

export const registerSchema = z.object({
  email: z.string().email('כתובת אימייל לא תקינה'),
  password: z.string().min(6, 'סיסמה חייבת להכיל לפחות 6 תווים'),
  confirmPassword: z.string(),
  role: z.enum(['host', 'guest'], { error: 'יש לבחור סוג משתמש' }),
}).refine((d) => d.password === d.confirmPassword, { message: 'הסיסמאות אינן תואמות', path: ['confirmPassword'] });

export const hostProfileSchema = z.object({
  family_name: z.string().min(2, 'שם משפחה חייב להכיל לפחות 2 תווים'),
  city: z.string().min(2, 'עיר היא שדה חובה'),
  neighborhood: z.string().min(2, 'שכונה היא שדה חובה'),
  capacity: z.number().min(1, 'לפחות מקום אחד'),
  preferred_guests: z.array(z.enum(['male', 'female', 'couple'])).min(1, 'יש לבחור לפחות סוג אורח אחד'),
  min_age: z.number().min(0),
  max_age: z.number().max(120),
  includes_accommodation: z.boolean(),
  hosting_type: z.enum(['meals_only', 'full_shabbat']),
  description: z.string().min(10, 'תיאור חייב להכיל לפחות 10 תווים'),
  phone: z.string().min(9, 'מספר טלפון לא תקין'),
});

export const guestProfileSchema = z.object({
  first_name: z.string().min(2, 'שם פרטי חייב להכיל לפחות 2 תווים'),
  age: z.number().min(16, 'גיל מינימלי 16').max(120),
  gender: z.enum(['male', 'female', 'couple'], { error: 'יש לבחור מגדר' }),
  city: z.string().min(2, 'עיר היא שדה חובה'),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']),
  spiritual_journey: z.string().min(10, 'תיאור תהליך ההתחזקות חייב להכיל לפחות 10 תווים'),
  people_count: z.number().min(1),
  needs_accommodation: z.boolean(),
  bio: z.string().min(10, 'תיאור אישי חייב להכיל לפחות 10 תווים'),
  phone: z.string().min(9, 'מספר טלפון לא תקין'),
});

export const reviewSchema = z.object({
  title: z.string().min(2, 'כותרת חייבת להכיל לפחות 2 תווים'),
  content: z.string().min(10, 'תוכן חייב להכיל לפחות 10 תווים'),
  rating: z.number().min(1, 'יש לדרג').max(5),
});

export const communityProfileSchema = z.object({
  display_name: z.string().min(2, 'שם תצוגה חייב להכיל לפחות 2 תווים'),
  city: z.string().min(2, 'עיר היא שדה חובה'),
  area: z.string().min(2, 'אזור הוא שדה חובה'),
  bio: z.string().min(10, 'תיאור חייב להכיל לפחות 10 תווים'),
  age: z.number().min(16, 'גיל מינימלי 16'),
  gender: z.enum(['male', 'female', 'couple']),
});

export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
export type HostProfileData = z.infer<typeof hostProfileSchema>;
export type GuestProfileData = z.infer<typeof guestProfileSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type CommunityProfileData = z.infer<typeof communityProfileSchema>;
