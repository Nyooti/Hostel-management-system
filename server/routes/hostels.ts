import { RequestHandler } from "express";
import { Hostel } from "@shared/api";
import { pool } from "../config/database";

// GET /api/hostels - Get all hostels
export const getAllHostels: RequestHandler = async (req, res) => {
  try {
    const { type } = req.query;
    let query = "SELECT * FROM hostels WHERE 1=1";
    const params: any[] = [];
    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    const [rows] = await pool.query(query, params);
    // Parse facilities JSON
    const result = (rows as any[]).map((h) => {
      try {
        let facilities = [];
        if (h.facilities) {
          // Handle both string and array formats
          if (typeof h.facilities === 'string') {
            facilities = JSON.parse(h.facilities);
          } else if (Array.isArray(h.facilities)) {
            facilities = h.facilities;
          }
        }
        return { ...h, facilities };
      } catch (e) {
        console.error('Failed to parse facilities for hostel', h.id, h.facilities, e);
        return { ...h, facilities: [] };
      }
    });
    res.json(result);
  } catch (error) {
    console.error('Error in getAllHostels:', error);
    res.status(500).json({ error: "Failed to fetch hostels", details: error.message });
  }
};

// GET /api/hostels/:id - Get hostel by ID
export const getHostelById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM hostels WHERE id = ?", [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: "Hostel not found" });
    }
    const hostel = (rows as any[])[0];
    hostel.facilities = hostel.facilities ? JSON.parse(hostel.facilities) : [];
    res.json(hostel);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hostel" });
  }
};

// POST /api/hostels - Create new hostel
export const createHostel: RequestHandler = async (req, res) => {
  try {
    const hostelData = req.body;
    // Generate new ID
    const [countRows]: any = await pool.query("SELECT COUNT(*) as count FROM hostels");
    const newId = `H${countRows[0].count + 1}`;
    const sql = `INSERT INTO hostels (id, name, address, total_rooms, occupied_rooms, type, facilities, warden, warden_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      newId,
      hostelData.name,
      hostelData.address,
      hostelData.totalRooms,
      0,
      hostelData.type,
      JSON.stringify(hostelData.facilities || []),
      hostelData.warden,
      hostelData.wardenContact,
    ];
    await pool.query(sql, values);
    const [rows] = await pool.query("SELECT * FROM hostels WHERE id = ?", [newId]);
    const hostel = (rows as any[])[0];
    hostel.facilities = hostel.facilities ? JSON.parse(hostel.facilities) : [];
    res.status(201).json(hostel);
  } catch (error) {
    res.status(400).json({ error: "Failed to create hostel" });
  }
};

// PUT /api/hostels/:id - Update hostel
export const updateHostel: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Convert camelCase to snake_case for DB fields
    const fields = Object.keys(updates).map((key) => {
      if (key === "facilities") return "facilities = ?";
      return `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`;
    }).join(", ");
    const values = Object.keys(updates).map((key) => key === "facilities" ? JSON.stringify(updates[key]) : updates[key]);
    if (!fields) return res.status(400).json({ error: "No fields to update" });
    const [result]: any = await pool.query(`UPDATE hostels SET ${fields} WHERE id = ?`, [...values, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Hostel not found" });
    }
    const [rows] = await pool.query("SELECT * FROM hostels WHERE id = ?", [id]);
    const hostel = (rows as any[])[0];
    hostel.facilities = hostel.facilities ? JSON.parse(hostel.facilities) : [];
    res.json(hostel);
  } catch (error) {
    res.status(400).json({ error: "Failed to update hostel" });
  }
};

// DELETE /api/hostels/:id - Delete hostel
export const deleteHostel: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query("DELETE FROM hostels WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Hostel not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete hostel" });
  }
};

// GET /api/hostels/stats - Get hostel statistics
export const getHostelStats: RequestHandler = async (_req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT type, total_rooms, occupied_rooms FROM hostels");
    const totalHostels = rows.length;
    const totalRooms = rows.reduce((sum: number, h: any) => sum + h.total_rooms, 0);
    const totalOccupied = rows.reduce((sum: number, h: any) => sum + h.occupied_rooms, 0);
    const occupancyRate = totalRooms ? Math.round((totalOccupied / totalRooms) * 100) : 0;
    const maleHostels = rows.filter((h: any) => h.type === "male").length;
    const femaleHostels = rows.filter((h: any) => h.type === "female").length;
    const mixedHostels = rows.filter((h: any) => h.type === "mixed").length;
    res.json({
      totalHostels,
      totalRooms,
      totalOccupied,
      availableRooms: totalRooms - totalOccupied,
      occupancyRate,
      maleHostels,
      femaleHostels,
      mixedHostels,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch hostel statistics" });
  }
};
