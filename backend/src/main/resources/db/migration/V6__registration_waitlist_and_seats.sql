ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS waitlist_position INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS ux_registrations_event_seat
ON registrations(event_id, seat_number)
WHERE seat_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_registrations_event_status_created
ON registrations(event_id, status, created_at);
