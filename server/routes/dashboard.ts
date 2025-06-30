import { RequestHandler } from "express";
import { DashboardStats } from "@shared/api";
import { pool } from "../config/database";

// GET /api/dashboard/stats - Get dashboard statistics
export const getDashboardStats: RequestHandler = async (req, res) => {
  try {
    // Get real statistics from database
    const [studentCount]: any = await pool.query("SELECT COUNT(*) as count FROM students");
    const [roomCount]: any = await pool.query("SELECT COUNT(*) as count FROM rooms");
    const [occupiedCount]: any = await pool.query("SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied'");
    const [revenueRows]: any = await pool.query("SELECT SUM(amount) as total FROM bookings WHERE status = 'confirmed'");
    const [pendingPayments]: any = await pool.query("SELECT COUNT(*) as count FROM payments WHERE status = 'pending'");
    
    // Get recent bookings
    const [recentBookings]: any = await pool.query("SELECT * FROM bookings ORDER BY booking_date DESC LIMIT 3");
    
    // Get recent visitors
    const [recentVisitors]: any = await pool.query("SELECT * FROM visitors ORDER BY check_in_time DESC LIMIT 2");

    const stats: DashboardStats = {
      totalStudents: studentCount[0].count,
      totalRooms: roomCount[0].count,
      occupiedRooms: occupiedCount[0].count,
      totalRevenue: revenueRows[0].total || 0,
      pendingPayments: pendingPayments[0].count,
      recentBookings: recentBookings,
      recentVisitors: recentVisitors,
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
};

// GET /api/dashboard/overview - Get system overview
export const getSystemOverview: RequestHandler = async (req, res) => {
  try {
    // Get hostel statistics
    const [hostelRows]: any = await pool.query("SELECT type, COUNT(*) as count FROM hostels GROUP BY type");
    const [totalHostels]: any = await pool.query("SELECT COUNT(*) as count FROM hostels");
    
    // Get room statistics
    const [roomStats]: any = await pool.query("SELECT status, COUNT(*) as count FROM rooms GROUP BY status");
    const [totalRooms]: any = await pool.query("SELECT COUNT(*) as count FROM rooms");
    const [occupiedRooms]: any = await pool.query("SELECT COUNT(*) as count FROM rooms WHERE status = 'occupied'");
    
    // Get student statistics
    const [studentStats]: any = await pool.query("SELECT status, COUNT(*) as count FROM students GROUP BY status");
    const [totalStudents]: any = await pool.query("SELECT COUNT(*) as count FROM students");
    
    // Get visitor statistics
    const [visitorStats]: any = await pool.query("SELECT COUNT(*) as count FROM visitors WHERE status = 'checked_in'");
    const [todayVisitors]: any = await pool.query("SELECT COUNT(*) as count FROM visitors WHERE DATE(check_in_time) = CURDATE()");
    
    // Get financial statistics
    const [monthlyRevenue]: any = await pool.query("SELECT SUM(amount) as total FROM bookings WHERE status = 'confirmed' AND MONTH(booking_date) = MONTH(CURDATE())");
    const [pendingPayments]: any = await pool.query("SELECT COUNT(*) as count, SUM(amount) as total FROM payments WHERE status = 'pending'");

    const overview = {
      hostels: {
        total: totalHostels[0].count,
        maleHostels: hostelRows.find((h: any) => h.type === 'male')?.count || 0,
        femaleHostels: hostelRows.find((h: any) => h.type === 'female')?.count || 0,
        mixedHostels: hostelRows.find((h: any) => h.type === 'mixed')?.count || 0,
      },
      rooms: {
        total: totalRooms[0].count,
        occupied: occupiedRooms[0].count,
        available: roomStats.find((r: any) => r.status === 'available')?.count || 0,
        maintenance: roomStats.find((r: any) => r.status === 'maintenance')?.count || 0,
        occupancyRate: totalRooms[0].count ? Math.round((occupiedRooms[0].count / totalRooms[0].count) * 100) : 0,
      },
      students: {
        total: totalStudents[0].count,
        active: studentStats.find((s: any) => s.status === 'active')?.count || 0,
        inactive: studentStats.find((s: any) => s.status === 'inactive')?.count || 0,
        newThisMonth: 0, // Could be calculated with date filtering
      },
      visitors: {
        currentlyInside: visitorStats[0].count,
        todayTotal: todayVisitors[0].count,
        thisWeekTotal: 0, // Could be calculated with date filtering
      },
      financial: {
        monthlyRevenue: monthlyRevenue[0].total || 0,
        pendingPayments: pendingPayments[0].count,
        totalPending: pendingPayments[0].total || 0,
        collectionRate: 94.2, // Could be calculated based on payments
      },
    };

    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch system overview" });
  }
};

// GET /api/dashboard/activity - Get recent system activity
export const getRecentActivity: RequestHandler = async (req, res) => {
  try {
    // For now, return mock activity data since we don't have an activity log table
    // In a real implementation, you would have an activity_log table
    const activities = [
      {
        id: "1",
        type: "student_registration",
        message: "New student registered",
        timestamp: new Date().toISOString(),
        user: "Admin",
      },
      {
        id: "2",
        type: "room_booking",
        message: "New room booking created",
        timestamp: new Date().toISOString(),
        user: "Admin",
      },
      {
        id: "3",
        type: "visitor_checkin",
        message: "New visitor checked in",
        timestamp: new Date().toISOString(),
        user: "Security",
      },
    ];

    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch recent activity" });
  }
};
