import { RequestHandler } from "express";
import { Visitor } from "@shared/api";
import { pool } from "../config/database";

// GET /api/visitors - Get all visitors
export const getAllVisitors: RequestHandler = async (req, res) => {
  try {
    const { status, studentId, date } = req.query;
    let query = "SELECT * FROM visitors WHERE 1=1";
    const params: any[] = [];
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (studentId) {
      query += " AND student_id = ?";
      params.push(studentId);
    }
    if (date) {
      query += " AND DATE(check_in_time) = ?";
      params.push(date);
    }
    query += " ORDER BY check_in_time DESC";
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visitors" });
  }
};

// GET /api/visitors/:id - Get visitor by ID
export const getVisitorById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM visitors WHERE id = ?", [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    res.json((rows as any[])[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visitor" });
  }
};

// POST /api/visitors/checkin - Check in a new visitor
export const checkInVisitor: RequestHandler = async (req, res) => {
  try {
    const { name, phone, purpose, studentId, idProof } = req.body;
    if (!name || !phone || !purpose || !studentId || !idProof) {
      return res.status(400).json({ error: "All fields are required" });
    }
    // Generate new ID
    const [countRows]: any = await pool.query("SELECT COUNT(*) as count FROM visitors");
    const newId = `V${String(countRows[0].count + 1).padStart(3, "0")}`;
    const checkInTime = new Date().toISOString();
    const sql = `INSERT INTO visitors (id, name, phone, purpose, student_id, id_proof, check_in_time, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [newId, name, phone, purpose, studentId, idProof, checkInTime, "checked_in"];
    await pool.query(sql, values);
    const [rows] = await pool.query("SELECT * FROM visitors WHERE id = ?", [newId]);
    res.status(201).json((rows as any[])[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to check in visitor" });
  }
};

// PUT /api/visitors/:id/checkout - Check out a visitor
export const checkOutVisitor: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows]: any = await pool.query("SELECT * FROM visitors WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    if (rows[0].status === "checked_out") {
      return res.status(400).json({ error: "Visitor already checked out" });
    }
    const checkOutTime = new Date().toISOString();
    await pool.query("UPDATE visitors SET check_out_time = ?, status = 'checked_out' WHERE id = ?", [checkOutTime, id]);
    const [updatedRows] = await pool.query("SELECT * FROM visitors WHERE id = ?", [id]);
    res.json((updatedRows as any[])[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to check out visitor" });
  }
};

// GET /api/visitors/stats - Get visitor statistics
export const getVisitorStats: RequestHandler = async (_req, res) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const [todayRows]: any = await pool.query("SELECT status FROM visitors WHERE DATE(check_in_time) = ?", [today]);
    const [insideRows]: any = await pool.query("SELECT COUNT(*) as count FROM visitors WHERE status = 'checked_in'");
    const totalToday = todayRows.length;
    const checkedOut = todayRows.filter((v: any) => v.status === "checked_out").length;
    const currentlyInside = insideRows[0].count;
    res.json({
      currentlyInside,
      totalToday,
      checkedOut,
      checkedIn: totalToday - checkedOut,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch visitor statistics" });
  }
};

// DELETE /api/visitors/:id - Delete visitor record
export const deleteVisitor: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query("DELETE FROM visitors WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Visitor not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete visitor" });
  }
};
