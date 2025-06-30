import { RequestHandler } from "express";
import { Student } from "@shared/api";
import { pool } from "../config/database";

// GET /api/students - Get all students
export const getAllStudents: RequestHandler = async (req, res) => {
  try {
    const { status, course, year } = req.query;
    let query = "SELECT * FROM students WHERE 1=1";
    const params: any[] = [];
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (course) {
      query += " AND course LIKE ?";
      params.push(`%${course}%`);
    }
    if (year) {
      query += " AND year = ?";
      params.push(Number(year));
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students" });
  }
};

// GET /api/students/:id - Get student by ID
export const getStudentById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json((rows as any[])[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch student" });
  }
};

// POST /api/students - Create new student
export const createStudent: RequestHandler = async (req, res) => {
  try {
    const studentData = req.body;
    // Generate new ID
    const [countRows]: any = await pool.query("SELECT COUNT(*) as count FROM students");
    const newId = `ST${String(countRows[0].count + 1).padStart(3, "0")}`;
    const joinDate = new Date().toISOString().split("T")[0];
    const sql = `INSERT INTO students (id, registration_number, first_name, last_name, email, phone, course, year, gender, date_of_birth, address, guardian_name, guardian_phone, room_id, status, join_date, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      newId,
      studentData.registrationNumber,
      studentData.firstName,
      studentData.lastName,
      studentData.email,
      studentData.phone,
      studentData.course,
      studentData.year,
      studentData.gender,
      studentData.dateOfBirth,
      studentData.address,
      studentData.guardianName,
      studentData.guardianPhone,
      studentData.roomId || null,
      "active",
      joinDate,
      studentData.profileImage || null,
    ];
    await pool.query(sql, values);
    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [newId]);
    res.status(201).json((rows as any[])[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to create student" });
  }
};

// PUT /api/students/:id - Update student
export const updateStudent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const fields = Object.keys(updates).map((key) => `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`).join(", ");
    const values = Object.values(updates);
    if (!fields) return res.status(400).json({ error: "No fields to update" });
    const [result]: any = await pool.query(`UPDATE students SET ${fields} WHERE id = ?`, [...values, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    const [rows] = await pool.query("SELECT * FROM students WHERE id = ?", [id]);
    res.json((rows as any[])[0]);
  } catch (error) {
    res.status(400).json({ error: "Failed to update student" });
  }
};

// DELETE /api/students/:id - Delete student
export const deleteStudent: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query("DELETE FROM students WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete student" });
  }
};
