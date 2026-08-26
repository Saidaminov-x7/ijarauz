-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create regions table if not exists
CREATE TABLE IF NOT EXISTS regions (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id INTEGER REFERENCES regions(id) ON DELETE CASCADE
);

-- Add region_id to apartments table if not exists
ALTER TABLE apartments ADD COLUMN IF NOT EXISTS region_id INTEGER REFERENCES regions(id) ON DELETE CASCADE;

-- Create composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_apartments_region_rooms_price ON apartments (region_id, rooms, price);

-- Create indexes for sorting
CREATE INDEX IF NOT EXISTS idx_apartments_created_at_desc ON apartments (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apartments_price_asc ON apartments (price ASC);
CREATE INDEX IF NOT EXISTS idx_apartments_price_desc ON apartments (price DESC);

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_apartments_search ON apartments 
USING GIN (
  to_tsvector('russian', title || ' ' || description || ' ' || location)
);

-- Create GIN index for trigram search (better for partial matches)
CREATE INDEX IF NOT EXISTS idx_apartments_trgm ON apartments 
USING GIN (
  (title || ' ' || description || ' ' || location) gin_trgm_ops
);

-- Create index for foreign key
CREATE INDEX IF NOT EXISTS idx_apartments_owner_id ON apartments (owner_id);

-- Create index for amenities array
CREATE INDEX IF NOT EXISTS idx_apartments_amenities ON apartments USING GIN (amenities);

-- Create materialized view for popular searches (optional)
CREATE MATERIALIZED VIEW IF NOT EXISTS popular_apartments AS
SELECT 
  a.id, a.title, a.price, a.location, a.rooms, a.area, a.images[1] as image,
  r.name as region_name,
  COUNT(*) OVER() as total_count
FROM apartments a
LEFT JOIN regions r ON a.region_id = r.id
WHERE a.created_at > CURRENT_TIMESTAMP - INTERVAL '30 days'
ORDER BY a.created_at DESC
WITH DATA;

-- Create index for materialized view
CREATE INDEX IF NOT EXISTS idx_popular_apartments_id ON popular_apartments (id);

-- Create function to refresh materialized view
CREATE OR REPLACE FUNCTION refresh_popular_apartments()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW popular_apartments;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to refresh materialized view periodically
CREATE OR REPLACE PROCEDURE refresh_popular_apartments_proc()
LANGUAGE SQL
AS $$
  REFRESH MATERIALIZED VIEW popular_apartments;
$$;

-- Schedule the refresh (run this separately in your cron job or pg_cron)
-- SELECT cron.schedule('refresh-popular-apartments', '0 * * * *', 'CALL refresh_popular_apartments_proc()');