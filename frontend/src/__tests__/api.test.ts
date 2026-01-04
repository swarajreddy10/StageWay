import { describe, test, expect, mock, beforeEach } from "bun:test";
import { apiClient } from "@/lib/api";

describe("API Client", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("GET requests", () => {
    test("makes successful GET request", async () => {
      const mockData = { id: 1, name: "Test" };
      global.fetch = mock(
        async () =>
          new Response(JSON.stringify(mockData), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          })
      );

      const result = await apiClient.get("/test");
      expect(result).toEqual(mockData);
    });

    test("does not include auth token headers when using cookies", async () => {
      localStorage.setItem("token", "test-token");
      let headerChecked = false;

      global.fetch = mock(async (_url: string | URL | Request, options?: RequestInit) => {
        const headers = options?.headers as Record<string, string>;
        if (!headers?.Authorization) {
          headerChecked = true;
        }
        return new Response(JSON.stringify({}), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }) as typeof fetch;

      await apiClient.get("/test");
      expect(headerChecked).toBe(true);
    });
  });

  describe("POST requests", () => {
    test("sends data in request body", async () => {
      const postData = { name: "Test" };
      let bodyChecked = false;

      global.fetch = mock(async (_url: string | URL | Request, options?: RequestInit) => {
        const body = options?.body as string;
        if (body && JSON.parse(body).name === "Test") {
          bodyChecked = true;
        }
        return new Response(JSON.stringify({ id: 1, ...postData }), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        });
      }) as typeof fetch;

      const result = await apiClient.post("/test", postData);
      expect(bodyChecked).toBe(true);
      expect(result).toEqual({ id: 1, ...postData });
    });
  });

  describe("Error handling", () => {
    test("throws error on 4xx response", async () => {
      global.fetch = mock(
        async () => new Response(JSON.stringify({ message: "Not found" }), { status: 404 })
      );

      expect(async () => await apiClient.get("/test")).toThrow();
    });

    test("throws error on 5xx response", async () => {
      global.fetch = mock(
        async () => new Response(JSON.stringify({ message: "Server error" }), { status: 500 })
      );

      expect(async () => await apiClient.get("/test")).toThrow();
    });
  });
});
