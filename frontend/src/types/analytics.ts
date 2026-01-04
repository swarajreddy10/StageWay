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
