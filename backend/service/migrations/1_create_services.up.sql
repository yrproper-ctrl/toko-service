CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
  id BIGSERIAL PRIMARY KEY,
  service_code VARCHAR(20) UNIQUE NOT NULL,
  customer_id BIGINT REFERENCES customers(id),
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  customer_address TEXT,
  technician_id BIGINT,
  item_type VARCHAR(255) NOT NULL,
  completeness TEXT,
  serial_number VARCHAR(255),
  notes TEXT,
  damage_report TEXT,
  repair_cost DECIMAL(10,2) DEFAULT 0,
  parts_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'terima' CHECK (status IN ('terima', 'proses', 'selesai', 'batal', 'diambil')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_services_code ON services(service_code);
CREATE INDEX idx_services_status ON services(status);
CREATE INDEX idx_services_customer ON services(customer_id);
CREATE INDEX idx_services_technician ON services(technician_id);
