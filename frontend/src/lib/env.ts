export const API_BASE_URL_ENV = "NEXT_PUBLIC_API_BASE_URL";
export const API_BASE_URL_SERVER_ENV = "API_BASE_URL";
export const FILE_API_BASE_URL_ENV = "NEXT_PUBLIC_FILE_API_BASE_URL";
export const SUPABASE_ANON_KEY_ENV = "NEXT_PUBLIC_SUPABASE_ANON_KEY";
export const SUPABASE_URL_ENV = "NEXT_PUBLIC_SUPABASE_URL";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
export const API_BASE_URL_SERVER = process.env.API_BASE_URL ?? "";
export const FILE_API_BASE_URL = process.env.NEXT_PUBLIC_FILE_API_BASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

export const DEFAULT_API_PORT = 8081;
export const DEFAULT_API_ORIGIN = `http://localhost:${DEFAULT_API_PORT}`;
export const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);
