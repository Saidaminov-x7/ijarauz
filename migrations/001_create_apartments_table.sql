-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create apartments table
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
  location TEXT NOT NULL,
  rooms INTEGER NOT NULL CHECK (rooms > 0),
  area DECIMAL(10, 2) NOT NULL CHECK (area > 0),
  floor INTEGER NOT NULL CHECK (floor > 0),
  total_floors INTEGER NOT NULL CHECK (total_floors > 0),
  amenities TEXT[],
  images TEXT[],
  latitude DECIMAL(10, 8) NOT NULL CHECK (latitude BETWEEN -90 AND 90),
  longitude DECIMAL(11, 8) NOT NULL CHECK (longitude BETWEEN -180 AND 180),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster searches
CREATE INDEX idx_apartments_location ON apartments USING GIN (to_tsvector('english', location));
CREATE INDEX idx_apartments_price ON apartments (price);
CREATE INDEX idx_apartments_rooms ON apartments (rooms);
CREATE INDEX idx_apartments_area ON apartments (area);

-- Enable Row-Level Security
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;

-- Policy for public read access
CREATE POLICY "Allow public read access"
ON apartments
FOR SELECT
USING (true);

-- Policy for owners to manage their apartments
CREATE POLICY "Allow owners to manage their apartments"
ON apartments
FOR ALL
USING (owner_id = current_setting('app.current_user_id')::UUID)
WITH CHECK (owner_id = current_setting('app.current_user_id')::UUID);

-- Create function to set current user context
CREATE OR REPLACE FUNCTION set_current_user_id(user_id UUID)
RETURNS VOID AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id::TEXT, false);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_apartments_updated_at
BEFORE UPDATE ON apartments
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();