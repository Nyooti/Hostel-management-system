import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { seedDatabase } from './seed-data';

dotenv.config();

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nyooti_hostels',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Database connection failed:', error);
    return false;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create database if it doesn't exist
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.execute(`USE \`${dbConfig.database}\``);
    
    // Create tables
    await createTables(connection);
    
    connection.release();
    console.log('✅ Database initialized successfully!');
    
    // Seed with sample data
    await seedDatabase();
    
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

async function createTables(connection: mysql.Connection) {
  // Students table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(10) PRIMARY KEY,
      registration_number VARCHAR(20) UNIQUE NOT NULL,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(20) NOT NULL,
      course VARCHAR(100) NOT NULL,
      year INT NOT NULL,
      gender ENUM('male', 'female') NOT NULL,
      date_of_birth DATE NOT NULL,
      address TEXT NOT NULL,
      guardian_name VARCHAR(100) NOT NULL,
      guardian_phone VARCHAR(20) NOT NULL,
      room_id VARCHAR(10),
      status ENUM('active', 'inactive', 'graduated') DEFAULT 'active',
      join_date DATE NOT NULL,
      profile_image VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Hostels table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS hostels (
      id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      address TEXT NOT NULL,
      total_rooms INT NOT NULL DEFAULT 0,
      occupied_rooms INT NOT NULL DEFAULT 0,
      type ENUM('male', 'female', 'mixed') NOT NULL,
      facilities JSON,
      warden VARCHAR(100) NOT NULL,
      warden_contact VARCHAR(20) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  // Rooms table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS rooms (
      id VARCHAR(10) PRIMARY KEY,
      number VARCHAR(10) NOT NULL,
      hostel_id VARCHAR(10) NOT NULL,
      capacity INT NOT NULL,
      occupancy INT NOT NULL DEFAULT 0,
      type ENUM('single', 'double', 'triple', 'quad') NOT NULL,
      monthly_fee DECIMAL(10,2) NOT NULL,
      status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
      amenities JSON,
      floor INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (hostel_id) REFERENCES hostels(id) ON DELETE CASCADE
    )
  `);

  // Bookings table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(10) PRIMARY KEY,
      student_id VARCHAR(10) NOT NULL,
      room_id VARCHAR(10) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE,
      status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
      booking_date DATE NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
    )
  `);

  // Visitors table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS visitors (
      id VARCHAR(10) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(20) NOT NULL,
      purpose VARCHAR(200) NOT NULL,
      student_id VARCHAR(10) NOT NULL,
      check_in_time DATETIME NOT NULL,
      check_out_time DATETIME,
      id_proof VARCHAR(50) NOT NULL,
      status ENUM('checked_in', 'checked_out') DEFAULT 'checked_in',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);

  // Payments table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS payments (
      id VARCHAR(10) PRIMARY KEY,
      student_id VARCHAR(10) NOT NULL,
      type ENUM('room_fee', 'mess_bill', 'maintenance', 'security_deposit') NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      due_date DATE NOT NULL,
      paid_date DATE,
      status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);

  // Mess bills table
  await connection.execute(`
    CREATE TABLE IF NOT EXISTS mess_bills (
      id VARCHAR(10) PRIMARY KEY,
      student_id VARCHAR(10) NOT NULL,
      month VARCHAR(20) NOT NULL,
      year INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      days_present INT NOT NULL,
      total_days INT NOT NULL,
      status ENUM('pending', 'paid') DEFAULT 'pending',
      due_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
    )
  `);
} 