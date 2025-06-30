import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

// Import all route handlers
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
} from "./routes/students";

import {
  getAllRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getRoomStats,
} from "./routes/rooms";

import {
  getAllVisitors,
  getVisitorById,
  checkInVisitor,
  checkOutVisitor,
  getVisitorStats,
  deleteVisitor,
} from "./routes/visitors";

import {
  getAllHostels,
  getHostelById,
  createHostel,
  updateHostel,
  deleteHostel,
  getHostelStats,
} from "./routes/hostels";

import {
  getAllBookings,
  getBookingById,
  createBooking,
  updateBooking,
  confirmBooking,
  cancelBooking,
  deleteBooking,
  getBookingStats,
} from "./routes/bookings";

import {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  markPaymentAsPaid,
  deletePayment,
  getPaymentStats,
} from "./routes/payments";

import {
  getDashboardStats,
  getSystemOverview,
  getRecentActivity,
} from "./routes/dashboard";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // System routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "NYOOTI HOSTELS API Server Running!" });
  });

  app.get("/api/demo", handleDemo);

  // Dashboard routes
  app.get("/api/dashboard/stats", getDashboardStats);
  app.get("/api/dashboard/overview", getSystemOverview);
  app.get("/api/dashboard/activity", getRecentActivity);

  // Student routes
  app.get("/api/students", getAllStudents);
  app.get("/api/students/:id", getStudentById);
  app.post("/api/students", createStudent);
  app.put("/api/students/:id", updateStudent);
  app.delete("/api/students/:id", deleteStudent);

  // Room routes
  app.get("/api/rooms", getAllRooms);
  app.get("/api/rooms/stats", getRoomStats);
  app.get("/api/rooms/:id", getRoomById);
  app.post("/api/rooms", createRoom);
  app.put("/api/rooms/:id", updateRoom);
  app.delete("/api/rooms/:id", deleteRoom);

  // Visitor routes
  app.get("/api/visitors", getAllVisitors);
  app.get("/api/visitors/stats", getVisitorStats);
  app.get("/api/visitors/:id", getVisitorById);
  app.post("/api/visitors/checkin", checkInVisitor);
  app.put("/api/visitors/:id/checkout", checkOutVisitor);
  app.delete("/api/visitors/:id", deleteVisitor);

  // Hostel routes
  app.get("/api/hostels", getAllHostels);
  app.get("/api/hostels/stats", getHostelStats);
  app.get("/api/hostels/:id", getHostelById);
  app.post("/api/hostels", createHostel);
  app.put("/api/hostels/:id", updateHostel);
  app.delete("/api/hostels/:id", deleteHostel);

  // Booking routes
  app.get("/api/bookings", getAllBookings);
  app.get("/api/bookings/stats", getBookingStats);
  app.get("/api/bookings/:id", getBookingById);
  app.post("/api/bookings", createBooking);
  app.put("/api/bookings/:id", updateBooking);
  app.put("/api/bookings/:id/confirm", confirmBooking);
  app.put("/api/bookings/:id/cancel", cancelBooking);
  app.delete("/api/bookings/:id", deleteBooking);

  // Payment routes
  app.get("/api/payments", getAllPayments);
  app.get("/api/payments/stats", getPaymentStats);
  app.get("/api/payments/:id", getPaymentById);
  app.post("/api/payments", createPayment);
  app.put("/api/payments/:id", updatePayment);
  app.put("/api/payments/:id/paid", markPaymentAsPaid);
  app.delete("/api/payments/:id", deletePayment);

  return app;
}
