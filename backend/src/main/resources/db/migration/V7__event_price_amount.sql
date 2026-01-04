ALTER TABLE events
ADD COLUMN IF NOT EXISTS price_amount NUMERIC(12, 2),
ADD COLUMN IF NOT EXISTS price_currency VARCHAR(3);

UPDATE events
SET price_amount = CASE
    WHEN price_range IS NULL THEN 0
    WHEN price_range ILIKE 'FREE' THEN 0
    WHEN split_part(price_range, ' ', 2) = '' THEN NULL
    ELSE NULLIF(regexp_replace(split_part(price_range, ' ', 2), '[^0-9\\.]', '', 'g'), '')::NUMERIC
END,
price_currency = CASE
    WHEN price_range IS NULL THEN 'USD'
    WHEN price_range ILIKE 'FREE' THEN 'USD'
    WHEN split_part(price_range, ' ', 2) = '' THEN 'USD'
    ELSE upper(split_part(price_range, ' ', 1))
END
WHERE price_amount IS NULL;

CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
