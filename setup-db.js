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

async function setupDatabase() {
  try {
    console.log('Setting up MySQL database...');
    const connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL connected successfully!');
    
    // Create all tables
    console.log('Creating tables...');
    
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
    
    console.log('✅ All tables created!');
    
    // Insert sample data
    console.log('Inserting sample data...');
    
    // Hostels
    await connection.execute(`
      INSERT IGNORE INTO hostels (id, name, address, total_rooms, occupied_rooms, type, facilities, warden, warden_contact) VALUES
      ('H1', 'NYOOTI HOSTELS - Block A', 'University Campus, Block A', 50, 42, 'mixed', '["24/7 Security", "Wi-Fi", "Laundry Room", "Common Room", "Study Hall", "Cafeteria", "Gym", "Parking"]', 'Mr. Kwame Asante', '+233 20 111 2222'),
      ('H2', 'NYOOTI HOSTELS - Block B', 'University Campus, Block B', 40, 35, 'female', '["24/7 Security", "Wi-Fi", "Laundry Room", "Common Room", "Study Hall", "Beauty Salon", "Parking"]', 'Mrs. Akosua Mensah', '+233 24 333 4444'),
      ('H3', 'NYOOTI HOSTELS - Block C', 'University Campus, Block C', 60, 51, 'male', '["24/7 Security", "Wi-Fi", "Laundry Room", "Common Room", "Study Hall", "Sports Facility", "Barber Shop", "Parking"]', 'Mr. Joseph Boateng', '+233 26 555 6666')
    `);
    
    // Add another student
    await connection.execute(`
      INSERT IGNORE INTO students (id, registration_number, first_name, last_name, email, phone, course, year, gender, date_of_birth, address, guardian_name, guardian_phone, room_id, status, join_date) VALUES
      ('ST002', 'ST2024002', 'Akosua', 'Asante', 'akosua.asante@student.edu', '+233 26 555 0123', 'Business Administration', 3, 'female', '2001-08-22', '456 Oak Avenue, Kumasi', 'Kwame Asante', '+233 20 111 2222', 'R205', 'active', '2023-09-10')
    `);
    
    // Rooms
    await connection.execute(`
      INSERT IGNORE INTO rooms (id, number, hostel_id, capacity, occupancy, type, monthly_fee, status, amenities, floor) VALUES
      ('R101', '101', 'H1', 2, 2, 'double', 2500, 'occupied', '["AC", "Wi-Fi", "Study Table", "Wardrobe"]', 1),
      ('R102', '102', 'H1', 1, 0, 'single', 3500, 'available', '["AC", "Wi-Fi", "Study Table", "Balcony", "Wardrobe"]', 1),
      ('R201', '201', 'H1', 3, 3, 'triple', 2000, 'occupied', '["Fan", "Wi-Fi", "Study Table", "Wardrobe"]', 2),
      ('R202', '202', 'H1', 2, 0, 'double', 2500, 'maintenance', '["AC", "Wi-Fi", "Study Table", "Wardrobe"]', 2),
      ('R203', '203', 'H1', 4, 1, 'quad', 1800, 'available', '["Fan", "Wi-Fi", "Study Table", "Wardrobe"]', 2),
      ('R205', '205', 'H2', 2, 1, 'double', 2800, 'occupied', '["AC", "Wi-Fi", "Study Table", "Wardrobe", "Balcony"]', 2)
    `);
    
    // Bookings
    await connection.execute(`
      INSERT IGNORE INTO bookings (id, student_id, room_id, start_date, end_date, status, booking_date, amount) VALUES
      ('B001', 'ST001', 'R101', '2024-01-15', NULL, 'confirmed', '2024-01-10', 2500),
      ('B002', 'ST002', 'R205', '2024-01-20', NULL, 'pending', '2024-01-12', 3000)
    `);
    
    // Visitors
    await connection.execute(`
      INSERT IGNORE INTO visitors (id, name, phone, purpose, student_id, check_in_time, check_out_time, id_proof, status) VALUES
      ('V001', 'John Doe', '+233 20 123 4567', 'Parent Visit', 'ST001', '2024-01-15 10:30:00', NULL, 'Ghana Card', 'checked_in'),
      ('V002', 'Mary Smith', '+233 24 987 6543', 'Friend Visit', 'ST002', '2024-01-15 14:15:00', '2024-01-15 18:30:00', 'Passport', 'checked_out')
    `);
    
    // Payments
    await connection.execute(`
      INSERT IGNORE INTO payments (id, student_id, type, amount, due_date, paid_date, status, description) VALUES
      ('P001', 'ST001', 'room_fee', 2500, '2024-02-01', '2024-01-25', 'paid', 'January 2024 Room Fee'),
      ('P002', 'ST002', 'room_fee', 3000, '2024-02-01', NULL, 'pending', 'January 2024 Room Fee')
    `);
    
    console.log('✅ Sample data inserted!');
    
    // Test queries
    const [students] = await connection.execute('SELECT COUNT(*) as count FROM students');
    const [rooms] = await connection.execute('SELECT COUNT(*) as count FROM rooms');
    const [hostels] = await connection.execute('SELECT COUNT(*) as count FROM hostels');
    
    console.log(`✅ Database setup complete! Found ${students[0].count} students, ${rooms[0].count} rooms, ${hostels[0].count} hostels`);
    
    connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

setupDatabase(); 