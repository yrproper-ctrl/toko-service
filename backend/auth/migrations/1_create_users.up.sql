CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  photo VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'cs', 'teknisi', 'kasir')),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
