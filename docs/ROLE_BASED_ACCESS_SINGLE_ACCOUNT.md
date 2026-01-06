# Single-Account Role Access (Attendee → Host) - Scenarios, Changes, Steps

This documents the single-account, role-based access flow with host-request upgrades and strict role separation.

## Scenarios

1) Attendee signup/login
- User signs up or logs in once.
- Backend creates the user with role `ATTENDEE`.
- Attendee can browse events, register, and see `/dashboard`.

2) Host access request
- Attendee opens `/host/request`.
- Fills in organization/company and event plan (plus optional notes).
- Request is stored as `PENDING`.

3) Admin approval
- Admin visits `/admin/host-requests`.
- Approves or rejects the request.
- On approval, backend upgrades role to `HOST`.

4) Host experience
- Same credentials now unlock host tools.
- User can open `/host`, create/edit events, check in attendees.
- “Switch to Host Mode” CTA appears in the attendee dashboard.

5) Admin experience
- Admin role is isolated from host features.
- Admin only uses admin endpoints and UI.

## Changes Implemented

- Roles are now **only** `ATTENDEE`, `HOST`, `ADMIN`.
- Supabase metadata roles are ignored; **DB role is the single source of truth**.
- Host access approval upgrades to `HOST` (not `ORGANIZER`).
- Host-only endpoints now require `HOST` (admin is not treated as host).
- Host access request captures:
  - `companyName`
  - `eventPlan`
  - `note` (optional)
- Admin UI now shows the new host-request fields.
- Added “Switch to Host Mode” CTA in attendee dashboard.
- Added DB role constraint and migration to normalize old roles.
- Added reset script to wipe old data.

## What You Need To Do

1) Deploy backend migrations
- Ensure Flyway runs `V11__host_access_request_details.sql` and `V12__enforce_user_roles.sql`.

2) Set admin emails (Render backend env var)
- `APP_SECURITY_ADMIN_EMAILS=admin1@example.com,admin2@example.com`
- Login with one of those emails to create the admin user.

3) Reset old data (fresh start)
- Run `backend/scripts/reset_data.sql` against your Postgres database.
- Example (local):
  - `psql "$DATABASE_URL" -f backend/scripts/reset_data.sql`
- On Render, run the SQL in the database console.

4) Optional: reset Supabase auth users
- If you want a fully clean slate, remove users from Supabase Auth as well.

5) Re-deploy frontend
- Host request UI now includes the extra fields.
- Admin and host routing is updated.

## Notes

- Admin accounts are now separate from host accounts. If you need host features,
  create a host user and approve it, even if you have an admin account.
- Attendee and host are the same account; role upgrade unlocks host tools.
