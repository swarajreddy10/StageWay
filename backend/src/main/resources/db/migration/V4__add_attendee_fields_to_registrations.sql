ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS attendee_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS attendee_email VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_registrations_attendee_email ON registrations(attendee_email);
