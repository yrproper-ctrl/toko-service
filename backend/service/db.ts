import { SQLDatabase } from "encore.dev/storage/sqldb";

export const serviceDB = new SQLDatabase("service", {
  migrations: "./migrations",
});
