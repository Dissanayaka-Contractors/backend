CREATE DATABASE IF NOT EXISTS dissanayaka_contractors;
USE dissanayaka_contractors;

CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  location VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  salary VARCHAR(100),
  postedDate DATE,
  keywords JSON
);

CREATE TABLE IF NOT EXISTS testimonials (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job_id INT NOT NULL,
  user_id INT NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  address TEXT NOT NULL,
  gender VARCHAR(20) NOT NULL,
  cv_path VARCHAR(255) NOT NULL,
  status ENUM('pending', 'reviewed', 'rejected', 'accepted') DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Seed Data
INSERT INTO jobs (title, type, location, description, salary, postedDate, keywords) VALUES
('Civil Site Supervisor', 'Contract', 'Colombo', 'Experienced supervisor needed for a high-rise commercial project. Must have 5+ years experience in concrete works and team management.', 'LKR 85,000 - 120,000/mo', '2023-10-15', '["Construction", "Supervisor", "Management"]'),
('Skilled Mason', 'Temporary', 'Kandy', 'Urgently requiring skilled masons for a residential housing project. Accommodation provided.', 'LKR 3,500/day', '2023-10-18', '["Masonry", "Brickwork", "Skilled Labor"]'),
('General Laborer (Pool)', 'Daily Wage', 'Gampaha', 'General helpers needed for warehouse loading and unloading tasks. Flexible shifts available.', 'LKR 2,500/day', '2023-10-20', '["Helper", "Labor", "Warehouse"]'),
('Safety Officer', 'Full-time', 'Galle', 'Certified safety officer to oversee industrial site compliance and safety protocols.', 'LKR 95,000/mo', '2023-10-22', '["Safety", "ISO", "Officer"]');

INSERT INTO testimonials (name, role, text) VALUES
('Aruna Perera', 'Project Manager, BlueSky Constructions', 'Dissanayaka Contractors provided us with 50 skilled workers within 48 hours. Their speed and quality are unmatched.'),
('Sarah Jenkins', 'HR Director, Lanka Logistics', 'Reliable manpower supply allows us to scale our operations during peak seasons without headache.');

-- Seed Admin User (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('Admin User', 'admin@dissanayaka.lk', '$2b$10$F8rJPA3nNHTWeZXgS2k26.mCfRbzRPfYJMDkzycKrDoVLz48IVaXO', 'admin');
