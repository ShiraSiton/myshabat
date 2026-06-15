import type {
  User, HostProfile, GuestProfile, MatchRequest, Match,
  Conversation, Message, Review, CommunityProfile,
  CommunityConnection, Notification,
} from './types';

export const mockUsers: User[] = [
  { id: '1', email: 'admin@myshabat.com', password_hash: 'hashed', role: 'admin', status: 'active', created_at: '2026-01-01', updated_at: '2026-01-01' },
  { id: '2', email: 'cohen@example.com', password_hash: 'hashed', role: 'host', status: 'active', created_at: '2026-01-15', updated_at: '2026-02-01' },
  { id: '3', email: 'levi@example.com', password_hash: 'hashed', role: 'host', status: 'active', created_at: '2026-02-01', updated_at: '2026-02-10' },
  { id: '4', email: 'yossi@example.com', password_hash: 'hashed', role: 'guest', status: 'active', created_at: '2026-02-05', updated_at: '2026-02-15' },
  { id: '5', email: 'david@example.com', password_hash: 'hashed', role: 'guest', status: 'pending', created_at: '2026-03-01', updated_at: '2026-03-01' },
  { id: '6', email: 'rivka@example.com', password_hash: 'hashed', role: 'host', status: 'active', created_at: '2026-02-20', updated_at: '2026-03-01' },
];

export const mockHostProfiles: HostProfile[] = [
  {
    id: '1', user_id: '2', family_name: 'כהן', city: 'ירושלים', neighborhood: 'רמות',
    capacity: 4, preferred_guests: ['male', 'female'], min_age: 20, max_age: 40,
    includes_accommodation: true, hosting_type: 'full_shabbat',
    description: 'משפחת כהן שמחה לארח אורחים לשבת מלאה. אנו משפחה חמה ומסבירת פנים עם ניסיון רב באירוח. ביתנו פתוח בשמחה.',
    images: [], phone: '050-1111111', email: 'cohen@example.com',
    is_active: true, joined_at: '2026-01-15', avg_rating: 4.8, hosting_count: 12,
  },
  {
    id: '2', user_id: '3', family_name: 'לוי', city: 'בני ברק', neighborhood: 'מרכז',
    capacity: 2, preferred_guests: ['male'], min_age: 18, max_age: 35,
    includes_accommodation: false, hosting_type: 'meals_only',
    description: 'משפחת לוי מזמינה אתכם לסעודות שבת. אנו גרים במרכז בני ברק ומציעים אווירה משפחתית חמה.',
    images: [], phone: '052-2222222', email: 'levi@example.com',
    is_active: true, joined_at: '2026-02-01', avg_rating: 4.5, hosting_count: 8,
  },
  {
    id: '3', user_id: '6', family_name: 'רבקה', city: 'מודיעין', neighborhood: 'השבטים',
    capacity: 3, preferred_guests: ['female', 'couple'], min_age: 22, max_age: 50,
    includes_accommodation: true, hosting_type: 'full_shabbat',
    description: 'ברוכים הבאים למשפחת רבקה! אנו אוהבים לארח ומחכים לכם בזרועות פתוחות. שבת מלאה של חום ואהבה.',
    images: [], phone: '054-3333333', email: 'rivka@example.com',
    is_active: true, joined_at: '2026-02-20', avg_rating: 5.0, hosting_count: 5,
  },
];

export const mockGuestProfiles: GuestProfile[] = [
  {
    id: '1', user_id: '4', first_name: 'יוסי', age: 28, gender: 'male',
    city: 'תל אביב', marital_status: 'single',
    spiritual_journey: 'בתהליך התחזקות מזה שנתיים. מחפש חיבור לקהילה וחוויית שבת אמיתית.',
    people_count: 1, needs_accommodation: true,
    bio: 'אדם חיפאי במקור, גר בתל אביב. עובד בהייטק ומחפש משמעות.',
    phone: '053-4444444', email: 'yossi@example.com',
    is_active: true, joined_at: '2026-02-05', avg_rating: 4.2, hosting_count: 3,
  },
  {
    id: '2', user_id: '5', first_name: 'דוד', age: 32, gender: 'male',
    city: 'חיפה', marital_status: 'single',
    spiritual_journey: 'התחלתי להתקרב לפני שנה, מחפש משפחה שתעזור לי להכיר את עולם השבת.',
    people_count: 1, needs_accommodation: true,
    bio: 'מהנדס במקצועי, אוהב מוזיקה וטיולים.',
    phone: '055-5555555', email: 'david@example.com',
    is_active: false, joined_at: '2026-03-01', avg_rating: 0, hosting_count: 0,
  },
];

export const mockMatchRequests: MatchRequest[] = [
  {
    id: '1', sender_id: '4', receiver_id: '2', sender_role: 'guest',
    message: 'שלום, אשמח להתארח אצלכם בשבת הקרובה. שמעתי המון דברים טובים על האירוח שלכם!',
    status: 'pending', created_at: '2026-02-25', updated_at: '2026-02-25',
  },
  {
    id: '2', sender_id: '2', receiver_id: '4', sender_role: 'host',
    message: 'שלום יוסי, נשמע שאתה אדם מעניין. נשמח לארח אותך!',
    status: 'approved', created_at: '2026-02-20', updated_at: '2026-02-22',
  },
];

export const mockMatches: Match[] = [
  { id: '1', host_id: '2', guest_id: '4', match_request_id: '2', created_at: '2026-02-22' },
];

export const mockConversations: Conversation[] = [
  {
    id: '1', participant_one: '2', participant_two: '4', match_id: '1',
    created_at: '2026-02-22', updated_at: '2026-02-28',
  },
];

export const mockMessages: Message[] = [
  { id: '1', conversation_id: '1', sender_id: '2', content: 'ברוכים הבאים! אנחנו ממש שמחים לארח אתכם', created_at: '2026-02-22', read_at: '2026-02-22' },
  { id: '2', conversation_id: '1', sender_id: '4', content: 'תודה רבה! אנחנו מתרגשים להגיע', created_at: '2026-02-22', read_at: '2026-02-22' },
  { id: '3', conversation_id: '1', sender_id: '2', content: 'אנחנו גרים ברחוב הרא\"ש 15, רמות. נשמח לראותכם בערב שבת alrededor de השעה 17:00', created_at: '2026-02-22', read_at: '2026-02-23' },
];

export const mockReviews: Review[] = [
  {
    id: '1', reviewer_id: '4', reviewee_id: '2', match_id: '1',
    title: 'אירוח מושלם', content: 'משפחה מדהימה! קיבלו אותנו באהבה גדולה, האוכל היה טעים והאווירה הייתה מיוחדת. ממליץ בחום!',
    rating: 5, status: 'approved', created_at: '2026-02-28', moderated_at: '2026-03-01',
  },
  {
    id: '2', reviewer_id: '2', reviewee_id: '4', match_id: '1',
    title: 'אורח למופת', content: 'יוסי היה אורח נעים ומכבד. שמחנו לארח אותו ומחכים לביקור נוסף.',
    rating: 5, status: 'pending', created_at: '2026-02-28',
  },
];

export const mockCommunityProfiles: CommunityProfile[] = [
  { id: '1', user_id: '4', display_name: 'יוסי', city: 'תל אביב', area: 'מרכז', bio: 'מחפש חברים חדשים בדרך להתחזקות', age: 28, gender: 'male', joined_at: '2026-02-10', is_active: true },
  { id: '2', user_id: '5', display_name: 'דוד', city: 'חיפה', area: 'צפון', bio: 'אוהב מוזיקה ושבתות מיוחדות', age: 32, gender: 'male', joined_at: '2026-03-01', is_active: true },
  { id: '3', user_id: '6', display_name: 'רבקה', city: 'מודיעין', area: 'מרכז', bio: 'משפחה חמה שמחכה להכיר', age: 35, gender: 'female', joined_at: '2026-02-25', is_active: true },
];

export const mockCommunityConnections: CommunityConnection[] = [
  { id: '1', requester_id: '1', target_id: '4', message: 'היי, שמתי לב שאנחנו גרים באותה città!', status: 'pending', created_at: '2026-03-01', updated_at: '2026-03-01' },
];

export const mockNotifications: Notification[] = [
  { id: '1', user_id: '4', title: 'בקשת התאמה אושרה', content: 'משפחת כהן אישרה את בקשת ההתאמה שלכם!', type: 'match_approved', is_read: false, created_at: '2026-02-22' },
  { id: '2', user_id: '2', title: 'הודעה חדשה', content: 'קיבלת הודעה חדשה מיוסי', type: 'new_message', is_read: false, created_at: '2026-02-22' },
];

export const mockData = {
  currentUser: mockUsers[0],
  users: mockUsers,
  hostProfiles: mockHostProfiles,
  guestProfiles: mockGuestProfiles,
  matchRequests: mockMatchRequests,
  matches: mockMatches,
  conversations: mockConversations,
  messages: mockMessages,
  reviews: mockReviews,
  communityProfiles: mockCommunityProfiles,
  communityConnections: mockCommunityConnections,
  notifications: mockNotifications,
};
