import { Router } from "express";
import { getAdminStats, getDeportesConEventosStats } from "./admin.controller.js";
import { authMiddleware, requireAdmin } from "../shared/authMiddleware.js";

export const adminRouter = Router();

adminRouter.get("/stats", authMiddleware, requireAdmin, getAdminStats);
adminRouter.get("/stats/deportesStats", authMiddleware, requireAdmin, getDeportesConEventosStats);
