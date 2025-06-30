import { pool } from "./database";

export async function seedDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Seed hostels
    await connection.execute(`
      INSERT IGNORE INTO hostels (id, name, address, total_rooms, occupied_rooms, type, facilities, warden, warden_contact) VALUES
      ('H1', 'NYOOTI HOSTELS - Block A', 'University Campus, Block A', 50, 42, 'mixed', '["24/7 Security", "Wi-Fi", "Laundry Room", "Common Room", "Study Hall", "Cafeteria", "Gym", "Parking"]', 'Mr. Kwame Asante', '+254 701 111 222'),
      ('H2', 'NYOOTI HOSTELS - Block B', 'University Campus, Block B', 40, 35, 'female', '["24/7 Security", "Wi-Fi", "Laundry Room", "Common Room", "Study Hall", "Beauty Salon", "Parking"]', 'Mrs. Akosua Mensah', '+254 722 333 444'),
      ('H3', 'NYOOTI HOSTELS - Block C', 'University Campus, Block C', 60, 51, 'male', '["24/7 Security", "Wi-Fi", "Laundry Room", "Common Room", "Study Hall", "Sports Facility", "Barber Shop", "Parking"]', 'Mr. Joseph Boateng', '+254 733 555 666')
    `);

    // Seed students
    await connection.execute(`
      INSERT IGNORE INTO students (id, registration_number, first_name, last_name, email, phone, course, year, gender, date_of_birth, address, guardian_name, guardian_phone, room_id, status, join_date) VALUES
      ('ST001', 'ST2024001', 'John', 'Mensah', 'john.mensah@student.edu', '+254 712 345 678', 'Computer Science', 2, 'male', '2002-05-15', '123 Main Street, Nairobi', 'Mary Mensah', '+254 722 987 654', 'R101', 'active', '2024-01-15'),
      ('ST002', 'ST2024002', 'Akosua', 'Asante', 'akosua.asante@student.edu', '+254 733 555 012', 'Business Administration', 3, 'female', '2001-08-22', '456 Oak Avenue, Mombasa', 'Kwame Asante', '+254 701 111 222', 'R205', 'active', '2023-09-10'),
      ('ST003', 'ST2024003', 'David', 'Ochieng', 'david.ochieng@student.edu', '+254 744 777 888', 'Engineering', 1, 'male', '2003-03-10', '789 Pine Street, Kisumu', 'Sarah Ochieng', '+254 755 999 000', 'R102', 'active', '2024-01-20')
    `);

    // Seed rooms
    await connection.execute(`
      INSERT IGNORE INTO rooms (id, number, hostel_id, capacity, occupancy, type, monthly_fee, status, amenities, floor) VALUES
      ('R101', '101', 'H1', 2, 2, 'double', 2500, 'occupied', '["AC", "Wi-Fi", "Study Table", "Wardrobe"]', 1),
      ('R102', '102', 'H1', 1, 0, 'single', 3500, 'available', '["AC", "Wi-Fi", "Study Table", "Balcony", "Wardrobe"]', 1),
      ('R201', '201', 'H1', 3, 3, 'triple', 2000, 'occupied', '["Fan", "Wi-Fi", "Study Table", "Wardrobe"]', 2),
      ('R202', '202', 'H1', 2, 0, 'double', 2500, 'maintenance', '["AC", "Wi-Fi", "Study Table", "Wardrobe"]', 2),
      ('R203', '203', 'H1', 4, 1, 'quad', 1800, 'available', '["Fan", "Wi-Fi", "Study Table", "Wardrobe"]', 2),
      ('R205', '205', 'H2', 2, 1, 'double', 2800, 'occupied', '["AC", "Wi-Fi", "Study Table", "Wardrobe", "Balcony"]', 2)
    `);

    // Seed bookings
    await connection.execute(`
      INSERT IGNORE INTO bookings (id, student_id, room_id, start_date, end_date, status, booking_date, amount) VALUES
      ('B001', 'ST001', 'R101', '2024-01-15', NULL, 'confirmed', '2024-01-10', 2500),
      ('B002', 'ST002', 'R205', '2024-01-20', NULL, 'pending', '2024-01-12', 3000),
      ('B003', 'ST003', 'R102', '2024-02-01', '2024-06-30', 'confirmed', '2024-01-18', 3500)
    `);

    // Seed visitors
    await connection.execute(`
      INSERT IGNORE INTO visitors (id, name, phone, purpose, student_id, check_in_time, check_out_time, id_proof, status) VALUES
      ('V001', 'John Doe', '+254 712 345 678', 'Parent Visit', 'ST001', '2024-01-15 10:30:00', NULL, 'Kenyan ID', 'checked_in'),
      ('V002', 'Mary Smith', '+254 722 987 654', 'Friend Visit', 'ST002', '2024-01-15 14:15:00', '2024-01-15 18:30:00', 'Passport', 'checked_out'),
      ('V003', 'David Wilson', '+254 733 555 012', 'Academic Meeting', 'ST001', '2024-01-15 16:45:00', NULL, 'Driver''s License', 'checked_in')
    `);

    // Seed payments
    await connection.execute(`
      INSERT IGNORE INTO payments (id, student_id, type, amount, due_date, paid_date, status, description, created_at) VALUES
      ('P001', 'ST001', 'room_fee', 3000, '2024-02-01', '2024-01-28', 'paid', 'January 2024 Room Fee', '2024-01-01 00:00:00'),
      ('P002', 'ST002', 'mess_bill', 2500, '2024-02-01', NULL, 'pending', 'January 2024 Mess Bill', '2024-01-01 00:00:00'),
      ('P003', 'ST003', 'security_deposit', 5000, '2024-01-15', '2024-01-10', 'paid', 'Security Deposit', '2024-01-01 00:00:00'),
      ('P004', 'ST001', 'mess_bill', 2500, '2024-02-01', NULL, 'pending', 'January 2024 Mess Bill', '2024-01-01 00:00:00'),
      ('P005', 'ST002', 'room_fee', 3000, '2024-02-01', NULL, 'pending', 'January 2024 Room Fee', '2024-01-01 00:00:00')
    `);

    connection.release();
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
  }
} 