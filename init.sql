CREATE DATABASE IF NOT EXISTS apartment_booking;
USE apartment_booking;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS apartments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(180) NOT NULL,
  description TEXT,
  city VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  price_per_night DECIMAL(10,2) NOT NULL,
  bedrooms INT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_apartments_city (city)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  apartment_id INT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_booking_apartment FOREIGN KEY (apartment_id) REFERENCES apartments(id),
  INDEX ix_booking_apartment_dates (apartment_id, check_in, check_out)
);

INSERT IGNORE INTO apartments (id,title,description,city,address,price_per_night,bedrooms) VALUES
(1,'City View Studio','Bright studio near the city centre','Lahore','Gulberg, Lahore',8500,1),
(2,'Family Comfort Apartment','Spacious family apartment','Lahore','DHA, Lahore',14500,3),
(3,'Modern Executive Suite','Modern suite for business travellers','Karachi','Clifton, Karachi',12000,2),
(4,'Garden Residence','Quiet apartment close to parks','Islamabad','F-6, Islamabad',16000,2),
(5,'Cozy Budget Flat','Affordable and comfortable stay','Rawalpindi','Bahria Town, Rawalpindi',6500,1);
