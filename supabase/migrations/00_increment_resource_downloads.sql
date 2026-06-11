
CREATE OR REPLACE FUNCTION increment_resource_downloads(resource_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE resources
  SET downloads_count = COALESCE(downloads_count, 0) + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION increment_resource_downloads(UUID) TO authenticated, anon;
