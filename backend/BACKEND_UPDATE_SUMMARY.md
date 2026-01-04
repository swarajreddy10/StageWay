# Backend Update Summary

This document captures what changed in the backend and which user stories are now supported by the updated APIs and architecture.

## What changed
- Split the monolithic backend file into controllers, services, models, repositories, DTOs, config, and util packages.
- Added DTO-based responses that match the redesigned frontend while keeping legacy fields for compatibility.
- Added missing endpoints used by the frontend (host dashboards, event analytics, registrations list/detail/cancel, check-in, waitlist, file upload).
- Made auth optional for select host flows to support the current sign-in bypass used by the frontend.

## User stories achieved (expected behavior)
- As a visitor, I can browse events with filters (search, category, date range, location, price, free-only).
- As a visitor, I can view event details with availability and pricing.
- As a host, I can create, update, and delete events without being blocked by sign-in during preview.
- As a host, I can view my events dashboard and registrations.
- As an attendee, I can register for an event and receive a QR code.
- As an attendee, I can view all my registrations and cancel one.
- As a host, I can check in attendees by scanning QR codes or manually.
- As a host, I can see event analytics (overview + per-event performance).
- As a host, I can upload event banner images and use the returned file URL.
- As an attendee, I can join a waitlist when an event is full.

## API alignment highlights
- Events: return both frontend and legacy fields (startDate/startsAt, bannerUrl/bannerImageUrl, price/currency/priceRange, tags).
- Host events: `/api/events/my` is added as an alias to `/api/events/mine`.
- Registrations: `/api/registrations` list, `/api/registrations/{id}` detail, and `DELETE /api/registrations/{id}` cancel.
- Check-in: `/api/checkins` (QR payload) and `/api/checkins/manual`.
- Waitlist: `/api/waitlist` creates WAITLISTED registrations when full.
- Analytics: `/api/analytics/overview` and `/api/analytics/events/{id}`.
- Files: `/api/files` (multipart upload) and `/api/files/{id}` download.
- Auth: `/api/auth/logout` and `/api/users/profile`.

## Architecture refactor
- `controller/`: HTTP routing only.
- `service/`: business logic and orchestration.
- `model/`: JPA entities.
- `repository/`: data access interfaces.
- `dto/`: request/response shapes used by the frontend.
- `util/`: shared formatting/parsing helpers.

## Validation notes
- Build succeeded with `backend/mvnw.cmd -q -DskipTests compile` after setting `JAVA_HOME`.
