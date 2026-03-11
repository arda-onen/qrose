import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "./pool.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const sql = await fs.readFile(schemaPath, "utf8");
  await pool.query(sql);
  await pool.end();
  // eslint-disable-next-line no-console
  console.log("Database schema initialized.");
}

initSchema().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error("Schema initialization failed:", error);
  await pool.end();
  process.exit(1);
});
