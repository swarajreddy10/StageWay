const ROLE_STORAGE_KEY = "stageway.desiredRole";

export const normalizeDesiredRole = (value?: string | null) => {
  if (!value) {
    return null;
  }
  const normalized = value.trim().toUpperCase();
  if (normalized === "HOST" || normalized === "ORGANIZER") {
    return "HOST";
  }
  if (normalized === "ATTENDEE") {
    return "ATTENDEE";
  }
  return null;
};

export const persistDesiredRole = (value?: string | null) => {
  if (typeof window === "undefined") return;
  const normalized = normalizeDesiredRole(value);
  if (!normalized) {
    sessionStorage.removeItem(ROLE_STORAGE_KEY);
    return;
  }
  sessionStorage.setItem(ROLE_STORAGE_KEY, normalized);
};

export const consumeDesiredRole = () => {
  if (typeof window === "undefined") return null;
  const role = sessionStorage.getItem(ROLE_STORAGE_KEY);
  sessionStorage.removeItem(ROLE_STORAGE_KEY);
  return normalizeDesiredRole(role);
};
