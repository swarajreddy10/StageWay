BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

WITH org1_insert AS (
  INSERT INTO organizations (name, created_at, updated_at)
  SELECT
    'StageWay Studio',
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM organizations WHERE name = 'StageWay Studio'
  )
  RETURNING id
),
org2_insert AS (
  INSERT INTO organizations (name, created_at, updated_at)
  SELECT
    'StageWay Collective',
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM organizations WHERE name = 'StageWay Collective'
  )
  RETURNING id
),
org1 AS (
  SELECT id FROM org1_insert
  UNION ALL
  SELECT id FROM organizations WHERE name = 'StageWay Studio' LIMIT 1
),
org2 AS (
  SELECT id FROM org2_insert
  UNION ALL
  SELECT id FROM organizations WHERE name = 'StageWay Collective' LIMIT 1
),
host1_insert AS (
  INSERT INTO users (email, name, full_name, password_hash, role, created_at, updated_at)
  SELECT
    'host1@stageway.local',
    'StageWay Studio',
    'StageWay Studio',
    crypt('StageWayHost1!', gen_salt('bf')),
    'ORGANIZER',
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'host1@stageway.local'
  )
  RETURNING id
),
host2_insert AS (
  INSERT INTO users (email, name, full_name, password_hash, role, created_at, updated_at)
  SELECT
    'host2@stageway.local',
    'StageWay Collective',
    'StageWay Collective',
    crypt('StageWayHost2!', gen_salt('bf')),
    'ORGANIZER',
    NOW(),
    NOW()
  WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE email = 'host2@stageway.local'
  )
  RETURNING id
)
INSERT INTO events (
  name,
  description,
  starts_at,
  ends_at,
  status,
  capacity,
  organization_id,
  created_at,
  updated_at,
  venue_name,
  venue_address,
  city,
  category,
  banner_image_url,
  price_range,
  organizer_name
)
SELECT
  'Aurora Summit: Future of Live Tech',
  'A high-energy summit on hybrid stages, creator tooling, and immersive storytelling. Doors at 9:00 AM, keynotes begin at 10:00 AM.',
  date_trunc('day', NOW()) + interval '10 days 10 hours',
  date_trunc('day', NOW()) + interval '10 days 17 hours 30 minutes',
  'PUBLISHED',
  300,
  organizations.id,
  NOW(),
  NOW(),
  'Aurora Convention Hall',
  'Knowledge City, Hyderabad',
  'Hyderabad',
  'Conference',
  'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80',
  'INR 899 - 1999',
  'StageWay Studio'
FROM organizations
WHERE organizations.name = 'StageWay Studio'
  AND NOT EXISTS (
  SELECT 1 FROM events WHERE name = 'Aurora Summit: Future of Live Tech'
);

INSERT INTO events (
  name,
  description,
  starts_at,
  ends_at,
  status,
  capacity,
  organization_id,
  created_at,
  updated_at,
  venue_name,
  venue_address,
  city,
  category,
  banner_image_url,
  price_range,
  organizer_name
)
SELECT
  'Moonlit Mic: Open Air Comedy Jam',
  'A relaxed comedy evening with rotating acts, curated bites, and a rooftop view. Doors at 6:00 PM, show starts at 7:00 PM.',
  date_trunc('day', NOW()) + interval '14 days 19 hours',
  date_trunc('day', NOW()) + interval '14 days 21 hours 30 minutes',
  'PUBLISHED',
  160,
  organizations.id,
  NOW(),
  NOW(),
  'Skyline Deck',
  'Jubilee Hills, Hyderabad',
  'Hyderabad',
  'Stand-up Comedy',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1400&q=80',
  'Free',
  'StageWay Collective'
FROM organizations
WHERE organizations.name = 'StageWay Collective'
  AND NOT EXISTS (
  SELECT 1 FROM events WHERE name = 'Moonlit Mic: Open Air Comedy Jam'
);

COMMIT;
