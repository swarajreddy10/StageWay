# Event Management Platform - User Stories & Technical Specification

## Executive Summary

This document provides comprehensive user stories, technical specifications, and implementation guidelines for building an enterprise-grade event management platform similar to Eventbrite. The platform serves two primary user types: **Event Hosts** (organizers) and **Attendees**, providing a unified experience for event creation, discovery, registration, and management.

**Platform Vision**: A scalable, modern event management system that handles everything from small workshops to large concerts, supporting thousands of concurrent users with real-time updates, automated workflows, and professional-grade features.

---

## Table of Contents

1. [User Personas](#user-personas)
2. [Core User Stories](#core-user-stories)
3. [Technical Architecture](#technical-architecture)
4. [Frontend Requirements](#frontend-requirements)
5. [Backend Requirements](#backend-requirements)
6. [Modern Tech Stack](#modern-tech-stack)
7. [Free Tier Implementation](#free-tier-implementation)
8. [System Design](#system-design)
9. [API Specifications](#api-specifications)
10. [Database Schema](#database-schema)
11. [Security & Compliance](#security--compliance)
12. [Scalability & Performance](#scalability--performance)

---

## User Personas

### Persona 1: Event Host (Organizer)
**Name**: Sarah Chen  
**Role**: Event Manager at Tech Conference Company  
**Goals**:
- Create and manage multiple events efficiently
- Track registrations and attendee data in real-time
- Generate QR codes for seamless check-ins
- Analyze event performance with detailed analytics
- Communicate with attendees effectively

**Pain Points**:
- Manual registration processes are time-consuming
- Difficulty tracking attendance and capacity
- Lack of real-time updates during events
- Poor analytics and reporting tools
- Complex tools with steep learning curves

### Persona 2: Attendee
**Name**: Michael Rodriguez  
**Role**: Software Developer  
**Goals**:
- Discover relevant events easily
- Quick and simple registration process
- Receive instant confirmation with QR pass
- Get timely reminders and updates
- Manage all event registrations in one place

**Pain Points**:
- Complex registration forms
- Lost confirmation emails
- No mobile-friendly check-in process
- Lack of event reminders
- Difficulty finding event details

---

## Core User Stories

### Epic 1: User Authentication & Profile Management

#### US-1.1: User Registration
**As a** new user  
**I want to** register with email/password or social login  
**So that** I can access the platform and manage my profile

**Acceptance Criteria**:
- User can register with email and password
- User can register with Google OAuth
- Email verification is sent upon registration
- Password must meet security requirements (min 8 chars, uppercase, lowercase, number)
- User profile is created with default role (ATTENDEE)
- Duplicate email registrations are prevented

**Frontend Tasks**:
- Create registration form with validation
- Implement Google OAuth button
- Show password strength indicator
- Display success/error messages
- Redirect to dashboard after successful registration

**Backend Tasks**:
- POST /api/auth/register endpoint
- BCrypt password hashing
- JWT token generation
- Email verification service
- Google OAuth integration
- User entity creation in database

**Technical Notes**:
- Use React Hook Form + Zod for validation
- Store JWT in httpOnly cookies
- Redis session management for scalability

---

#### US-1.2: User Login
**As a** registered user  
**I want to** login with my credentials  
**So that** I can access my account and events

**Acceptance Criteria**:
- User can login with email and password
- User can login with Google OAuth
- Invalid credentials show appropriate error
- Successful login redirects to dashboard
- Session persists across browser refreshes
- "Remember me" option available

**Frontend Tasks**:
- Create login form with validation
- Implement OAuth flow
- Handle authentication state
- Store auth token securely
- Implement protected routes

**Backend Tasks**:
- POST /api/auth/login endpoint
- Password verification with BCrypt
- JWT token generation with 1-hour expiry
- Redis session storage
- Rate limiting for login attempts

---

#### US-1.3: Profile Management
**As a** logged-in user  
**I want to** view and update my profile  
**So that** I can keep my information current

**Acceptance Criteria**:
- User can view profile details
- User can update name, email, phone
- User can change password
- User can upload profile picture
- Changes are saved and reflected immediately

**Frontend Tasks**:
- Create profile page with form
- Image upload component
- Password change modal
- Form validation
- Success/error notifications

**Backend Tasks**:
- GET /api/users/profile endpoint
- PUT /api/users/profile endpoint
- PUT /api/users/password endpoint
- Image upload to Cloudinary
- Profile update validation

---

### Epic 2: Event Discovery & Browsing

#### US-2.1: Browse Events
**As an** attendee  
**I want to** browse all available events  
**So that** I can discover events I'm interested in

**Acceptance Criteria**:
- Display all published events in a grid/list view
- Show event thumbnail, title, date, location, price
- Events are sorted by date (upcoming first)
- Pagination or infinite scroll for large lists
- Mobile-responsive design

**Frontend Tasks**:
- Create event listing page
- Event card component
- Pagination component
- Loading states and skeletons
- Empty state for no events

**Backend Tasks**:
- GET /api/events endpoint
- Query optimization with pagination
- Filter by status (PUBLISHED only)
- Include event thumbnail URLs
- Response caching with Redis

---

#### US-2.2: Search and Filter Events
**As an** attendee  
**I want to** search and filter events  
**So that** I can find specific events quickly

**Acceptance Criteria**:
- Search by event name or description
- Filter by category (workshop, concert, conference, etc.)
- Filter by date range
- Filter by location
- Filter by price (free, paid)
- Results update in real-time

**Frontend Tasks**:
- Search input with debouncing
- Filter sidebar/dropdown
- Date range picker
- Category chips/tags
- Clear filters button

**Backend Tasks**:
- GET /api/events/search endpoint
- Full-text search with PostgreSQL
- Dynamic query building
- Index optimization
- Response caching

---

#### US-2.3: View Event Details
**As an** attendee  
**I want to** view detailed event information  
**So that** I can decide whether to register

**Acceptance Criteria**:
- Display full event description
- Show date, time, location, capacity
- Display organizer information
- Show available seats count
- Display event banner image
- Show registration button if seats available
- Show "Sold Out" if capacity reached

**Frontend Tasks**:
- Create event details page
- Responsive image gallery
- Capacity indicator
- Registration CTA button
- Share event functionality
- Add to calendar button

**Backend Tasks**:
- GET /api/events/:id endpoint
- Include related data (organizer, venue)
- Real-time seat availability
- View count tracking
- Response caching

---

### Epic 3: Event Creation & Management (Host)

#### US-3.1: Create Event
**As a** host  
**I want to** create a new event  
**So that** attendees can discover and register

**Acceptance Criteria**:
- Multi-step form for event creation
- Required fields: name, description, date, time, location, capacity
- Optional fields: banner image, category, price
- Form validation at each step
- Draft save functionality
- Preview before publishing

**Frontend Tasks**:
- Multi-step form component
- Rich text editor for description
- Date/time picker
- Image upload with preview
- Form state management
- Draft auto-save

**Backend Tasks**:
- POST /api/events endpoint
- Event validation
- Image upload to Cloudinary
- Event status (DRAFT, PUBLISHED)
- Organizer association
- Database transaction

**Technical Notes**:
- Use React Hook Form for multi-step forms
- Cloudinary for image CDN
- Auto-save drafts every 30 seconds

---

#### US-3.2: Edit Event
**As a** host  
**I want to** edit my event details  
**So that** I can update information or fix errors

**Acceptance Criteria**:
- Host can edit only their own events
- All event fields are editable
- Changes are saved immediately
- Attendees are notified of major changes
- Edit history is tracked

**Frontend Tasks**:
- Pre-populate form with existing data
- Show unsaved changes indicator
- Confirmation dialog for major changes
- Success notification

**Backend Tasks**:
- PUT /api/events/:id endpoint
- Authorization check (owner only)
- Change detection
- Email notification service
- Audit log creation

---

#### US-3.3: Manage Event Status
**As a** host  
**I want to** publish, unpublish, or cancel events  
**So that** I can control event visibility

**Acceptance Criteria**:
- Host can publish draft events
- Host can unpublish events
- Host can cancel events
- Status changes notify attendees
- Cancelled events show refund information

**Frontend Tasks**:
- Status toggle buttons
- Confirmation dialogs
- Status badge display
- Notification preview

**Backend Tasks**:
- PATCH /api/events/:id/status endpoint
- Status validation
- Email notifications
- Refund processing (if applicable)
- Database update

---

#### US-3.4: View Event Dashboard
**As a** host  
**I want to** view analytics for my event  
**So that** I can track performance

**Acceptance Criteria**:
- Display total registrations
- Show checked-in vs not checked-in
- Display registration trend chart
- Show attendee demographics
- Export attendee list as CSV

**Frontend Tasks**:
- Analytics dashboard page
- Charts with Recharts
- Export button
- Real-time updates via WebSocket
- Responsive design

**Backend Tasks**:
- GET /api/events/:id/analytics endpoint
- Aggregate queries
- CSV export generation
- Real-time data via WebSocket
- Caching for performance

---

### Epic 4: Event Registration (Attendee)

#### US-4.1: Register for Event
**As an** attendee  
**I want to** register for an event  
**So that** I can attend

**Acceptance Criteria**:
- Registration form with required fields
- Seat allocation is automatic
- Registration confirmation shown immediately
- QR code generated and displayed
- Confirmation email sent with QR code
- Registration added to user's dashboard

**Frontend Tasks**:
- Registration form component
- Seat selection (if applicable)
- Payment integration (if paid event)
- QR code display
- Success page with download option

**Backend Tasks**:
- POST /api/registrations endpoint
- Seat allocation algorithm
- Capacity validation
- QR code generation (ZXing)
- Email notification with QR attachment
- Database transaction

**Technical Notes**:
- Use optimistic locking for seat allocation
- Generate unique QR codes with encryption
- Send email asynchronously

---

#### US-4.2: View Registration Details
**As an** attendee  
**I want to** view my registration details  
**So that** I can access my QR pass

**Acceptance Criteria**:
- Display event details
- Show QR code for check-in
- Display registration status
- Show check-in status
- Download QR code as image
- Add event to calendar

**Frontend Tasks**:
- Registration details page
- QR code display component
- Download button
- Calendar integration
- Share functionality

**Backend Tasks**:
- GET /api/registrations/:id endpoint
- QR code retrieval
- Status tracking
- Authorization check

---

#### US-4.3: Cancel Registration
**As an** attendee  
**I want to** cancel my registration  
**So that** I can free up my spot

**Acceptance Criteria**:
- Attendee can cancel before event date
- Confirmation dialog shown
- Seat is released back to pool
- Waitlist is promoted automatically
- Cancellation email sent

**Frontend Tasks**:
- Cancel button with confirmation
- Cancellation reason form
- Success notification

**Backend Tasks**:
- DELETE /api/registrations/:id endpoint
- Seat release logic
- Waitlist promotion
- Email notifications
- Database update

---

### Epic 5: Check-in System

#### US-5.1: QR Code Check-in (Host)
**As a** host  
**I want to** scan attendee QR codes  
**So that** I can check them in

**Acceptance Criteria**:
- Camera access for QR scanning
- QR code validation
- Check-in status updated immediately
- Duplicate check-in prevented
- Offline mode available
- Check-in count updated in real-time

**Frontend Tasks**:
- QR scanner component (html5-qrcode)
- Camera permission handling
- Success/error feedback
- Offline queue management
- Real-time counter

**Backend Tasks**:
- POST /api/checkins endpoint
- QR code decryption and validation
- Duplicate check-in prevention
- WebSocket broadcast
- Redis caching for performance

**Technical Notes**:
- Use html5-qrcode for browser scanning
- Implement Service Worker for offline
- Encrypt QR payload with AES

---

#### US-5.2: Manual Check-in
**As a** host  
**I want to** manually check in attendees  
**So that** I can handle issues without QR codes

**Acceptance Criteria**:
- Search attendee by name or email
- Select attendee from list
- Confirm check-in
- Status updated immediately
- Reason for manual check-in recorded

**Frontend Tasks**:
- Attendee search component
- Selection list
- Confirmation dialog
- Reason input field

**Backend Tasks**:
- POST /api/checkins/manual endpoint
- Attendee search
- Check-in creation
- Audit log
- WebSocket broadcast

---

### Epic 6: Waitlist Management

#### US-6.1: Join Waitlist
**As an** attendee  
**I want to** join a waitlist when event is full  
**So that** I can register if spots open up

**Acceptance Criteria**:
- Waitlist button shown when event is full
- Attendee added to waitlist queue
- Position in queue displayed
- Email notification when spot available
- Automatic promotion to registration

**Frontend Tasks**:
- Waitlist button component
- Queue position display
- Notification preferences

**Backend Tasks**:
- POST /api/waitlist endpoint
- Queue management with Redis
- Position calculation
- Email notification service
- Auto-promotion logic

---

#### US-6.2: Waitlist Promotion
**As an** attendee on waitlist  
**I want to** be automatically promoted when spots open  
**So that** I don't miss the opportunity

**Acceptance Criteria**:
- Automatic promotion when seat available
- Email notification sent immediately
- 24-hour window to complete registration
- Expired promotions move to next in queue

**Frontend Tasks**:
- Promotion notification
- Registration completion flow
- Countdown timer

**Backend Tasks**:
- Scheduled job for promotion
- Email notification
- Expiration handling
- Queue management

---

### Epic 7: Notifications & Communication

#### US-7.1: Email Notifications
**As a** user  
**I want to** receive email notifications  
**So that** I stay informed about my events

**Acceptance Criteria**:
- Registration confirmation email
- Event reminder (24 hours before)
- Event updates and changes
- Waitlist promotion notification
- Check-in confirmation

**Frontend Tasks**:
- Notification preferences page
- Email template preview

**Backend Tasks**:
- Email service with Spring Mail
- Thymeleaf templates
- Scheduled jobs for reminders
- Async email sending
- Delivery tracking

**Technical Notes**:
- Use Resend.com (3K emails/month free)
- Queue emails with Redis
- Retry failed deliveries

---

#### US-7.2: In-App Notifications
**As a** user  
**I want to** receive in-app notifications  
**So that** I see updates in real-time

**Acceptance Criteria**:
- Notification bell icon with count
- Dropdown list of notifications
- Mark as read functionality
- Real-time updates via WebSocket
- Notification history page

**Frontend Tasks**:
- Notification bell component
- Dropdown menu
- Notification list
- WebSocket integration

**Backend Tasks**:
- GET /api/notifications endpoint
- WebSocket notification service
- Mark as read endpoint
- Notification storage

---

### Epic 8: Analytics & Reporting

#### US-8.1: Host Analytics Dashboard
**As a** host  
**I want to** view comprehensive analytics  
**So that** I can measure event success

**Acceptance Criteria**:
- Total registrations over time
- Check-in rate percentage
- Attendee demographics
- Popular time slots
- Revenue metrics (if paid)
- Exportable reports

**Frontend Tasks**:
- Dashboard with charts (Recharts)
- Date range selector
- Export buttons
- Real-time updates

**Backend Tasks**:
- GET /api/analytics/events/:id endpoint
- Aggregate queries
- CSV/PDF export
- Caching for performance

---

#### US-8.2: Platform Analytics (Admin)
**As an** admin  
**I want to** view platform-wide analytics  
**So that** I can monitor system health

**Acceptance Criteria**:
- Total events created
- Total registrations
- Active users count
- Popular event categories
- System performance metrics

**Frontend Tasks**:
- Admin dashboard
- System metrics charts
- User activity logs

**Backend Tasks**:
- GET /api/analytics/platform endpoint
- System metrics collection
- Performance monitoring
- Database statistics

---


## Technical Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Next.js)  │  Mobile Browser  │  Progressive Web App│
└────────────┬────────────┴──────────────────┴─────────────────────┘
             │
             │ HTTPS / WebSocket
             │
┌────────────▼─────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                           │
├───────────────────────────────────────────────────────────────────┤
│                    Next.js 14 Frontend                            │
│  - Server-Side Rendering (SSR)                                    │
│  - Static Site Generation (SSG)                                   │
│  - API Routes                                                     │
│  - Real-time WebSocket Client                                     │
└────────────┬──────────────────────────────────────────────────────┘
             │
             │ REST API / WebSocket
             │
┌────────────▼──────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                             │
├────────────────────────────────────────────────────────────────────┤
│                  Spring Boot 3.2.4 Backend                         │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  API Gateway Layer                                        │    │
│  │  - Spring Security (JWT + OAuth2)                         │    │
│  │  - CORS Configuration                                     │    │
│  │  - Rate Limiting                                          │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Business Logic Layer                                     │    │
│  │  - Event Service                                          │    │
│  │  - Registration Service                                   │    │
│  │  - User Service                                           │    │
│  │  - Notification Service                                   │    │
│  │  - Analytics Service                                      │    │
│  │  - QR Code Service                                        │    │
│  └──────────────────────────────────────────────────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Real-time Layer                                          │    │
│  │  - WebSocket Handler (STOMP)                              │    │
│  │  - Event Broadcasting                                     │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────┬──────────────────────────────────────────────────────┘
             │
             │
┌────────────▼──────────────────────────────────────────────────────┐
│                      DATA LAYER                                    │
├────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  PostgreSQL  │  │    Redis     │  │   Cloudinary CDN     │   │
│  │  (Primary)   │  │  (Sessions)  │  │  (File Storage)      │   │
│  │  - Events    │  │  - Cache     │  │  - Images            │   │
│  │  - Users     │  │  - Queues    │  │  - Documents         │   │
│  │  - Registr.  │  │  - Pub/Sub   │  │                      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

```
User Action (Register for Event)
        │
        ▼
┌───────────────────┐
│  Next.js Client   │
│  - Form Submit    │
└────────┬──────────┘
         │ POST /api/registrations
         ▼
┌───────────────────┐
│  Spring Security  │
│  - JWT Validation │
└────────┬──────────┘
         │
         ▼
┌───────────────────────┐
│ Registration Service  │
│ - Validate Capacity   │
│ - Allocate Seat       │
└────────┬──────────────┘
         │
         ├─────────────────────┐
         │                     │
         ▼                     ▼
┌─────────────────┐   ┌──────────────────┐
│   PostgreSQL    │   │   QR Service     │
│ - Save Record   │   │ - Generate Code  │
└─────────────────┘   └────────┬─────────┘
         │                     │
         │                     ▼
         │            ┌──────────────────┐
         │            │  Email Service   │
         │            │ - Send QR Code   │
         │            └──────────────────┘
         │
         ▼
┌─────────────────┐
│   WebSocket     │
│ - Broadcast     │
│   Update        │
└─────────────────┘
         │
         ▼
┌───────────────────┐
│  All Connected    │
│  Clients Updated  │
└───────────────────┘
```

---

## Frontend Requirements

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 16.x | SSR, routing, API routes |
| Language | TypeScript | 5.x | Type safety |
| UI Library | Tailwind CSS | 3.x | Styling |
| Components | Shadcn/ui | Latest | Pre-built components |
| State | Zustand | 4.x | Global state management |
| Forms | React Hook Form | 7.x | Form handling |
| Validation | Zod | 3.x | Schema validation |
| Charts | Recharts | 2.x | Data visualization |
| WebSocket | @stomp/stompjs | 7.x | Real-time updates |
| HTTP Client | Fetch API | Native | API calls |
| Date | date-fns | 3.x | Date manipulation |
| Icons | Lucide React | Latest | Icon library |

### Page Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── events/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/edit/
│   │   │       └── page.tsx
│   │   ├── registrations/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── layout.tsx
│   └── page.tsx (Landing)
├── components/
│   ├── ui/ (Shadcn components)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── OAuthButtons.tsx
│   ├── events/
│   │   ├── EventCard.tsx
│   │   ├── EventList.tsx
│   │   ├── EventForm.tsx
│   │   ├── EventDetails.tsx
│   │   └── EventFilters.tsx
│   ├── registration/
│   │   ├── RegistrationForm.tsx
│   │   ├── SeatSelector.tsx
│   │   └── QRCodeDisplay.tsx
│   ├── checkin/
│   │   ├── QRScanner.tsx
│   │   └── AttendeeList.tsx
│   ├── analytics/
│   │   ├── AnalyticsDashboard.tsx
│   │   ├── RegistrationChart.tsx
│   │   └── AttendeeStats.tsx
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
├── lib/
│   ├── api.ts (API client)
│   ├── auth.ts (Auth helpers)
│   ├── websocket.ts (WebSocket client)
│   └── utils.ts (Utilities)
├── hooks/
│   ├── useAuth.ts
│   ├── useEvents.ts
│   ├── useRegistrations.ts
│   └── useWebSocket.ts
├── stores/
│   ├── authStore.ts
│   ├── eventStore.ts
│   └── notificationStore.ts
└── types/
    ├── auth.ts
    ├── event.ts
    ├── registration.ts
    └── api.ts
```

### Key Frontend Features

#### 1. Authentication Flow
```typescript
// lib/auth.ts
export class AuthService {
  async login(email: string, password: string): Promise<User> {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    
    if (!response.ok) throw new Error('Login failed');
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.user;
  }
  
  async register(data: RegisterData): Promise<User> {
    // Implementation
  }
  
  async logout(): Promise<void> {
    localStorage.removeItem('token');
    // Call backend logout endpoint
  }
}
```

#### 2. Real-time Updates
```typescript
// lib/websocket.ts
import { Client } from '@stomp/stompjs';

export class WebSocketService {
  private client: Client;
  
  connect(eventId: string) {
    this.client = new Client({
      brokerURL: 'ws://localhost:8081/ws',
      onConnect: () => {
        this.client.subscribe(`/topic/events/${eventId}`, (message) => {
          const update = JSON.parse(message.body);
          // Handle update
        });
      },
    });
    
    this.client.activate();
  }
  
  disconnect() {
    this.client.deactivate();
  }
}
```

#### 3. Form Validation
```typescript
// components/events/EventForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const eventSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  startDate: z.date().min(new Date(), 'Start date must be in the future'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  location: z.string().min(3, 'Location is required'),
});

export function EventForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(eventSchema),
  });
  
  const onSubmit = async (data) => {
    // Submit to API
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

#### 4. State Management
```typescript
// stores/eventStore.ts
import { create } from 'zustand';

interface EventStore {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (event: CreateEventData) => Promise<void>;
}

export const useEventStore = create<EventStore>((set) => ({
  events: [],
  loading: false,
  error: null,
  
  fetchEvents: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/events');
      const events = await response.json();
      set({ events, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
  
  createEvent: async (eventData) => {
    // Implementation
  },
}));
```

### Responsive Design Requirements

- Mobile-first approach
- Breakpoints: 640px (sm), 768px (md), 1024px (lg), 1280px (xl)
- Touch-friendly UI elements (min 44px tap targets)
- Optimized images with Next.js Image component
- Progressive Web App (PWA) capabilities
- Offline support for critical features

### Performance Requirements

- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1
- Code splitting for route-based chunks
- Image lazy loading
- API response caching

---

## Backend Requirements

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Spring Boot | 3.2.4 | Application framework |
| Language | Java | 21 LTS | Programming language |
| Security | Spring Security | 6.x | Authentication & authorization |
| Data Access | Spring Data JPA | 3.x | Database ORM |
| Database | PostgreSQL | 15+ | Primary database |
| Cache | Redis | 7+ | Session & caching |
| Session | Spring Session | 3.x | Distributed sessions |
| Migration | Flyway | 10.x | Database versioning |
| WebSocket | Spring WebSocket | 6.x | Real-time communication |
| Email | Spring Mail | 3.x | Email notifications |
| Validation | Hibernate Validator | 8.x | Input validation |
| API Docs | SpringDoc OpenAPI | 2.3 | API documentation |
| QR Code | ZXing | 3.5.2 | QR code generation |
| Testing | JUnit 5 + Mockito | Latest | Unit testing |

### Project Structure

```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/eventmanagement/
│   │   │   ├── BackendApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── RedisConfig.java
│   │   │   │   ├── WebSocketConfig.java
│   │   │   │   └── CorsConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── EventController.java
│   │   │   │   ├── RegistrationController.java
│   │   │   │   ├── CheckInController.java
│   │   │   │   └── AnalyticsController.java
│   │   │   ├── service/
│   │   │   │   ├── UserService.java
│   │   │   │   ├── EventService.java
│   │   │   │   ├── RegistrationService.java
│   │   │   │   ├── SeatAllocationService.java
│   │   │   │   ├── QRCodeService.java
│   │   │   │   ├── EmailService.java
│   │   │   │   ├── SessionService.java
│   │   │   │   └── AnalyticsService.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── EventRepository.java
│   │   │   │   ├── RegistrationRepository.java
│   │   │   │   └── CheckInRepository.java
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── Event.java
│   │   │   │   ├── Registration.java
│   │   │   │   ├── CheckIn.java
│   │   │   │   └── Notification.java
│   │   │   ├── dto/
│   │   │   │   ├── request/
│   │   │   │   │   ├── LoginRequest.java
│   │   │   │   │   ├── RegisterRequest.java
│   │   │   │   │   ├── CreateEventRequest.java
│   │   │   │   │   └── RegistrationRequest.java
│   │   │   │   └── response/
│   │   │   │       ├── AuthResponse.java
│   │   │   │       ├── EventResponse.java
│   │   │   │       └── RegistrationResponse.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── BusinessException.java
│   │   │   └── util/
│   │   │       ├── JwtUtil.java
│   │   │       └── QRCodeUtil.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       ├── db/migration/
│   │       │   └── V1__Create_initial_schema.sql
│   │       └── templates/
│   │           └── email/
│   │               ├── registration-confirmation.html
│   │               └── event-reminder.html
│   └── test/
│       └── java/com/eventmanagement/
│           ├── service/
│           ├── controller/
│           └── integration/
├── pom.xml
└── Dockerfile
```

### Core Backend Services

#### 1. Event Service
```java
@Service
@Transactional
public class EventService {
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private SessionService sessionService;
    
    public Event createEvent(CreateEventRequest request, String authHeader) {
        Long userId = sessionService.validateSession(authHeader);
        
        Event event = Event.builder()
            .name(request.getName())
            .description(request.getDescription())
            .startDate(request.getStartDate())
            .endDate(request.getEndDate())
            .location(request.getLocation())
            .capacity(request.getCapacity())
            .availableSeats(request.getCapacity())
            .organizerId(userId)
            .status(EventStatus.DRAFT)
            .createdAt(OffsetDateTime.now(ZoneOffset.UTC))
            .build();
            
        return eventRepository.save(event);
    }
    
    public Page<Event> getPublishedEvents(Pageable pageable) {
        return eventRepository.findByStatus(EventStatus.PUBLISHED, pageable);
    }
    
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }
    
    public Event updateEvent(Long id, UpdateEventRequest request, String authHeader) {
        Long userId = sessionService.validateSession(authHeader);
        Event event = getEventById(id);
        
        if (!event.getOrganizerId().equals(userId)) {
            throw new UnauthorizedException("Not authorized to update this event");
        }
        
        // Update fields
        event.setName(request.getName());
        event.setDescription(request.getDescription());
        // ... other fields
        
        return eventRepository.save(event);
    }
}
```

#### 2. Registration Service with Seat Allocation
```java
@Service
@Transactional
public class RegistrationService {
    
    @Autowired
    private RegistrationRepository registrationRepository;
    
    @Autowired
    private EventRepository eventRepository;
    
    @Autowired
    private SeatAllocationService seatAllocationService;
    
    @Autowired
    private QRCodeService qrCodeService;
    
    @Autowired
    private EmailService emailService;
    
    public Registration registerForEvent(Long eventId, String authHeader) {
        Long userId = sessionService.validateSession(authHeader);
        
        // Lock event row for update
        Event event = eventRepository.findByIdWithLock(eventId)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
            
        // Check capacity
        if (event.getAvailableSeats() <= 0) {
            throw new BusinessException("Event is full");
        }
        
        // Check duplicate registration
        if (registrationRepository.existsByEventIdAndUserId(eventId, userId)) {
            throw new BusinessException("Already registered");
        }
        
        // Allocate seat
        String seatNumber = seatAllocationService.allocateSeat(event);
        
        // Create registration
        Registration registration = Registration.builder()
            .eventId(eventId)
            .userId(userId)
            .seatNumber(seatNumber)
            .status(RegistrationStatus.CONFIRMED)
            .registeredAt(OffsetDateTime.now(ZoneOffset.UTC))
            .build();
            
        registration = registrationRepository.save(registration);
        
        // Decrement available seats
        event.setAvailableSeats(event.getAvailableSeats() - 1);
        eventRepository.save(event);
        
        // Generate QR code
        String qrCode = qrCodeService.generateQRCode(registration);
        registration.setQrCode(qrCode);
        
        // Send confirmation email asynchronously
        emailService.sendRegistrationConfirmation(registration);
        
        // Broadcast update via WebSocket
        webSocketService.broadcastSeatUpdate(eventId, event.getAvailableSeats());
        
        return registration;
    }
}
```

#### 3. QR Code Service
```java
@Service
public class QRCodeService {
    
    @Value("${app.qr.secret}")
    private String qrSecret;
    
    public String generateQRCode(Registration registration) {
        try {
            // Create payload
            QRPayload payload = QRPayload.builder()
                .registrationId(registration.getId())
                .eventId(registration.getEventId())
                .userId(registration.getUserId())
                .timestamp(System.currentTimeMillis())
                .hash(generateHash(registration))
                .build();
                
            // Encrypt payload
            String jsonPayload = objectMapper.writeValueAsString(payload);
            String encryptedPayload = AESUtil.encrypt(jsonPayload, qrSecret);
            
            // Generate QR code
            BitMatrix bitMatrix = new MultiFormatWriter().encode(
                encryptedPayload,
                BarcodeFormat.QR_CODE,
                300, 300
            );
            
            BufferedImage qrImage = MatrixToImageWriter.toBufferedImage(bitMatrix);
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(qrImage, "PNG", baos);
            
            return "data:image/png;base64," + 
                   Base64.getEncoder().encodeToString(baos.toByteArray());
                   
        } catch (Exception e) {
            throw new QRCodeGenerationException("Failed to generate QR code", e);
        }
    }
    
    public CheckInResult validateAndCheckIn(String qrData) {
        try {
            // Decrypt and parse
            String decrypted = AESUtil.decrypt(qrData, qrSecret);
            QRPayload payload = objectMapper.readValue(decrypted, QRPayload.class);
            
            // Validate timestamp (24 hour expiry)
            if (System.currentTimeMillis() - payload.getTimestamp() > 86400000) {
                return CheckInResult.invalid("QR code expired");
            }
            
            // Validate hash
            Registration registration = registrationRepository
                .findById(payload.getRegistrationId())
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
                
            if (!payload.getHash().equals(generateHash(registration))) {
                return CheckInResult.invalid("Invalid QR code");
            }
            
            // Check if already checked in
            if (checkInRepository.existsByRegistrationId(registration.getId())) {
                return CheckInResult.alreadyCheckedIn("Already checked in");
            }
            
            // Create check-in record
            CheckIn checkIn = CheckIn.builder()
                .registrationId(registration.getId())
                .checkInTime(OffsetDateTime.now(ZoneOffset.UTC))
                .method(CheckInMethod.QR_CODE)
                .build();
                
            checkInRepository.save(checkIn);
            
            return CheckInResult.success(checkIn);
            
        } catch (Exception e) {
            return CheckInResult.error("QR code processing failed");
        }
    }
    
    private String generateHash(Registration registration) {
        String data = registration.getId() + 
                     registration.getEventId() + 
                     registration.getUserId() + 
                     qrSecret;
        return DigestUtils.sha256Hex(data);
    }
}
```

#### 4. Email Service
```java
@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private TemplateEngine templateEngine;
    
    @Value("${app.notification.from}")
    private String fromEmail;
    
    @Async
    public CompletableFuture<Void> sendRegistrationConfirmation(Registration registration) {
        try {
            Event event = eventRepository.findById(registration.getEventId())
                .orElseThrow();
            User user = userRepository.findById(registration.getUserId())
                .orElseThrow();
                
            Context context = new Context();
            context.setVariable("user", user);
            context.setVariable("event", event);
            context.setVariable("registration", registration);
            
            String htmlContent = templateEngine.process(
                "email/registration-confirmation", context);
                
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("Registration Confirmed: " + event.getName());
            helper.setText(htmlContent, true);
            
            // Attach QR code
            byte[] qrCodeBytes = Base64.getDecoder().decode(
                registration.getQrCode().split(",")[1]);
            helper.addAttachment("qr-code.png", 
                new ByteArrayResource(qrCodeBytes), "image/png");
            
            mailSender.send(message);
            
            return CompletableFuture.completedFuture(null);
        } catch (Exception e) {
            log.error("Failed to send email", e);
            return CompletableFuture.failedFuture(e);
        }
    }
}
```

### API Endpoints Summary

#### Authentication
- POST /api/auth/register - User registration
- POST /api/auth/login - User login
- POST /api/auth/logout - User logout
- POST /api/auth/oauth/google - Google OAuth
- GET /api/auth/me - Get current user

#### Events
- GET /api/events - List all published events
- GET /api/events/:id - Get event details
- POST /api/events - Create event (host only)
- PUT /api/events/:id - Update event (host only)
- DELETE /api/events/:id - Delete event (host only)
- PATCH /api/events/:id/status - Update event status
- GET /api/events/my - Get user's events (host)

#### Registrations
- POST /api/registrations - Register for event
- GET /api/registrations - Get user's registrations
- GET /api/registrations/:id - Get registration details
- DELETE /api/registrations/:id - Cancel registration
- GET /api/events/:id/registrations - Get event registrations (host)

#### Check-ins
- POST /api/checkins - QR code check-in
- POST /api/checkins/manual - Manual check-in
- GET /api/events/:id/checkins - Get event check-ins (host)

#### Analytics
- GET /api/analytics/events/:id - Event analytics (host)
- GET /api/analytics/platform - Platform analytics (admin)

#### Waitlist
- POST /api/waitlist - Join waitlist
- GET /api/waitlist/:eventId - Get waitlist position
- DELETE /api/waitlist/:id - Leave waitlist

#### Notifications
- GET /api/notifications - Get user notifications
- PATCH /api/notifications/:id/read - Mark as read

---


## Modern Tech Stack (All Free Tier)

### Development Stack

| Category | Technology | Free Tier | Purpose |
|----------|------------|-----------|---------|
| **Frontend Hosting** | Vercel | 100GB bandwidth/month | Next.js deployment |
| **Backend Hosting** | Railway | 512MB RAM, 5GB storage | Spring Boot deployment |
| **Database** | Supabase | 500MB, unlimited API requests | PostgreSQL hosting |
| **Cache/Sessions** | Upstash Redis | 10K commands/day | Redis caching |
| **File Storage** | Cloudinary | 25GB storage, 25K transformations | Image CDN |
| **Email Service** | Resend | 3K emails/month | Transactional emails |
| **Monitoring** | Sentry | 5K errors/month | Error tracking |
| **Analytics** | Plausible | Self-hosted | Privacy-friendly analytics |
| **CI/CD** | GitHub Actions | 2K minutes/month | Automated deployment |
| **Domain** | Freenom | Free .tk/.ml domains | Custom domain |

### Why This Stack?

#### Frontend: Next.js 16
- **Server-Side Rendering**: Better SEO and initial load performance
- **Static Site Generation**: Pre-render landing pages for speed
- **Partial Pre-rendering (PPR)**: Mix static and dynamic content
- **Server Actions**: Direct server mutations without API routes
- **Image Optimization**: Automatic image optimization
- **Code Splitting**: Automatic route-based code splitting
- **TypeScript**: Type safety and better DX
- **Turbopack**: Faster builds and hot reload

#### Backend: Spring Boot 3.2.4 + Java 21
- **Virtual Threads**: Project Loom for better concurrency
- **Native Image**: GraalVM support for faster startup
- **Spring Security**: Industry-standard security
- **Spring Data JPA**: Simplified database access
- **Spring WebSocket**: Real-time communication
- **Extensive Ecosystem**: Mature libraries and tools

#### Database: PostgreSQL 15+
- **ACID Compliance**: Data integrity guaranteed
- **JSON Support**: Flexible schema for analytics
- **Full-Text Search**: Built-in search capabilities
- **Performance**: Excellent query optimization
- **Scalability**: Handles millions of rows efficiently

#### Cache: Redis 7+
- **Session Storage**: Distributed session management
- **Caching**: Sub-millisecond response times
- **Pub/Sub**: Real-time messaging
- **Data Structures**: Lists, sets, sorted sets for queues
- **Persistence**: Optional data persistence

#### File Storage: Cloudinary
- **CDN**: Global content delivery
- **Transformations**: On-the-fly image resizing
- **Optimization**: Automatic format conversion
- **Free Tier**: 25GB storage, 25K transformations
- **Easy Integration**: Simple API

---

## System Design

### Database Schema

```sql
-- Users Table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'ATTENDEE',
    profile_picture_url TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Events Table
CREATE TABLE events (
    id BIGSERIAL PRIMARY KEY,
    organizer_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(500) NOT NULL,
    venue_name VARCHAR(255),
    capacity INTEGER NOT NULL,
    available_seats INTEGER NOT NULL,
    price DECIMAL(10, 2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'USD',
    banner_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT FALSE,
    tags TEXT[],
    CONSTRAINT check_capacity CHECK (capacity > 0),
    CONSTRAINT check_available_seats CHECK (available_seats >= 0),
    CONSTRAINT check_dates CHECK (end_date > start_date)
);

CREATE INDEX idx_events_organizer ON events(organizer_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_tags ON events USING GIN(tags);

-- Registrations Table
CREATE TABLE registrations (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    seat_number VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'CONFIRMED',
    qr_code TEXT,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancellation_reason TEXT,
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_registrations_event ON registrations(event_id);
CREATE INDEX idx_registrations_user ON registrations(user_id);
CREATE INDEX idx_registrations_status ON registrations(status);

-- Check-ins Table
CREATE TABLE check_ins (
    id BIGSERIAL PRIMARY KEY,
    registration_id BIGINT NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    method VARCHAR(50) NOT NULL,
    checked_in_by BIGINT REFERENCES users(id),
    notes TEXT,
    UNIQUE(registration_id)
);

CREATE INDEX idx_checkins_registration ON check_ins(registration_id);
CREATE INDEX idx_checkins_time ON check_ins(check_in_time);

-- Waitlist Table
CREATE TABLE waitlist (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    promoted_at TIMESTAMP WITH TIME ZONE,
    expired_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'WAITING',
    UNIQUE(event_id, user_id)
);

CREATE INDEX idx_waitlist_event ON waitlist(event_id);
CREATE INDEX idx_waitlist_user ON waitlist(user_id);
CREATE INDEX idx_waitlist_position ON waitlist(event_id, position);

-- Notifications Table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_entity_type VARCHAR(50),
    related_entity_id BIGINT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON notifications(created_at);

-- Audit Log Table
CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### Entity Relationships

```
┌─────────────┐
│    Users    │
└──────┬──────┘
       │
       │ 1:N (organizer)
       │
       ▼
┌─────────────┐
│   Events    │
└──────┬──────┘
       │
       │ 1:N
       │
       ▼
┌─────────────────┐
│  Registrations  │
└──────┬──────────┘
       │
       │ 1:1
       │
       ▼
┌─────────────┐
│  Check-ins  │
└─────────────┘

Users ──1:N──> Registrations
Users ──1:N──> Waitlist
Users ──1:N──> Notifications
Events ──1:N──> Waitlist
```

### Seat Allocation Algorithm

```java
@Service
public class SeatAllocationService {
    
    /**
     * Smart seat allocation algorithm
     * Priority: 
     * 1. Accessibility requirements
     * 2. Group seating (keep together)
     * 3. Best available seats (front rows)
     */
    public String allocateSeat(Event event) {
        // Get available seats for event
        List<String> availableSeats = getAvailableSeats(event);
        
        if (availableSeats.isEmpty()) {
            throw new NoSeatsAvailableException();
        }
        
        // Simple allocation: first available
        // In production: implement smart allocation based on preferences
        return availableSeats.get(0);
    }
    
    private List<String> getAvailableSeats(Event event) {
        // Generate seat numbers based on capacity
        // Format: A1, A2, B1, B2, etc.
        int capacity = event.getCapacity();
        int seatsPerRow = 10;
        int rows = (int) Math.ceil((double) capacity / seatsPerRow);
        
        List<String> allSeats = new ArrayList<>();
        for (int row = 0; row < rows; row++) {
            char rowLetter = (char) ('A' + row);
            for (int seat = 1; seat <= seatsPerRow && allSeats.size() < capacity; seat++) {
                allSeats.add(rowLetter + String.valueOf(seat));
            }
        }
        
        // Get already allocated seats
        Set<String> allocatedSeats = registrationRepository
            .findByEventId(event.getId())
            .stream()
            .map(Registration::getSeatNumber)
            .collect(Collectors.toSet());
        
        // Return available seats
        return allSeats.stream()
            .filter(seat -> !allocatedSeats.contains(seat))
            .collect(Collectors.toList());
    }
}
```

### Real-time WebSocket Architecture

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Enable simple broker for in-memory messaging
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
            .setAllowedOriginPatterns("*")
            .withSockJS();
    }
}

@Controller
public class WebSocketController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * Broadcast seat availability update to all clients
     */
    public void broadcastSeatUpdate(Long eventId, int availableSeats) {
        SeatUpdateMessage message = new SeatUpdateMessage(eventId, availableSeats);
        messagingTemplate.convertAndSend("/topic/events/" + eventId + "/seats", message);
    }
    
    /**
     * Broadcast new registration to event organizer
     */
    public void broadcastNewRegistration(Long eventId, Registration registration) {
        RegistrationMessage message = new RegistrationMessage(registration);
        messagingTemplate.convertAndSend("/topic/events/" + eventId + "/registrations", message);
    }
}
```

### Caching Strategy

```java
@Configuration
@EnableCaching
public class CacheConfig {
    
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofMinutes(10))
            .serializeKeysWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new StringRedisSerializer()))
            .serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new GenericJackson2JsonRedisSerializer()));
        
        return RedisCacheManager.builder(connectionFactory)
            .cacheDefaults(config)
            .build();
    }
}

@Service
public class EventService {
    
    @Cacheable(value = "events", key = "#id")
    public Event getEventById(Long id) {
        return eventRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Event not found"));
    }
    
    @CacheEvict(value = "events", key = "#event.id")
    public Event updateEvent(Event event) {
        return eventRepository.save(event);
    }
    
    @Cacheable(value = "event-list", key = "#pageable.pageNumber")
    public Page<Event> getPublishedEvents(Pageable pageable) {
        return eventRepository.findByStatus(EventStatus.PUBLISHED, pageable);
    }
}
```

---

## Security & Compliance

### Authentication Flow

```
1. User Login
   ├─> Frontend: POST /api/auth/login
   ├─> Backend: Validate credentials
   ├─> Backend: Generate JWT token
   ├─> Backend: Store session in Redis
   └─> Frontend: Store token in httpOnly cookie

2. Authenticated Request
   ├─> Frontend: Include token in Authorization header
   ├─> Backend: Validate JWT signature
   ├─> Backend: Check session in Redis
   ├─> Backend: Extract user ID
   └─> Backend: Process request

3. Token Refresh
   ├─> Frontend: Token expires (1 hour)
   ├─> Frontend: Request refresh
   ├─> Backend: Validate refresh token
   ├─> Backend: Generate new JWT
   └─> Frontend: Update stored token
```

### Security Best Practices

#### 1. Password Security
```java
@Service
public class PasswordService {
    
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    
    public String hashPassword(String plainPassword) {
        return encoder.encode(plainPassword);
    }
    
    public boolean verifyPassword(String plainPassword, String hashedPassword) {
        return encoder.matches(plainPassword, hashedPassword);
    }
    
    public boolean isStrongPassword(String password) {
        // Min 8 chars, uppercase, lowercase, number, special char
        String pattern = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$";
        return password.matches(pattern);
    }
}
```

#### 2. Input Validation
```java
@RestController
@Validated
public class EventController {
    
    @PostMapping("/api/events")
    public ResponseEntity<Event> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            @RequestHeader("Authorization") String authHeader) {
        
        // Validation happens automatically via @Valid
        Event event = eventService.createEvent(request, authHeader);
        return ResponseEntity.status(HttpStatus.CREATED).body(event);
    }
}

@Data
public class CreateEventRequest {
    
    @NotBlank(message = "Event name is required")
    @Size(min = 3, max = 255, message = "Name must be between 3 and 255 characters")
    private String name;
    
    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 5000, message = "Description must be between 10 and 5000 characters")
    private String description;
    
    @NotNull(message = "Start date is required")
    @Future(message = "Start date must be in the future")
    private OffsetDateTime startDate;
    
    @NotNull(message = "End date is required")
    private OffsetDateTime endDate;
    
    @NotBlank(message = "Location is required")
    private String location;
    
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 100000, message = "Capacity cannot exceed 100,000")
    private Integer capacity;
}
```

#### 3. SQL Injection Prevention
```java
// Spring Data JPA automatically prevents SQL injection
@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    // Safe: Uses parameterized query
    @Query("SELECT e FROM Event e WHERE e.name LIKE %:keyword% AND e.status = :status")
    List<Event> searchEvents(@Param("keyword") String keyword, 
                            @Param("status") EventStatus status);
    
    // Safe: Method name query
    List<Event> findByNameContainingIgnoreCaseAndStatus(String keyword, EventStatus status);
}
```

#### 4. XSS Prevention
```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .headers(headers -> headers
                .contentSecurityPolicy(csp -> csp
                    .policyDirectives("default-src 'self'; " +
                                    "script-src 'self' 'unsafe-inline'; " +
                                    "style-src 'self' 'unsafe-inline'; " +
                                    "img-src 'self' data: https:;"))
                .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED_MODE_BLOCK))
            );
        
        return http.build();
    }
}
```

#### 5. CSRF Protection
```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
            );
        
        return http.build();
    }
}
```

#### 6. Rate Limiting
```java
@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    
    @Autowired
    private RedisTemplate<String, Integer> redisTemplate;
    
    private static final int MAX_REQUESTS = 100;
    private static final Duration WINDOW = Duration.ofMinutes(1);
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                   HttpServletResponse response, 
                                   FilterChain filterChain) throws ServletException, IOException {
        
        String clientId = getClientId(request);
        String key = "rate_limit:" + clientId;
        
        Integer requests = redisTemplate.opsForValue().get(key);
        
        if (requests == null) {
            redisTemplate.opsForValue().set(key, 1, WINDOW);
        } else if (requests >= MAX_REQUESTS) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.getWriter().write("Rate limit exceeded");
            return;
        } else {
            redisTemplate.opsForValue().increment(key);
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getClientId(HttpServletRequest request) {
        // Use IP address or user ID
        return request.getRemoteAddr();
    }
}
```

### GDPR Compliance

#### 1. Data Privacy
```java
@Service
public class DataPrivacyService {
    
    /**
     * Export all user data (GDPR Right to Data Portability)
     */
    public UserDataExport exportUserData(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Event> events = eventRepository.findByOrganizerId(userId);
        List<Registration> registrations = registrationRepository.findByUserId(userId);
        
        return UserDataExport.builder()
            .user(user)
            .events(events)
            .registrations(registrations)
            .exportedAt(OffsetDateTime.now(ZoneOffset.UTC))
            .build();
    }
    
    /**
     * Delete all user data (GDPR Right to be Forgotten)
     */
    @Transactional
    public void deleteUserData(Long userId) {
        // Anonymize instead of hard delete for audit trail
        User user = userRepository.findById(userId).orElseThrow();
        user.setEmail("deleted_" + userId + "@deleted.com");
        user.setFullName("Deleted User");
        user.setPasswordHash("");
        user.setIsActive(false);
        userRepository.save(user);
        
        // Delete sensitive data
        registrationRepository.deleteByUserId(userId);
        notificationRepository.deleteByUserId(userId);
    }
}
```

#### 2. Consent Management
```java
@Entity
public class UserConsent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long userId;
    private String consentType; // MARKETING, ANALYTICS, etc.
    private Boolean granted;
    private OffsetDateTime grantedAt;
    private OffsetDateTime revokedAt;
    private String ipAddress;
}
```

---

## Scalability & Performance

### Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| API Response Time | < 200ms (P95) | Prometheus |
| Page Load Time | < 2s (P95) | Lighthouse |
| Database Query Time | < 100ms (avg) | Slow query log |
| WebSocket Latency | < 50ms | Custom metrics |
| Concurrent Users | 10,000+ | Load testing |
| Registrations/Second | 500+ | Load testing |
| Uptime | 99.9% | Uptime monitoring |

### Scalability Strategies

#### 1. Horizontal Scaling
```yaml
# Railway deployment (example)
services:
  backend:
    replicas: 3
    resources:
      memory: 512MB
      cpu: 0.5
    health_check:
      path: /actuator/health
      interval: 30s
```

#### 2. Database Optimization
```sql
-- Add indexes for frequently queried columns
CREATE INDEX CONCURRENTLY idx_events_start_date_status 
ON events(start_date, status) 
WHERE status = 'PUBLISHED';

CREATE INDEX CONCURRENTLY idx_registrations_event_status 
ON registrations(event_id, status);

-- Analyze query performance
EXPLAIN ANALYZE 
SELECT * FROM events 
WHERE status = 'PUBLISHED' 
AND start_date > NOW() 
ORDER BY start_date 
LIMIT 20;
```

#### 3. Connection Pooling
```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20
      minimum-idle: 5
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 60000
```

#### 4. Caching Layers
```
┌─────────────────┐
│   Application   │
│   (L1 Cache)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│     Redis       │
│   (L2 Cache)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Database)    │
└─────────────────┘
```

#### 5. CDN for Static Assets
```typescript
// next.config.js
module.exports = {
  images: {
    domains: ['res.cloudinary.com'],
    loader: 'cloudinary',
    path: 'https://res.cloudinary.com/your-cloud-name/',
  },
};
```

### Load Testing Strategy

```javascript
// k6 load test script
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up to 100 users
    { duration: '5m', target: 100 },  // Stay at 100 users
    { duration: '2m', target: 500 },  // Ramp up to 500 users
    { duration: '5m', target: 500 },  // Stay at 500 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'], // 95% of requests under 200ms
    http_req_failed: ['rate<0.01'],   // Error rate under 1%
  },
};

export default function () {
  // Test event listing
  let res = http.get('http://localhost:8081/api/events');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 200ms': (r) => r.timings.duration < 200,
  });
  
  sleep(1);
}
```

---

## Implementation Roadmap

### Phase 1: MVP (4-6 weeks)

**Week 1-2: Core Infrastructure**
- [ ] Setup Next.js 16 with Turbopack
- [ ] Configure Supabase PostgreSQL
- [ ] Setup Upstash Redis
- [ ] Configure Vercel and Railway
- [ ] Implement authentication with Server Actions
- [ ] Create basic user management

**Week 3-4: Event Management**
- [ ] Event CRUD operations
- [ ] Event listing and search
- [ ] Event details page
- [ ] Image upload to Cloudinary
- [ ] Event status management

**Week 5-6: Registration System**
- [ ] Registration flow
- [ ] Seat allocation algorithm
- [ ] QR code generation
- [ ] Email notifications
- [ ] Check-in system

### Phase 2: Advanced Features (4-6 weeks)

**Week 7-8: Real-time Features**
- [ ] WebSocket integration
- [ ] Live seat availability
- [ ] Real-time notifications
- [ ] Activity feed

**Week 9-10: Analytics & Reporting**
- [ ] Event analytics dashboard
- [ ] Attendee management
- [ ] Export functionality
- [ ] Charts and visualizations

**Week 11-12: Polish & Testing**
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation

### Phase 3: Production Launch (2-4 weeks)

**Week 13-14: Deployment**
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Backup configuration
- [ ] Load testing

**Week 15-16: Post-Launch**
- [ ] Bug fixes
- [ ] Performance tuning
- [ ] User feedback integration
- [ ] Feature enhancements

---

## Success Metrics

### Technical Metrics
- **Performance**: 99.9% uptime, <200ms API response
- **Scalability**: 10,000+ concurrent users
- **Security**: Zero security incidents
- **Quality**: 80%+ test coverage

### Business Metrics
- **User Adoption**: 1,000+ events in first quarter
- **Registration Volume**: 50,000+ registrations
- **User Satisfaction**: 4.5+ star rating
- **Market Penetration**: 50+ organizations

---

## Conclusion

This comprehensive specification provides a complete blueprint for building an enterprise-grade event management platform. The architecture is designed to:

1. **Scale**: Handle thousands of concurrent users with horizontal scaling
2. **Perform**: Sub-200ms response times with multi-level caching
3. **Secure**: Industry-standard security practices and GDPR compliance
4. **Cost-Effective**: Entirely built on free-tier services
5. **Modern**: Latest technologies and best practices

The platform addresses real-world problems in event management while demonstrating advanced full-stack development skills, making it an excellent portfolio project and production-ready system.

**Next Steps**: Begin with Phase 1 MVP implementation, focusing on core features first, then iterate based on user feedback and requirements.

