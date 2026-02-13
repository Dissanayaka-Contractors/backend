
ALTER TABLE applications ADD COLUMN cv_data LONGBLOB;
ALTER TABLE applications ADD COLUMN cv_mimetype VARCHAR(255);
ALTER TABLE applications MODIFY cv_path VARCHAR(255) NULL;
