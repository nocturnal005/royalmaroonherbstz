-- DDL Schema Initialization for Nature's Alchemy SQLite Database

-- 1. admin_users Table
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'editor',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. products Table
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  format TEXT NOT NULL,
  concern TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  currency TEXT DEFAULT 'TZS',
  image TEXT NOT NULL,
  image_alt TEXT NOT NULL,
  short_description TEXT NOT NULL,
  stock_quantity INTEGER DEFAULT 0 CHECK (stock_quantity >= 0),
  stock_status TEXT NOT NULL CHECK (stock_status IN ('in_stock', 'out_of_stock', 'low_stock')),
  is_published INTEGER DEFAULT 0 CHECK (is_published IN (0, 1)),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Index on is_published for fast listing queries
CREATE INDEX IF NOT EXISTS idx_products_is_published ON products(is_published);

-- 3. product_compliance Table
CREATE TABLE IF NOT EXISTS product_compliance (
  product_id TEXT PRIMARY KEY,
  key_ingredients TEXT NOT NULL CHECK (json_valid(key_ingredients)),
  full_ingredients TEXT NOT NULL CHECK (json_valid(full_ingredients)),
  usage_instructions TEXT NOT NULL,
  serving_guidance TEXT NOT NULL,
  warnings TEXT NOT NULL CHECK (json_valid(warnings)),
  contraindications TEXT NOT NULL CHECK (json_valid(contraindications)),
  allergy_warning TEXT NOT NULL,
  storage_instructions TEXT NOT NULL,
  health_disclaimer TEXT NOT NULL,
  suitable_for TEXT NOT NULL CHECK (json_valid(suitable_for)),
  not_suitable_for TEXT NOT NULL CHECK (json_valid(not_suitable_for)),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 4. shipping_regions Table
CREATE TABLE IF NOT EXISTS shipping_regions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  shipping_fee INTEGER NOT NULL CHECK (shipping_fee >= 0),
  estimated_days TEXT NOT NULL
);

-- 5. checkout_sessions Table
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id TEXT PRIMARY KEY,
  order_draft_reference TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  delivery_notes TEXT,
  delivery_region_id TEXT NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'tigo', 'airtel', 'card')),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping_fee INTEGER NOT NULL CHECK (shipping_fee >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (delivery_region_id) REFERENCES shipping_regions(id)
);

-- 6. orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  checkout_session_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  delivery_region_id TEXT NOT NULL,
  delivery_notes TEXT,
  shipping_fee INTEGER NOT NULL CHECK (shipping_fee >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('mpesa', 'tigo', 'airtel', 'card')),
  order_status TEXT NOT NULL CHECK (order_status IN ('Draft', 'AwaitingPayment', 'Paid', 'PaymentFailed', 'Cancelled', 'FulfilmentPending', 'Dispatched', 'Delivered', 'Refunded')),
  payment_status TEXT NOT NULL CHECK (payment_status IN ('Draft', 'AwaitingPayment', 'Paid', 'PaymentFailed', 'Cancelled', 'Refunded')),
  fulfilment_status TEXT NOT NULL CHECK (fulfilment_status IN ('Pending', 'FulfilmentPending', 'Dispatched', 'Delivered')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (checkout_session_id) REFERENCES checkout_sessions(id),
  FOREIGN KEY (delivery_region_id) REFERENCES shipping_regions(id)
);

-- 7. order_items Table
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price INTEGER NOT NULL CHECK (unit_price >= 0),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- 8. payments Table
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  payment_reference TEXT UNIQUE NOT NULL,
  order_id TEXT NOT NULL,
  amount INTEGER NOT NULL CHECK (amount >= 0),
  status TEXT NOT NULL CHECK (status IN ('PendingIntegration', 'AwaitingPayment', 'Paid', 'Failed', 'Cancelled')),
  provider_status TEXT,
  customer_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- 9. payment_events Table
CREATE TABLE IF NOT EXISTS payment_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  selcom_transaction_id TEXT UNIQUE NOT NULL,
  payment_reference TEXT NOT NULL,
  raw_payload TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (payment_reference) REFERENCES payments(payment_reference)
);

-- 10. idempotency_keys Table
CREATE TABLE IF NOT EXISTS idempotency_keys (
  key_hash TEXT PRIMARY KEY,
  route TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('processing', 'completed', 'failed')),
  response_status INTEGER,
  response_body TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. audit_logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  operator_id TEXT,
  action TEXT NOT NULL,
  resource_id TEXT,
  details TEXT,
  ip_address TEXT
);
