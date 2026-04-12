import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }

  return value;
}

const sql = neon(getEnv("DATABASE_URL"));

export const db = drizzle(sql, { schema });
