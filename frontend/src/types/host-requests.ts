export type HostAccessRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type HostAccessRequest = {
  id: number;
  status: HostAccessRequestStatus;
  note?: string | null;
  companyName?: string | null;
  eventPlan?: string | null;
  createdAt: string;
  reviewedAt?: string | null;
};

export type HostAccessRequestAdmin = HostAccessRequest & {
  userId: number;
  email?: string | null;
  fullName?: string | null;
};

export type HostAccessRequestCreatePayload = {
  note?: string | null;
  companyName?: string | null;
  eventPlan?: string | null;
};

export type HostAccessRequestDecisionPayload = {
  status: Exclude<HostAccessRequestStatus, "PENDING">;
};
