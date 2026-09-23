-- =====================================================
-- V2: Seed Data - Default services, settings, slots, owner account
-- =====================================================

-- Default Water Services
INSERT INTO water_services (name, display_name, description, price, capacity_litres, is_quantifiable, min_quantity, max_quantity, is_active, sort_order)
VALUES
('FULL_TANK', 'Full Tank', 'Full water tank delivery (~10,000 litres)', 400.00, 10000, FALSE, 1, 1, TRUE, 1),
('HALF_TANK', 'Half Tank', 'Half water tank delivery (~5,000 litres)', 200.00, 5000, FALSE, 1, 1, TRUE, 2),
('DRUM', 'Drum', 'Individual drum of water (~100 litres)', 50.00, 100, TRUE, 1, 20, TRUE, 3);

-- Default Delivery Slots
INSERT INTO delivery_slots (name, display_name, start_time, end_time, is_active, sort_order)
VALUES
('MORNING', 'Morning', '08:00:00', '11:00:00', TRUE, 1),
('AFTERNOON', 'Afternoon', '11:00:00', '15:00:00', TRUE, 2),
('EVENING', 'Evening', '15:00:00', '19:00:00', TRUE, 3);

-- Default Business Settings
INSERT INTO business_settings (setting_key, setting_value, description)
VALUES
('business_name', 'MS Water Suppliers', 'Business display name'),
('business_phone', '', 'Business phone number'),
('business_address', '', 'Business address'),
('business_city', 'Hindupur', 'City of operation'),
('working_hours_start', '08:00', 'Working hours start'),
('working_hours_end', '19:00', 'Working hours end'),
('default_delivery_charge', '0', 'Default delivery charge in rupees'),
('cancellation_allowed_before_status', 'CONFIRMED', 'Last order status before which customer can cancel'),
('tank_capacity_litres', '10000', 'Tank/vehicle capacity in litres'),
('currency_symbol', '₹', 'Currency symbol'),
('order_number_prefix', 'WT', 'Prefix for order numbers');

-- Default Service Areas
INSERT INTO service_areas (name, is_active, delivery_charge)
VALUES
('Hindupur', TRUE, 0.00);

-- Owner Account (password: admin123 - BCrypt hashed)
INSERT INTO users (name, mobile, email, password_hash, role, is_active)
VALUES ('MS Water Owner', '9999999999', 'owner@mswater.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'OWNER', TRUE);

-- Demo Driver Account (password: driver123 - BCrypt hashed)
INSERT INTO users (name, mobile, email, password_hash, role, is_active)
VALUES ('Ramesh', '8888888888', 'ramesh@mswater.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'DRIVER', TRUE);

-- Create driver profile for Ramesh
INSERT INTO drivers (user_id, license_number, status)
VALUES (2, 'AP-DL-2025-001', 'AVAILABLE');
