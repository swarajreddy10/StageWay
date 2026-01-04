ALTER TABLE events
ALTER COLUMN price_amount TYPE DOUBLE PRECISION
USING price_amount::double precision;
