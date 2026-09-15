// This is your Prisma config file,
// learn more about it in the docs: https://pris.ly/d/prisma-config
import dotenv from 'dotenv'
import { defineConfig } from "prisma/config";

// Charge .env puis .env.local (priorité à .env.local)
dotenv.config()
dotenv.config({ path: '.env.local', override: true })

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
