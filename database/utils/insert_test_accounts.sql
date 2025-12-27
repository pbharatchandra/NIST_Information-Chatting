-- Test Account SQL Inserts
-- Generated: 2025-12-27T17:20:16.737Z

INSERT INTO users (email, password_hash, full_name, user_type, created_at, updated_at) 
VALUES ('admin@nist.edu', '$2a$10$kqC9uwHS8OLBhMiZf7Iyc.XlOa9dktEEKT3A6bWDdYt5Xe7IFTiRm', 'System Administrator', 'admin', NOW(), NOW());

INSERT INTO users (email, password_hash, full_name, user_type, created_at, updated_at) 
VALUES ('student1@nist.edu', '$2a$10$hwho8kwHaOfXZ0GRUKUmzuhfhrck0XIVsbCExWc.Mb9EFMCxFETL.', 'Test Student', 'student', NOW(), NOW());

INSERT INTO users (email, password_hash, full_name, user_type, created_at, updated_at) 
VALUES ('faculty1@nist.edu', '$2a$10$JiYovLO57CohMtKd0hZ28eSze7oyS3jGGLa4bW30gWn22HKgkKhjC', 'Test Faculty', 'faculty', NOW(), NOW());

