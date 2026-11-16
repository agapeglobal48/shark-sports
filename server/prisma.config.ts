import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.js",
  },
  // Migrations use the session pooler (DIRECT_URL, port 5432).
  // The running app uses the transaction pooler (DATABASE_URL) via the pg adapter.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
