export type RegistrationStatus = "CONFIRMED" | "CANCELLED" | "WAITLISTED" | "EXPIRED";

export type Registration = {
  id: number;
  eventId: number;
  userId: number;
  seatNumber?: string | null;
  status: RegistrationStatus;
  qrCode?: string | null;
  registeredAt: string;
  cancelledAt?: string | null;
  cancellationReason?: string | null;
  event?: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    location: string;
    bannerUrl?: string | null;
  };
};

export type RegistrationRequest = {
  eventId: number;
  seatNumber?: string;
  attendeeName?: string;
  attendeeEmail?: string;
};

export type CheckInMethod = "QR_CODE" | "MANUAL";

export type CheckIn = {
  id: number;
  registrationId: number;
  checkInTime: string;
  method: CheckInMethod;
  checkedInBy?: number | null;
  notes?: string | null;
};

export type CheckInResult = {
  success: boolean;
  message: string;
  checkIn?: CheckIn;
  registration?: Registration;
};
