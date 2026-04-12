import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { migrate } from "drizzle-orm/neon-serverless/migrator";
import ws from "ws";

function getEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }

  return value;
}

async function main() {
  neonConfig.webSocketConstructor = ws;

  const pool = new Pool({
    connectionString: getEnv("DATABASE_URL_UNPOOLED"),
    max: 1,
  });

  try {
    const db = drizzle({ client: pool });
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied.");
  } finally {
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
