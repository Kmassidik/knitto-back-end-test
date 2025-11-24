-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    phone VARCHAR(20) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create OTP table
CREATE TABLE otp_codes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create refresh tokens table
CREATE TABLE refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create invoices table (for B.2)
CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    date_prefix VARCHAR(8) NOT NULL,
    sequence_number INT NOT NULL,
    data JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_invoices_date_prefix ON invoices(date_prefix);

-- Create accounts table (for B.6 - race condition test)
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    balance DECIMAL(15,2) DEFAULT 0,
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create customers table (for B.7 - reports)
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create orders table (for B.7 - reports)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id),
    total_amount DECIMAL(15,2),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert sample data for testing
INSERT INTO customers (name, email) VALUES 
    ('John Doe', 'john@example.com'),
    ('Jane Smith', 'jane@example.com'),
    ('Bob Johnson', 'bob@example.com'),
    ('Alice Brown', 'alice@example.com'),
    ('Charlie Wilson', 'charlie@example.com');

INSERT INTO orders (customer_id, total_amount, created_at) VALUES
    (1, 500000, '2025-01-15 10:30:00'),
    (1, 750000, '2025-02-10 14:20:00'),
    (1, 300000, '2025-03-05 09:15:00'),
    (1, 450000, '2025-03-20 16:45:00'),
    (2, 1000000, '2025-01-20 11:00:00'),
    (2, 450000, '2025-02-25 13:30:00'),
    (2, 800000, '2025-03-10 15:00:00'),
    (3, 200000, '2025-03-15 10:00:00'),
    (3, 350000, '2025-03-22 12:00:00'),
    (4, 600000, '2025-02-05 14:00:00'),
    (5, 150000, '2025-01-25 09:00:00');

-- Insert sample account for race condition testing
INSERT INTO users (email, password_hash) VALUES ('test@example.com', '$2b$10$dummy');
INSERT INTO accounts (user_id, balance) VALUES (1, 1000);

GRANT ALL PRIVILEGES ON DATABASE knitto_test TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Add at the end of init.sql

-- Insert more test accounts for transaction testing
INSERT INTO users (email, password_hash) VALUES 
    ('user1@example.com', '$2b$10$dummy'),
    ('user2@example.com', '$2b$10$dummy');

INSERT INTO accounts (user_id, balance) VALUES 
    (1, 1000),
    (2, 2000),
    (3, 1500);