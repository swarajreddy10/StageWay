export type WaitlistStatus = "WAITING" | "PROMOTED" | "EXPIRED" | "CANCELLED";

export type Waitlist = {
  id: number;
  eventId: number;
  userId: number;
  position: number;
  joinedAt: string;
  promotedAt?: string | null;
  expiredAt?: string | null;
  status: WaitlistStatus;
  event?: {
    id: number;
    name: string;
    startDate: string;
  };
};

export type WaitlistRequest = {
  eventId: number;
};
