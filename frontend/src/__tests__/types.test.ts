import { expectTypeOf, test } from "bun:test";
import type { User, AuthResponse } from "@/types/auth";
import type { Event } from "@/types/event";
import type { Registration } from "@/types/registration";

test("User type structure", () => {
  expectTypeOf<User>().toMatchTypeOf<{
    id: number;
    email: string;
    fullName: string;
    role: "ATTENDEE" | "ORGANIZER" | "ADMIN";
  }>();
});

test("AuthResponse type structure", () => {
  expectTypeOf<AuthResponse>().toMatchTypeOf<{
    user: User;
    token: string;
  }>();
});

test("Event type structure", () => {
  expectTypeOf<Event>().toHaveProperty("id");
  expectTypeOf<Event>().toHaveProperty("title");
  expectTypeOf<Event>().toHaveProperty("description");
  expectTypeOf<Event>().toHaveProperty("startDateTime");
  expectTypeOf<Event>().toHaveProperty("endDateTime");
});

test("Registration type structure", () => {
  expectTypeOf<Registration>().toHaveProperty("id");
  expectTypeOf<Registration>().toHaveProperty("eventId");
  expectTypeOf<Registration>().toHaveProperty("userId");
  expectTypeOf<Registration>().toHaveProperty("attendeeName");
  expectTypeOf<Registration>().toHaveProperty("attendeeEmail");
});
