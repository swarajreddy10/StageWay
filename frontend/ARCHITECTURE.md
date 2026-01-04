# Event Edit Feature - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │  Event Detail    │      │   Event Edit     │               │
│  │     Page         │─────▶│      Page        │               │
│  │  /events/[id]    │      │ /events/[id]/edit│               │
│  └──────────────────┘      └──────────────────┘               │
│         │                           │                           │
│         │ canEdit?                  │                           │
│         ▼                           ▼                           │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │  EventDetails    │      │   EventForm      │               │
│  │   Component      │      │   Component      │               │
│  │  - View event    │      │  - Edit fields   │               │
│  │  - Edit button   │      │  - Validation    │               │
│  └──────────────────┘      │  - Auto-save     │               │
│                             └──────────────────┘               │
│                                     │                           │
└─────────────────────────────────────┼───────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────┐
        │   useDebounce    │ │  Countries   │ │  Validation  │
        │      Hook        │ │ & Currencies │ │   Utilities  │
        │  - 2s delay      │ │  - 20 ctry   │ │  - Sanitize  │
        │  - Auto-save     │ │  - 16 curr   │ │  - Validate  │
        └──────────────────┘ └──────────────┘ └──────────────┘
                    │                 │                 │
                    └─────────────────┼─────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │     STATE MANAGEMENT            │
                    │      (Zustand Store)            │
                    ├─────────────────────────────────┤
                    │  - events: Event[]              │
                    │  - currentEvent: Event | null   │
                    │  - isLoading: boolean           │
                    │  - error: string | null         │
                    ├─────────────────────────────────┤
                    │  Methods:                       │
                    │  - fetchEvents()                │
                    │  - fetchEvent(id)               │
                    │  - createEvent(data)            │
                    │  - updateEvent(id, data) ◀──────┼─── Auto-save
                    │  - deleteEvent(id)              │
                    └─────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │         API CLIENT              │
                    │      (apiClient.ts)             │
                    ├─────────────────────────────────┤
                    │  - get(endpoint)                │
                    │  - post(endpoint, data)         │
                    │  - put(endpoint, data)          │
                    │  - delete(endpoint)             │
                    │  - Adds auth token              │
                    │  - Handles errors               │
                    └─────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │         BACKEND API             │
                    │      (Spring Boot)              │
                    ├─────────────────────────────────┤
                    │  GET    /api/events             │
                    │  GET    /api/events/:id         │
                    │  POST   /api/events             │
                    │  PUT    /api/events/:id ◀───────┼─── Update endpoint
                    │  DELETE /api/events/:id         │
                    ├─────────────────────────────────┤
                    │  - Authentication               │
                    │  - Authorization (HOST/ADMIN)   │
                    │  - Validation                   │
                    │  - Database operations          │
                    └─────────────────────────────────┘
                                      │
                                      ▼
                    ┌─────────────────────────────────┐
                    │         DATABASE                │
                    │      (PostgreSQL)               │
                    ├─────────────────────────────────┤
                    │  events table:                  │
                    │  - id (PK)                      │
                    │  - name                         │
                    │  - description                  │
                    │  - start_date                   │
                    │  - end_date                     │
                    │  - location                     │
                    │  - capacity                     │
                    │  - price                        │
                    │  - currency                     │
                    │  - ...                          │
                    └─────────────────────────────────┘
```

## Data Flow - Edit Event

```
┌──────────┐
│  User    │
│  clicks  │
│  Edit    │
└────┬─────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. NAVIGATION                                               │
│    /events/[id] → /events/[id]/edit                        │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. AUTHENTICATION CHECK                                     │
│    - Is user logged in?                                     │
│    - Is user HOST or ADMIN?                                 │
│    - If not, redirect to login/dashboard                    │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. FETCH EVENT DATA                                         │
│    GET /api/events/:id                                      │
│    - Load existing event data                               │
│    - Show loading spinner                                   │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. PRE-POPULATE FORM                                        │
│    - Fill all fields with existing data                     │
│    - Set up validation schema                               │
│    - Initialize auto-save                                   │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. USER MAKES CHANGES                                       │
│    - User types in fields                                   │
│    - Real-time validation                                   │
│    - Show inline errors                                     │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. AUTO-SAVE (Debounced)                                    │
│    - Wait 2 seconds after typing stops                      │
│    - Show "Saving..." status                                │
│    - PUT /api/events/:id (partial update)                   │
│    - Show "Saved" or "Failed to save"                       │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. MANUAL SAVE (Optional)                                   │
│    - User clicks "Update Event"                             │
│    - Validate all fields                                    │
│    - PUT /api/events/:id (full update)                      │
│    - Show loading spinner                                   │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. SUCCESS REDIRECT                                         │
│    - Update Zustand store                                   │
│    - Redirect to /events/[id]                               │
│    - Show updated event                                     │
└─────────────────────────────────────────────────────────────┘
```

## Validation Flow

```
┌──────────────┐
│ User Input   │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. CLIENT-SIDE VALIDATION (Zod Schema)                     │
├─────────────────────────────────────────────────────────────┤
│  ✓ Check field types                                        │
│  ✓ Check min/max lengths                                    │
│  ✓ Check required fields                                    │
│  ✓ Check date logic                                         │
│  ✓ Check URL format                                         │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. INPUT SANITIZATION                                       │
├─────────────────────────────────────────────────────────────┤
│  ✓ Remove HTML tags                                         │
│  ✓ Remove script tags                                       │
│  ✓ Trim whitespace                                          │
│  ✓ Escape special characters                                │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. TRANSFORM DATA                                           │
├─────────────────────────────────────────────────────────────┤
│  ✓ Convert dates to ISO format                              │
│  ✓ Parse numbers                                            │
│  ✓ Split tags array                                         │
│  ✓ Format currency                                          │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SEND TO API                                              │
│    PUT /api/events/:id                                      │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. SERVER-SIDE VALIDATION (Spring Boot)                    │
├─────────────────────────────────────────────────────────────┤
│  ✓ Verify authentication                                    │
│  ✓ Check authorization (HOST/ADMIN)                         │
│  ✓ Validate data types                                      │
│  ✓ Check business rules                                     │
│  ✓ Verify database constraints                              │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. DATABASE UPDATE                                          │
│    UPDATE events SET ... WHERE id = ?                       │
└────┬────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. RETURN RESPONSE                                          │
│    - Success: Updated event object                          │
│    - Error: Error message                                   │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
│
├── EventDetailPage (/events/[id])
│   ├── EventDetails
│   │   ├── Edit Button (if canEdit)
│   │   ├── Share Button
│   │   └── Add to Calendar Button
│   │
│   └── RegistrationForm (if not registered)
│
└── EventEditPage (/events/[id]/edit)
    ├── Back Button
    ├── Page Header
    └── EventForm
        ├── Basic Information Card
        │   ├── Name Input
        │   ├── Description Textarea
        │   ├── Category Select
        │   └── Capacity Input
        │
        ├── Date & Time Card
        │   ├── Start Date Input
        │   └── End Date Input
        │
        ├── Location Card
        │   ├── Country Select ──┐
        │   ├── Location Input   │
        │   └── Venue Input      │
        │                        │
        ├── Banner Card          │
        │   ├── URL Input        │
        │   ├── File Upload      │
        │   └── Preview          │
        │                        │
        ├── Pricing Card         │
        │   ├── Price Input      │
        │   └── Currency Select ◄┘ (auto-filled from country)
        │
        ├── Tags Card
        │   └── Tags Input
        │
        └── Submit Section
            ├── Auto-save Status
            └── Update Button
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: CLIENT-SIDE SECURITY                               │
├─────────────────────────────────────────────────────────────┤
│  ✓ Input sanitization (remove HTML/script tags)             │
│  ✓ URL validation (prevent javascript: URLs)                │
│  ✓ Length limits (prevent buffer overflow)                  │
│  ✓ Type validation (ensure correct data types)              │
│  ✓ XSS prevention (escape special characters)               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: AUTHENTICATION                                     │
├─────────────────────────────────────────────────────────────┤
│  ✓ JWT token validation                                     │
│  ✓ Token expiry check                                       │
│  ✓ User session verification                                │
│  ✓ Redirect if not authenticated                            │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: AUTHORIZATION                                      │
├─────────────────────────────────────────────────────────────┤
│  ✓ Role check (HOST or ADMIN)                               │
│  ✓ Ownership verification (HOST can edit own events)        │
│  ✓ Permission check (ADMIN can edit all events)             │
│  ✓ Redirect if unauthorized                                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 4: API SECURITY                                       │
├─────────────────────────────────────────────────────────────┤
│  ✓ HTTPS encryption (in production)                         │
│  ✓ CORS policy enforcement                                  │
│  ✓ Rate limiting (prevent abuse)                            │
│  ✓ Request validation                                       │
│  ✓ CSRF protection                                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 5: SERVER-SIDE VALIDATION                             │
├─────────────────────────────────────────────────────────────┤
│  ✓ Re-validate all inputs                                   │
│  ✓ Check business rules                                     │
│  ✓ Verify database constraints                              │
│  ✓ SQL injection prevention (parameterized queries)         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ LAYER 6: DATABASE SECURITY                                  │
├─────────────────────────────────────────────────────────────┤
│  ✓ Encrypted connections                                    │
│  ✓ Prepared statements                                      │
│  ✓ Transaction isolation                                    │
│  ✓ Audit logging                                            │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
frontend/
├── src/
│   ├── app/
│   │   └── events/
│   │       ├── [id]/
│   │       │   ├── page.tsx ──────────────┐ (Event Detail)
│   │       │   └── edit/                  │
│   │       │       └── page.tsx ◄─────────┘ (Event Edit) ★ NEW
│   │       └── new/
│   │           └── page.tsx (Event Create)
│   │
│   ├── components/
│   │   └── events/
│   │       ├── EventForm.tsx ────────────── (Enhanced) ★ MODIFIED
│   │       └── EventDetails.tsx ─────────── (Edit button) ★ MODIFIED
│   │
│   ├── hooks/
│   │   ├── useEvents.ts
│   │   └── useDebounce.ts ───────────────── (Auto-save) ★ NEW
│   │
│   ├── lib/
│   │   ├── countries-currencies.ts ──────── (20 countries, 16 currencies) ★ NEW
│   │   ├── countries-currencies-extended.ts (50+ countries) ★ NEW
│   │   └── validation.ts ────────────────── (Sanitization) ★ NEW
│   │
│   ├── stores/
│   │   └── eventStore.ts (Zustand)
│   │
│   └── types/
│       └── event.ts
│
└── Documentation/
    ├── EVENT_EDIT_FEATURE.md ────────────── (Feature docs) ★ NEW
    ├── COUNTRIES_CURRENCIES_GUIDE.md ────── (Dev guide) ★ NEW
    ├── IMPLEMENTATION_SUMMARY.md ─────────── (Tech details) ★ NEW
    ├── TESTING_CHECKLIST.md ─────────────── (162 tests) ★ NEW
    ├── QUICK_START_GUIDE.md ─────────────── (Quick start) ★ NEW
    ├── README_EVENT_EDIT.md ─────────────── (Overview) ★ NEW
    └── ARCHITECTURE.md ──────────────────── (This file) ★ NEW

★ NEW = Created in this implementation
★ MODIFIED = Enhanced in this implementation
```

## Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND                                                    │
├─────────────────────────────────────────────────────────────┤
│  Framework:      Next.js 16.1.1 (React 19.2.3)              │
│  Language:       TypeScript 5.9.3                           │
│  Styling:        Tailwind CSS 3.4.19                        │
│  Forms:          React Hook Form 7.69.0                     │
│  Validation:     Zod 4.2.1                                  │
│  State:          Zustand 5.0.1                              │
│  UI Components:  Radix UI                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│ BACKEND                                                     │
├─────────────────────────────────────────────────────────────┤
│  Framework:      Spring Boot                                │
│  Language:       Java                                       │
│  Database:       PostgreSQL (Supabase)                      │
│  Auth:           JWT                                        │
│  API:            REST                                       │
└─────────────────────────────────────────────────────────────┘
```

---

**Last Updated**: December 28, 2024
**Version**: 1.0.0
