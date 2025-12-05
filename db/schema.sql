DROP TABLE IF EXISTS items_on_bills;
DROP TABLE IF EXISTS split_expenses;
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS bills;
DROP TABLE IF EXISTS guests;
DROP TABLE IF EXISTS users;

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
  user_id INT NOT NULL references users(id),
  guest_name TEXT NOT NULL
);

CREATE TYPE bill_type AS ENUM (
  'even',
  'per item',
  'percentage'
);

CREATE TABLE bills (
  id SERIAL PRIMARY KEY,
  guest_id INT NOT NULL REFERENCES guests(id),
  ref_num INT NOT NULL,
  receipt BYTEA,
  type bill_type NOT NULL,
  total decimal (10,2) NOT NULL,
  is_paid BOOLEAN
);

CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  bill_id INT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  guest_id INT NOT NULL REFERENCES guests(id),
  name TEXT NOT NULL,
  quantity INT NOT NULL, 
  price DECIMAL (10,2) NOT NULL
);

CREATE TABLE items_on_bills (
  id SERIAL PRIMARY KEY,
  bill_id INT NOT NULL REFERENCES bills(id),
  item_id INT NOT NULL REFERENCES items(id)
);

CREATE TABLE split_expenses (
  id SERIAL PRIMARY KEY,
  bill_id INT NOT NULL REFERENCES bills(id),
  guest_id INT NOT NULL REFERENCES guests(id),
  amount_owed DECIMAL (10,2) NOT NULL
);