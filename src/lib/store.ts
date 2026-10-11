import type {
  User, HostProfile, GuestProfile, MatchRequest, Match,
  Conversation, Message, Review, CommunityProfile,
  CommunityConnection, Notification,
} from './types';
import { mockData } from './mock-data';

export interface AppStore {
  // Auth
  currentUser: User | null;
  users: User[];

  // Profiles
  hostProfiles: HostProfile[];
  guestProfiles: GuestProfile[];

  // Matches
  matchRequests: MatchRequest[];
  matches: Match[];

  // Chat
  conversations: Conversation[];
  messages: Message[];

  // Reviews
  reviews: Review[];

  // Community
  communityProfiles: CommunityProfile[];
  communityConnections: CommunityConnection[];

  // Notifications
  notifications: Notification[];
}

let store: AppStore | null = null;

export function getStore(): AppStore {
  if (!store) {
    store = mockData;
  }
  return store!;
}

export function resetStore() {
  store = null;
}
