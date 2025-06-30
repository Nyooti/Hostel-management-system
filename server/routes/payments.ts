import { RequestHandler } from "express";
import { pool } from "../config/database";

// Get all payments with optional filtering
export const getAllPayments: RequestHandler = async (req, res) => {
  try {
    const { status, type, studentId } = req.query;
    let query = "SELECT * FROM payments WHERE 1=1";
    const params: any[] = [];
    
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    if (studentId) {
      query += " AND student_id = ?";
      params.push(studentId);
    }
    
    query += " ORDER BY due_date DESC";
    
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error in getAllPayments:', error);
    res.status(500).json({ error: "Failed to fetch payments", details: error.message });
  }
};

// Get payment by ID
export const getPaymentById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM payments WHERE id = ?", [id]);
    
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.json((rows as any[])[0]);
  } catch (error) {
    console.error('Error in getPaymentById:', error);
    res.status(500).json({ error: "Failed to fetch payment", details: error.message });
  }
};

// Create new payment
export const createPayment: RequestHandler = async (req, res) => {
  try {
    const { studentId, type, amount, dueDate, description } = req.body;
    
    // Validate required fields
    if (!studentId || !type || !amount || !dueDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Check if student exists
    const [studentRows] = await pool.query("SELECT id FROM students WHERE id = ?", [studentId]);
    if ((studentRows as any[]).length === 0) {
      return res.status(400).json({ error: "Student not found" });
    }
    
    // Generate payment ID
    const [countRows]: any = await pool.query("SELECT COUNT(*) as count FROM payments");
    const newId = `P${String(countRows[0].count + 1).padStart(3, '0')}`;
    
    const sql = `
      INSERT INTO payments (id, student_id, type, amount, due_date, description, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())
    `;
    const values = [newId, studentId, type, amount, dueDate, description || ''];
    
    await pool.query(sql, values);
    const [rows] = await pool.query("SELECT * FROM payments WHERE id = ?", [newId]);
    
    res.status(201).json((rows as any[])[0]);
  } catch (error) {
    console.error('Error in createPayment:', error);
    res.status(500).json({ error: "Failed to create payment", details: error.message });
  }
};

// Update payment
export const updatePayment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, type, amount, dueDate, paidDate, description, status } = req.body;
    
    // Check if payment exists
    const [existingRows] = await pool.query("SELECT id FROM payments WHERE id = ?", [id]);
    if ((existingRows as any[]).length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    const fields = [];
    const values = [];
    
    if (studentId !== undefined) {
      fields.push("student_id = ?");
      values.push(studentId);
    }
    if (type !== undefined) {
      fields.push("type = ?");
      values.push(type);
    }
    if (amount !== undefined) {
      fields.push("amount = ?");
      values.push(amount);
    }
    if (dueDate !== undefined) {
      fields.push("due_date = ?");
      values.push(dueDate);
    }
    if (paidDate !== undefined) {
      fields.push("paid_date = ?");
      values.push(paidDate);
    }
    if (description !== undefined) {
      fields.push("description = ?");
      values.push(description);
    }
    if (status !== undefined) {
      fields.push("status = ?");
      values.push(status);
    }
    
    if (fields.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
    
    const [result]: any = await pool.query(`UPDATE payments SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    const [rows] = await pool.query("SELECT * FROM payments WHERE id = ?", [id]);
    res.json((rows as any[])[0]);
  } catch (error) {
    console.error('Error in updatePayment:', error);
    res.status(500).json({ error: "Failed to update payment", details: error.message });
  }
};

// Mark payment as paid
export const markPaymentAsPaid: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const paidDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    const [rows]: any = await pool.query("SELECT * FROM payments WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    await pool.query("UPDATE payments SET status = 'paid', paid_date = ? WHERE id = ?", [paidDate, id]);
    const [updatedRows] = await pool.query("SELECT * FROM payments WHERE id = ?", [id]);
    
    res.json((updatedRows as any[])[0]);
  } catch (error) {
    console.error('Error in markPaymentAsPaid:', error);
    res.status(500).json({ error: "Failed to mark payment as paid", details: error.message });
  }
};

// Delete payment
export const deletePayment: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result]: any = await pool.query("DELETE FROM payments WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }
    
    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error('Error in deletePayment:', error);
    res.status(500).json({ error: "Failed to delete payment", details: error.message });
  }
};

// Get payment statistics
export const getPaymentStats: RequestHandler = async (req, res) => {
  try {
    const [totalPayments]: any = await pool.query("SELECT COUNT(*) as count FROM payments");
    const [paidPayments]: any = await pool.query("SELECT COUNT(*) as count FROM payments WHERE status = 'paid'");
    const [pendingPayments]: any = await pool.query("SELECT COUNT(*) as count FROM payments WHERE status = 'pending'");
    const [overduePayments]: any = await pool.query("SELECT COUNT(*) as count FROM payments WHERE status = 'pending' AND due_date < CURDATE()");
    const [totalRevenue]: any = await pool.query("SELECT SUM(amount) as total FROM payments WHERE status = 'paid'");
    const [pendingAmount]: any = await pool.query("SELECT SUM(amount) as total FROM payments WHERE status = 'pending'");
    
    res.json({
      totalPayments: totalPayments[0].count,
      paidPayments: paidPayments[0].count,
      pendingPayments: pendingPayments[0].count,
      overduePayments: overduePayments[0].count,
      totalRevenue: totalRevenue[0].total || 0,
      pendingAmount: pendingAmount[0].total || 0
    });
  } catch (error) {
    console.error('Error in getPaymentStats:', error);
    res.status(500).json({ error: "Failed to fetch payment statistics", details: error.message });
  }
}; 