/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Hostel Management System Types
 */

export interface Student {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  year: number;
  gender: "male" | "female";
  dateOfBirth: string;
  address: string;
  guardianName: string;
  guardianPhone: string;
  roomId?: string;
  status: "active" | "inactive" | "graduated";
  joinDate: string;
  profileImage?: string;
}

export interface Room {
  id: string;
  number: string;
  hostelId: string;
  capacity: number;
  occupancy: number;
  type: "single" | "double" | "triple" | "quad";
  monthlyFee: number;
  status: "available" | "occupied" | "maintenance";
  amenities: string[];
  floor: number;
}

export interface Hostel {
  id: string;
  name: string;
  address: string;
  totalRooms: number;
  occupiedRooms: number;
  type: "male" | "female" | "mixed";
  facilities: string[];
  warden: string;
  wardenContact: string;
}

export interface Booking {
  id: string;
  studentId: string;
  roomId: string;
  startDate: string;
  endDate?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  bookingDate: string;
  amount: number;
}

export interface Payment {
  id: string;
  studentId: string;
  type: "room_fee" | "mess_bill" | "maintenance" | "security_deposit";
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue";
  description: string;
}

export interface Visitor {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  studentId: string;
  checkInTime: string;
  checkOutTime?: string;
  idProof: string;
  status: "checked_in" | "checked_out";
}

export interface MessBill {
  id: string;
  studentId: string;
  month: string;
  year: number;
  amount: number;
  daysPresent: number;
  totalDays: number;
  status: "pending" | "paid";
  dueDate: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalRooms: number;
  occupiedRooms: number;
  totalRevenue: number;
  pendingPayments: number;
  recentBookings: Booking[];
  recentVisitors: Visitor[];
}
