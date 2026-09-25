-- HUB CAFE System - Supabase Database Schema
-- Run this in Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'cashier' CHECK (role IN ('admin', 'cashier')),
    avatar TEXT,
    phone VARCHAR(50),
    pin VARCHAR(20),
    permissions TEXT[],
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    cost DECIMAL(10, 2) NOT NULL,
    image TEXT,
    description TEXT,
    is_available BOOLEAN DEFAULT true,
    available_sizes JSONB,
    available_addons JSONB,
    recipe JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name_ar VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    current_stock DECIMAL(10, 3) DEFAULT 0,
    min_alert DECIMAL(10, 3) DEFAULT 0,
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'low', 'alert', 'depleted')),
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inventory Movements Table
CREATE TABLE IF NOT EXISTS inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    inventory_item_id UUID REFERENCES inventory(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sale_deduction', 'manual_intake', 'audit_adjustment', 'waste')),
    amount DECIMAL(10, 3) NOT NULL,
    previous_stock DECIMAL(10, 3) NOT NULL,
    new_stock DECIMAL(10, 3) NOT NULL,
    reason TEXT,
    cashier VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PlayStation Devices Table
CREATE TABLE IF NOT EXISTS playstation_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_number INTEGER NOT NULL,
    model VARCHAR(10) NOT NULL CHECK (model IN ('PS4', 'PS5')),
    status VARCHAR(20) DEFAULT 'idle' CHECK (status IN ('idle', 'active')),
    mode VARCHAR(20) DEFAULT 'single' CHECK (mode IN ('single', 'multi')),
    elapsed_seconds INTEGER DEFAULT 0,
    single_hourly_rate DECIMAL(10, 2) NOT NULL,
    multi_hourly_rate DECIMAL(10, 2) NOT NULL,
    time_cost DECIMAL(10, 2) DEFAULT 0,
    customer_name VARCHAR(255),
    target_minutes INTEGER,
    time_limit_reached BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tables Table
CREATE TABLE IF NOT EXISTS tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER NOT NULL UNIQUE,
    zone VARCHAR(20) NOT NULL CHECK (zone IN ('internal', 'outdoor')),
    capacity INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'empty' CHECK (status IN ('empty', 'busy', 'reserved')),
    guest_count INTEGER DEFAULT 0,
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number INTEGER NOT NULL,
    items JSONB NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('dine_in', 'takeaway', 'delivery')),
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    table_name VARCHAR(100),
    playstation_id UUID REFERENCES playstation_devices(id) ON DELETE SET NULL,
    playstation_name VARCHAR(100),
    subtotal DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) DEFAULT 0,
    total DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('cash', 'card', 'split')),
    cashier_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')),
    customer_name VARCHAR(255),
    customer_phone VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('supplies', 'utilities', 'maintenance', 'staff', 'other')),
    amount DECIMAL(10, 2) NOT NULL,
    notes TEXT,
    cashier VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Shifts Table
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cashier_name VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    starting_cash DECIMAL(10, 2) NOT NULL,
    cash_sales DECIMAL(10, 2) DEFAULT 0,
    card_sales DECIMAL(10, 2) DEFAULT 0,
    expenses_total DECIMAL(10, 2) DEFAULT 0,
    expected_drawer_cash DECIMAL(10, 2) NOT NULL,
    actual_drawer_cash DECIMAL(10, 2),
    difference DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed')),
    closing_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories Table (for product categories)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cafe Settings Table
CREATE TABLE IF NOT EXISTS cafe_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cafe_name VARCHAR(255) NOT NULL DEFAULT 'HUB CAFE',
    cafe_name_ar VARCHAR(255),
    tagline VARCHAR(255) DEFAULT 'MEET · ENJOY · CONNECT',
    logo_type VARCHAR(20) DEFAULT 'initials' CHECK (logo_type IN ('text', 'image', 'initials')),
    logo_text VARCHAR(10) DEFAULT 'HB',
    logo_image TEXT,
    phone VARCHAR(50),
    address TEXT,
    currency VARCHAR(10) DEFAULT 'ج.م',
    tax_number VARCHAR(100),
    commercial_register VARCHAR(100),
    tax_rate DECIMAL(5, 2) DEFAULT 14.00,
    tax_enabled BOOLEAN DEFAULT false,
    service_charge_rate DECIMAL(5, 2) DEFAULT 12.00,
    service_charge_enabled BOOLEAN DEFAULT false,
    wifi_ssid VARCHAR(100),
    wifi_password VARCHAR(100),
    receipt_footer_msg TEXT,
    instagram_handle VARCHAR(100),
    facebook_page VARCHAR(100),
    ps4_single_rate DECIMAL(10, 2) DEFAULT 30.00,
    ps4_multi_rate DECIMAL(10, 2) DEFAULT 40.00,
    ps5_single_rate DECIMAL(10, 2) DEFAULT 40.00,
    ps5_multi_rate DECIMAL(10, 2) DEFAULT 50.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_inventory_status ON inventory(status);
CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON shifts(status);
CREATE INDEX IF NOT EXISTS idx_shifts_cashier ON shifts(cashier_name);
CREATE INDEX IF NOT EXISTS idx_playstation_status ON playstation_devices(status);
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playstation_updated_at BEFORE UPDATE ON playstation_devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cafe_settings_updated_at BEFORE UPDATE ON cafe_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (name) VALUES
    ('قهوة ساخنة'),
    ('قهوة مثلجة'),
    ('ماتشا'),
    ('وافل'),
    ('مشروبات منعشة'),
    ('حلويات'),
    ('سندوتشات'),
    ('مشروبات غازية')
ON CONFLICT (name) DO NOTHING;

-- Insert default cafe settings
INSERT INTO cafe_settings (
    cafe_name, cafe_name_ar, tagline, logo_type, logo_text,
    phone, address, currency, tax_number, commercial_register,
    tax_rate, service_charge_rate, wifi_ssid, wifi_password,
    receipt_footer_msg, instagram_handle, facebook_page
) VALUES (
    'HUB CAFE', 'هَب كافيه', 'MEET · ENJOY · CONNECT', 'initials', 'HB',
    '+20 100 433 6000', 'شارع النصر، المعادي، القاهرة', 'ج.م',
    '342-890-112', '78291', 14.00, 12.00,
    'HUB_CAFE_GUEST', 'hubcafe@2026',
    'شكراً لزيارتكم! نتشرف بلقائكم دائماً في هَب كافيه ❤️',
    '@hubcafe_eg', 'hubcafe.egypt'
) ON CONFLICT DO NOTHING;

-- Create Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Allow public read access for certain tables
CREATE POLICY "Allow public read access to products" ON products
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to categories" ON categories
    FOR SELECT USING (true);

CREATE POLICY "Allow public read access to cafe settings" ON cafe_settings
    FOR SELECT USING (true);

-- For users table, allow inserts but restrict reads based on role
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to read their own data" ON users
    FOR SELECT USING (true);

-- Create a view for order summary
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    DATE(timestamp) as order_date,
    COUNT(*) as order_count,
    SUM(total) as total_sales,
    SUM(CASE WHEN payment_method = 'cash' THEN total ELSE 0 END) as cash_sales,
    SUM(CASE WHEN payment_method = 'card' THEN total ELSE 0 END) as card_sales,
    cashier_name
FROM orders
WHERE status = 'completed'
GROUP BY DATE(timestamp), cashier_name;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;