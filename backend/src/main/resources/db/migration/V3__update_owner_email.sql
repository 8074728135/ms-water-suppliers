-- =====================================================
-- V3: Set Owner Email to gowrish2006m@gmail.com
-- =====================================================

UPDATE users 
SET email = 'gowrish2006m@gmail.com', 
    name = 'Gowrish (Owner)' 
WHERE mobile = '9999999999' OR role = 'OWNER';
