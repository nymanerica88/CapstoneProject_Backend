DROP TABLE IF EXISTS split_expenses;
DROP TABLE IF EXISTS receipt_items;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS users;
DROP TYPE IF EXISTS bill_type;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE guests (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL,
  is_user BOOLEAN DEFAULT false
);

CREATE TYPE bill_type AS ENUM (
  'even',
  'per_item',
  'percentage'
);

CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  owner_user_id INT NOT NULL REFERENCES users(id),
  ref_num INT NOT NULL,
  type bill_type NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE receipt_items (
  id SERIAL PRIMARY KEY,
  bill_id INT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  guest_id INT NOT NULL REFERENCES guests(id),
  item_name TEXT not null,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

CREATE TABLE split_expenses (
  id SERIAL PRIMARY KEY,
  bill_id INT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  guest_id INT NOT NULL REFERENCES guests(id),
  amount_owed DECIMAL (10,2) NOT NULL
);