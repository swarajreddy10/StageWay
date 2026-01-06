import { API_ROUTES } from "@/lib/api-routes";
import {
  API_BASE_URL,
  API_BASE_URL_SERVER,
  DEFAULT_API_ORIGIN,
  DEFAULT_API_PORT,
  FILE_API_BASE_URL,
  LOCAL_HOSTS,
} from "@/lib/env";

const normalizeBase = (value: string) => (value.endsWith("/") ? value.slice(0, -1) : value);

const isLocalHost = (host: string) => LOCAL_HOSTS.has(host);

const resolveFromWindow = () =>
  `${window.location.protocol}//${window.location.hostname}:${DEFAULT_API_PORT}`;

export const resolveApiBaseUrl = () => {
  const envBase = normalizeBase(API_BASE_URL);
  const serverBase = normalizeBase(API_BASE_URL_SERVER);

  if (typeof window === "undefined") {
    return serverBase || envBase || DEFAULT_API_ORIGIN;
  }

  if (!envBase) {
    return resolveFromWindow();
  }

  try {
    const parsed = new URL(envBase);
    if (isLocalHost(parsed.hostname) && !isLocalHost(window.location.hostname)) {
      return resolveFromWindow();
    }
    return envBase;
  } catch {
    return resolveFromWindow();
  }
};

export const resolveFileBaseUrl = () => {
  const fileBase = normalizeBase(FILE_API_BASE_URL);

  if (typeof window === "undefined") {
    return fileBase || resolveApiBaseUrl();
  }

  if (!fileBase) {
    return resolveApiBaseUrl();
  }

  try {
    const parsed = new URL(fileBase);
    if (isLocalHost(parsed.hostname) && !isLocalHost(window.location.hostname)) {
      return resolveFromWindow();
    }
    return fileBase;
  } catch {
    return resolveFromWindow();
  }
};

export const resolveAssetUrl = (value: string) => {
  if (!value) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${resolveFileBaseUrl()}${value}`;
  }

  try {
    const parsed = new URL(value);
    if (typeof window !== "undefined") {
      const normalizedPath = `${parsed.pathname}${parsed.search}`;
      if (isLocalHost(parsed.hostname) && !isLocalHost(window.location.hostname)) {
        return `${resolveFileBaseUrl()}${normalizedPath}`;
      }
    }
  } catch {
    return value;
  }

  return value;
};

const FILE_ROUTE = `${API_ROUTES.files}/`;
export const isBackendAssetUrl = (value: string) => value.includes(FILE_ROUTE);
