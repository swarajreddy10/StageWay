export const API_ROUTES = {
  analytics: {
    overview: "/api/analytics/overview",
    event: (eventId: number | string) => `/api/analytics/events/${eventId}`,
  },
  auth: {
    logout: "/api/auth/logout",
    oauthStart: "/api/auth/oauth/start",
    supabase: "/api/auth/supabase",
    user: "/api/auth/user",
  },
  checkins: "/api/checkins",
  events: "/api/events",
  event: (eventId: number | string) => `/api/events/${eventId}`,
  eventAttendees: (eventId: number | string) => `/api/events/${eventId}/attendees`,
  hostEvents: "/api/events/my",
  files: "/api/files",
  registration: (registrationId: number | string) => `/api/registrations/${registrationId}`,
  registrationCheckIn: (registrationId: number | string) =>
    `/api/registrations/${registrationId}/check-in`,
  registrations: "/api/registrations",
  users: {
    profile: "/api/users/profile",
  },
  waitlist: "/api/waitlist",
} as const;
