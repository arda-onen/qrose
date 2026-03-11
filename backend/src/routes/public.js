import express from "express";
import { getMenuBySlug } from "../utils/menuData.js";

const router = express.Router();

router.get("/menu/:slug", async (req, res, next) => {
  try {
    const menu = await getMenuBySlug(req.params.slug);
    if (!menu) {
      return res.status(404).json({ message: "Menu not found." });
    }
    return res.json(menu);
  } catch (error) {
    return next(error);
  }
});

export default router;
