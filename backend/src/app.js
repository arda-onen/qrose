import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import adminRoutes from "./routes/admin.js";
import restaurantRoutes from "./routes/restaurant.js";
import publicRoutes from "./routes/public.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));
app.use("/generated", express.static(path.resolve(process.cwd(), "generated")));

app.get("/health", (req, res) => res.json({ ok: true }));
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/", publicRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
