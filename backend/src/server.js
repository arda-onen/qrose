import dotenv from "dotenv";
import app from "./app.js";
import { pool } from "./db/pool.js";
import initSchema from "./db/startupSchema.js";

dotenv.config();

const PORT = Number(process.env.PORT || 4000);

async function start() {
  await initSchema();
  await pool.query("SELECT 1");
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API running on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Startup failed:", error);
  process.exit(1);
});
