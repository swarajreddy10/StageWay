export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELLED" | "COMPLETED";

export type EventCategory =
  | "WORKSHOP"
  | "CONCERT"
  | "CONFERENCE"
  | "SEMINAR"
  | "NETWORKING"
  | "SPORTS"
  | "ARTS"
  | "OTHER";

export type Event = {
  id: number;
  organizerId: number;
  organizationId?: number | null;
  name: string;
  description: string;
  category?: EventCategory | null;
  startDate: string;
  endDate: string;
  startsAt?: string;
  endsAt?: string;
  location: string;
  venueName?: string | null;
  venueAddress?: string | null;
  city?: string | null;
  capacity: number;
  availableSeats: number;
  price: number;
  currency: string;
  bannerUrl?: string | null;
  bannerImageUrl?: string | null;
  priceRange?: string | null;
  organizerName?: string | null;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
  isFeatured: boolean;
  tags?: string[] | null;
};

export type CreateEventRequest = {
  name: string;
  description: string;
  category?: EventCategory;
  startDate: string;
  endDate: string;
  location: string;
  venueName?: string;
  capacity: number;
  price?: number;
  currency?: string;
  bannerUrl?: string;
  bannerImageUrl?: string;
  startsAt?: string;
  endsAt?: string;
  status?: EventStatus;
  organizationId?: number;
  venueAddress?: string;
  city?: string;
  priceRange?: string;
  organizerName?: string;
  tags?: string[];
};

export type UpdateEventRequest = Partial<CreateEventRequest>;

export type EventFilters = {
  search?: string;
  category?: EventCategory;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  isFree?: boolean;
};

export type EventAttendee = {
  registrationId: number;
  userId: number;
  fullName: string;
  email: string;
  status: string;
  seatNumber: number | null;
  registeredAt: string;
  checkedInAt?: string | null;
};
