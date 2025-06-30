# MySQL Database Setup for NYOOTI Hostels

## Overview
This application has been migrated from in-memory storage to MySQL database for persistent data storage.

## Prerequisites
- MySQL Server (5.7 or higher)
- Node.js and npm

## Setup Instructions

### 1. Install MySQL Dependencies
The required packages are already installed:
```bash
npm install mysql2 dotenv
```

### 2. Create Environment File
Create a `.env` file in the project root with your MySQL credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=nyooti_hostels
```

### 3. Start MySQL Server
Make sure your MySQL server is running:
```bash
# Ubuntu/Debian
sudo systemctl start mysql

# macOS (if using Homebrew)
brew services start mysql

# Windows
# Start MySQL service from Services
```

### 4. Run the Application
Start the development server:
```bash
npm run dev
```

The application will automatically:
- Connect to MySQL database
- Create the database if it doesn't exist
- Create all required tables
- Seed the database with sample data

## Database Schema

### Tables Created:
- **students** - Student information and registration
- **hostels** - Hostel buildings and facilities
- **rooms** - Individual rooms with capacity and status
- **bookings** - Room booking records
- **visitors** - Visitor check-in/check-out records
- **payments** - Payment tracking
- **mess_bills** - Mess bill management

### Sample Data Included:
- 3 hostels (mixed, female, male)
- 2 sample students
- 6 sample rooms
- 3 sample bookings
- 3 sample visitors
- 3 sample payments

## API Endpoints

All existing API endpoints now use MySQL:

### Students
- `GET /api/students` - Get all students
- `GET /api/students/:id` - Get student by ID
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Rooms
- `GET /api/rooms` - Get all rooms
- `GET /api/rooms/:id` - Get room by ID
- `POST /api/rooms` - Create new room
- `PUT /api/rooms/:id` - Update room
- `DELETE /api/rooms/:id` - Delete room
- `GET /api/rooms/stats` - Get room statistics

### Hostels
- `GET /api/hostels` - Get all hostels
- `GET /api/hostels/:id` - Get hostel by ID
- `POST /api/hostels` - Create new hostel
- `PUT /api/hostels/:id` - Update hostel
- `DELETE /api/hostels/:id` - Delete hostel
- `GET /api/hostels/stats` - Get hostel statistics

### Bookings
- `GET /api/bookings` - Get all bookings
- `GET /api/bookings/:id` - Get booking by ID
- `POST /api/bookings` - Create new booking
- `PUT /api/bookings/:id` - Update booking
- `PUT /api/bookings/:id/confirm` - Confirm booking
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `DELETE /api/bookings/:id` - Delete booking
- `GET /api/bookings/stats` - Get booking statistics

### Visitors
- `GET /api/visitors` - Get all visitors
- `GET /api/visitors/:id` - Get visitor by ID
- `POST /api/visitors/checkin` - Check in visitor
- `PUT /api/visitors/:id/checkout` - Check out visitor
- `DELETE /api/visitors/:id` - Delete visitor
- `GET /api/visitors/stats` - Get visitor statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/overview` - Get system overview
- `GET /api/dashboard/activity` - Get recent activity

## Testing the Setup

1. Start the application: `npm run dev`
2. Check the console for database connection messages
3. Test the API: `curl http://localhost:8080/api/ping`
4. View sample data: `curl http://localhost:8080/api/students`

## Troubleshooting

### Connection Issues
- Verify MySQL server is running
- Check credentials in `.env` file
- Ensure database user has proper permissions

### Permission Issues
```sql
-- Create database user with proper permissions
CREATE USER 'nyooti_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON nyooti_hostels.* TO 'nyooti_user'@'localhost';
FLUSH PRIVILEGES;
```

### Reset Database
To reset the database completely:
```sql
DROP DATABASE IF EXISTS nyooti_hostels;
```
Then restart the application to recreate everything.

## Frontend Compatibility
The frontend remains unchanged and will work seamlessly with the MySQL backend. All API responses maintain the same structure as before. 