import { RequestHandler } from "express";
import { Booking } from "@shared/api";
import { pool } from "../config/database";

// GET /api/bookings - Get all bookings
export const getAllBookings: RequestHandler = async (req, res) => {
  try {
    const { status, studentId, roomId } = req.query;
    let query = "SELECT * FROM bookings WHERE 1=1";
    const params: any[] = [];
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (studentId) {
      query += " AND student_id = ?";
      params.push(studentId);
    }
    if (roomId) {
      query += " AND room_id = ?";
      params.push(roomId);
    }
    query += " ORDER BY booking_date DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
};

// GET /api/bookings/:id - Get booking by ID
export const getBookingById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.json((rows as any[])[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
};

// POST /api/bookings - Create new booking
export const createBooking: RequestHandler = async (req, res) => {
  try {
    const { studentId, roomId, startDate, endDate, amount } = req.body;
    if (!studentId || !roomId || !startDate || !amount) {
      return res.status(400).json({
        error: "Student ID, room ID, start date, and amount are required",
      });
    }
    // Check if room is already booked for the same period
    const [conflictingRows]: any = await pool.query(
      "SELECT * FROM bookings WHERE room_id = ? AND status != 'cancelled' AND ((end_date IS NULL AND ? IS NULL) OR (start_date < COALESCE(?, '9999-12-31') AND COALESCE(?, '9999-12-31') > start_date))",
      [roomId, endDate, endDate, endDate]
    );
    if (conflictingRows.length > 0) {
      return res.status(409).json({ error: "Room is already booked for this period" });
    }
    // Generate new ID
    const [countRows]: any = await pool.query("SELECT COUNT(*) as count FROM bookings");
    const newId = `B${String(countRows[0].count + 1).padStart(3, "0")}`;
    const bookingDate = new Date().toISOString().split("T")[0];
    const sql = `INSERT INTO bookings (id, student_id, room_id, start_date, end_date, amount, status, booking_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [newId, studentId, roomId, startDate, endDate || null, amount, "pending", bookingDate];
    await pool.query(sql, values);
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [newId]);
    res.status(201).json((rows as any[])[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to create booking" });
  }
};

// PUT /api/bookings/:id - Update booking
export const updateBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates).map((key) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(", ");
    const values = Object.values(updates);
    if (!fields) return res.status(400).json({ error: "No fields to update" });
    const [result]: any = await pool.query(`UPDATE bookings SET ${fields} WHERE id = ?`, [...values, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    res.json((rows as any[])[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to update booking" });
  }
};

// PUT /api/bookings/:id/confirm - Confirm booking
export const confirmBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    if (rows[0].status !== "pending") {
      return res.status(400).json({ error: "Only pending bookings can be confirmed" });
    }
    await pool.query("UPDATE bookings SET status = 'confirmed' WHERE id = ?", [id]);
    const [updatedRows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    res.json((updatedRows as any[])[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to confirm booking" });
  }
};

// PUT /api/bookings/:id/cancel - Cancel booking
export const cancelBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    const [rows] = await pool.query("SELECT * FROM bookings WHERE id = ?", [id]);
    res.json((rows as any[])[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to cancel booking" });
  }
};

// DELETE /api/bookings/:id - Delete booking
export const deleteBooking: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query("DELETE FROM bookings WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete booking" });
  }
};

// GET /api/bookings/stats - Get booking statistics
export const getBookingStats: RequestHandler = async (_req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT status, amount FROM bookings");
    const totalBookings = rows.length;
    const confirmedBookings = rows.filter((b: any) => b.status === "confirmed").length;
    const pendingBookings = rows.filter((b: any) => b.status === "pending").length;
    const cancelledBookings = rows.filter((b: any) => b.status === "cancelled").length;
    const totalRevenue = rows.filter((b: any) => b.status === "confirmed").reduce((sum: number, booking: any) => sum + Number(booking.amount), 0);
    res.json({
      totalBookings,
      confirmedBookings,
      pendingBookings,
      cancelledBookings,
      totalRevenue,
      confirmationRate: totalBookings ? Math.round((confirmedBookings / totalBookings) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking statistics" });
  }
};
