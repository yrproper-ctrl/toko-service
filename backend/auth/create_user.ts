import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";

interface CreateUserRequest {
  name: string;
  phone?: string;
  address?: string;
  photo?: string;
  role: "admin" | "cs" | "teknisi" | "kasir";
  email: string;
  password: string;
}

interface User {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  photo: string | null;
  role: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}

// Creates a new user account.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/auth/users" },
  async (req) => {
    try {
      const user = await authDB.queryRow<User>`
        INSERT INTO users (name, phone, address, photo, role, email, password)
        VALUES (${req.name}, ${req.phone || null}, ${req.address || null}, ${req.photo || null}, ${req.role}, ${req.email}, ${req.password})
        RETURNING id, name, phone, address, photo, role, email, created_at, updated_at
      `;

      if (!user) {
        throw APIError.internal("Failed to create user");
      }

      return user;
    } catch (error: any) {
      if (error.code === '23505') { // Unique constraint violation
        throw APIError.alreadyExists("Email already exists");
      }
      throw error;
    }
  }
);
