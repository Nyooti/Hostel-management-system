import { RequestHandler } from "express";
import { Room } from "@shared/api";
import { pool } from "../config/database";

// GET /api/rooms - Get all rooms
export const getAllRooms: RequestHandler = async (req, res) => {
  try {
    const { status, type, hostelId, available } = req.query;
    let query = "SELECT * FROM rooms WHERE 1=1";
    const params: any[] = [];
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (type) {
      query += " AND type = ?";
      params.push(type);
    }
    if (hostelId) {
      query += " AND hostel_id = ?";
      params.push(hostelId);
    }
    if (available === "true") {
      query += " AND status = 'available' AND occupancy < capacity";
    }
    const [rows] = await pool.query(query, params);
    // Parse amenities JSON
    const result = (rows as any[]).map((r) => ({ ...r, amenities: r.amenities ? JSON.parse(r.amenities) : [] }));
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
};

// GET /api/rooms/:id - Get room by ID
export const getRoomById: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM rooms WHERE id = ?", [id]);
    if ((rows as any[]).length === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    const room = (rows as any[])[0];
    room.amenities = room.amenities ? JSON.parse(room.amenities) : [];
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch room" });
  }
};

// POST /api/rooms - Create new room
export const createRoom: RequestHandler = async (req, res) => {
  try {
    const roomData = req.body;
    // Generate new ID
    const [countRows]: any = await pool.query("SELECT COUNT(*) as count FROM rooms");
    const newId = `R${String(countRows[0].count + 1).padStart(3, "0")}`;
    const sql = `INSERT INTO rooms (id, number, hostel_id, capacity, occupancy, type, monthly_fee, status, amenities, floor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      newId,
      roomData.number,
      roomData.hostelId,
      roomData.capacity,
      0,
      roomData.type,
      roomData.monthlyFee,
      "available",
      JSON.stringify(roomData.amenities || []),
      roomData.floor,
    ];
    await pool.query(sql, values);
    const [rows] = await pool.query("SELECT * FROM rooms WHERE id = ?", [newId]);
    const room = (rows as any[])[0];
    room.amenities = room.amenities ? JSON.parse(room.amenities) : [];
    res.status(201).json(room);
  } catch (error) {
    res.status(400).json({ error: "Failed to create room" });
  }
};

// PUT /api/rooms/:id - Update room
export const updateRoom: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    // Convert camelCase to snake_case for DB fields
    const fields = Object.keys(updates).map((key) => {
      if (key === "amenities") return "amenities = ?";
      return `${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = ?`;
    }).join(", ");
    const values = Object.keys(updates).map((key) => key === "amenities" ? JSON.stringify(updates[key]) : updates[key]);
    if (!fields) return res.status(400).json({ error: "No fields to update" });
    const [result]: any = await pool.query(`UPDATE rooms SET ${fields} WHERE id = ?`, [...values, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    const [rows] = await pool.query("SELECT * FROM rooms WHERE id = ?", [id]);
    const room = (rows as any[])[0];
    room.amenities = room.amenities ? JSON.parse(room.amenities) : [];
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: "Failed to update room" });
  }
};

// DELETE /api/rooms/:id - Delete room
export const deleteRoom: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const [result]: any = await pool.query("DELETE FROM rooms WHERE id = ?", [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete room" });
  }
};

// GET /api/rooms/stats - Get room statistics
export const getRoomStats: RequestHandler = async (_req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT status, monthly_fee FROM rooms");
    const totalRooms = rows.length;
    const availableRooms = rows.filter((r: any) => r.status === "available").length;
    const occupiedRooms = rows.filter((r: any) => r.status === "occupied").length;
    const maintenanceRooms = rows.filter((r: any) => r.status === "maintenance").length;
    const averageFee = rows.reduce((sum: number, room: any) => sum + Number(room.monthly_fee), 0) / (totalRooms || 1);
    res.json({
      totalRooms,
      availableRooms,
      occupiedRooms,
      maintenanceRooms,
      averageFee: Math.round(averageFee),
      occupancyRate: totalRooms ? Math.round((occupiedRooms / totalRooms) * 100) : 0,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch room statistics" });
  }
};
