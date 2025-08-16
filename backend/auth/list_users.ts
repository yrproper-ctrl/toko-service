import { api } from "encore.dev/api";
import { authDB } from "./db";

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

interface ListUsersResponse {
  users: User[];
}

// Lists all users in the system.
export const listUsers = api<void, ListUsersResponse>(
  { expose: true, method: "GET", path: "/auth/users" },
  async () => {
    const users = await authDB.queryAll<User>`
      SELECT id, name, phone, address, photo, role, email, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `;

    return { users };
  }
);
