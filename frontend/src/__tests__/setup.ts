// Global test setup
import { beforeAll, afterEach } from "bun:test";

// Create proper storage mocks
const createStorage = () => {
  const store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      Object.keys(store).forEach((key) => delete store[key]);
    },
    length: 0,
    key: () => null,
  };
};

// Mock window object
global.window = {
  localStorage: createStorage(),
  sessionStorage: createStorage(),
  location: {
    protocol: "http:",
    hostname: "localhost",
    origin: "http://localhost:3000",
  },
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {},
} as unknown as Window & typeof globalThis;

global.location = global.window.location;

// Mock localStorage and sessionStorage
global.localStorage = global.window.localStorage;
global.sessionStorage = global.window.sessionStorage;

// Mock fetch
global.fetch = async () =>
  new Response(JSON.stringify({}), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });

beforeAll(() => {
  console.log("🧪 Test environment initialized");
});

afterEach(() => {
  // Clear mocks after each test
  localStorage.clear();
  sessionStorage.clear();
});
