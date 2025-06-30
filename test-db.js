import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'nyooti_hostels',
};

async function testConnection() {
  try {
    console.log('Testing MySQL connection...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL connected successfully!');
    
    // Create students table
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
    console.log('✅ Students table created!');
    
    // Insert sample data
    await connection.execute(`
      INSERT IGNORE INTO students (id, registration_number, first_name, last_name, email, phone, course, year, gender, date_of_birth, address, guardian_name, guardian_phone, room_id, status, join_date) VALUES
      ('ST001', 'ST2024001', 'John', 'Mensah', 'john.mensah@student.edu', '+233 20 123 4567', 'Computer Science', 2, 'male', '2002-05-15', '123 Main Street, Accra', 'Mary Mensah', '+233 24 987 6543', 'R101', 'active', '2024-01-15')
    `);
    console.log('✅ Sample student data inserted!');
    
    // Test query
    const [rows] = await connection.execute('SELECT * FROM students');
    console.log('✅ Query test successful! Found', rows.length, 'students');
    
    connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database test failed:', error);
    return false;
  }
}

testConnection(); 