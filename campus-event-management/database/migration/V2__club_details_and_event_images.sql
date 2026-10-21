-- Run once against campus_event_db before restarting the Spring Boot backend.
USE campus_event_db;

ALTER TABLE clubs
    ADD COLUMN club_type VARCHAR(80) NULL,
    ADD COLUMN branches VARCHAR(500) NULL,
    ADD COLUMN image_url VARCHAR(500) NULL;

ALTER TABLE events
    ADD COLUMN image_url VARCHAR(500) NULL;
