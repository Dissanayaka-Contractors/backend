
ALTER TABLE jobs ADD COLUMN status INT DEFAULT 1;
UPDATE jobs SET status = 5 WHERE is_deleted = TRUE;
ALTER TABLE jobs DROP COLUMN is_deleted;
