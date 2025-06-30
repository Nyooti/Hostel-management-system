# Hostel Management System

A full-stack Hostel Management System for universities and colleges, built with React (frontend), Express (backend), and MySQL (database).

## 🚀 Features
- Student registration and management
- Hostel and room management
- Visitor tracking
- Room bookings
- Mess management
- Payments and billing
- Dashboard with live statistics
- Reports and analytics
- Settings and configuration
- Responsive UI (desktop & mobile)

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** Node.js, Express, TypeScript
- **Database:** MySQL
- **ORM/Query:** mysql2

## 📦 Project Structure
```
├── client/           # React frontend
├── server/           # Express backend
├── shared/           # Shared types/API
├── public/           # Static assets
├── netlify/          # Netlify functions (optional)
├── setup-db.js       # DB setup script
├── MYSQL_SETUP.md    # MySQL setup guide
├── .env              # Environment variables
```

## ⚡ Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Nyooti/Hostel-management-system.git
cd Hostel-management-system
```

### 2. Install dependencies
```bash
npm install
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=nyooti_hostels
PORT=8080
```

### 4. Set up the MySQL database
- Make sure MySQL is running.
- Run the setup script:
```bash
node setup-db.js
```
- (Optional) Seed the database with sample data:
```bash
npm run seed
```

### 5. Start the development server
```bash
npm run dev
```
- Frontend: http://localhost:8080/
- Backend API: http://localhost:8080/api/

## 🗄️ Database Schema
See [`MYSQL_SETUP.md`](./MYSQL_SETUP.md) for full table definitions and sample data.

## 🧑‍💻 Contributing
1. Fork the repo and create your branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -am 'Add new feature'`
3. Push to your fork: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License
MIT

---

**Made with ❤️ by Nyooti** 