export type EventAnalytics = {
  eventId: number;
  totalRegistrations: number;
  checkedInCount: number;
  checkInRate: number;
  registrationTrend: {
    date: string;
    count: number;
  }[];
  attendeeDemographics: {
    ageGroup: string;
    count: number;
  }[];
  popularTimeSlots: {
    hour: number;
    registrations: number;
  }[];
  revenue?: {
    total: number;
    currency: string;
  };
};

export type AnalyticsOverview = {
  totalEvents: number;
  publishedEvents: number;
  totalRegistrations: number;
  confirmedRegistrations: number;
  waitlistedRegistrations: number;
  checkedInRegistrations: number;
};

export type HostAnalytics = {
  overview: AnalyticsOverview;
  topEvents: EventPerformance[];
  categoryBreakdown: CategoryStats[];
  revenueTimeline: RevenuePoint[];
  registrationStatus: StatusDistribution[];
  engagement: EngagementMetrics;
};

export type EventPerformance = {
  eventId: number;
  eventName: string;
  registrations: number;
  checkedIn: number;
  checkInRate: number;
  revenue: number;
  currency: string;
};

export type CategoryStats = {
  category: string;
  eventCount: number;
  totalRegistrations: number;
  avgCheckInRate: number;
};

export type RevenuePoint = {
  month: string;
  revenue: number;
  registrations: number;
};

export type StatusDistribution = {
  status: string;
  count: number;
  percentage: number;
};

export type EngagementMetrics = {
  avgRegistrationsPerEvent: number;
  avgCheckInRate: number;
  cancellationRate: number;
  peakRegistrationHour: number;
};

export type PlatformAnalytics = {
  totalEvents: number;
  totalRegistrations: number;
  activeUsers: number;
  popularCategories: {
    category: string;
    count: number;
  }[];
  systemMetrics: {
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
  };
};
