import { api, APIError } from "encore.dev/api";
import { authDB } from "./db";

interface LoginRequest {
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
}

interface LoginResponse {
  user: User;
  token: string;
}

// Authenticates a user with email and password.
export const login = api<LoginRequest, LoginResponse>(
  { expose: true, method: "POST", path: "/auth/login" },
  async (req) => {
    const user = await authDB.queryRow<User & { password: string }>`
      SELECT id, name, phone, address, photo, role, email, password
      FROM users 
      WHERE email = ${req.email}
    `;

    if (!user || user.password !== req.password) {
      throw APIError.unauthenticated("Invalid email or password");
    }

    // Simple token generation (in production, use proper JWT)
    const token = Buffer.from(`${user.id}:${user.email}:${Date.now()}`).toString('base64');

    const { password, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      token
    };
  }
);
