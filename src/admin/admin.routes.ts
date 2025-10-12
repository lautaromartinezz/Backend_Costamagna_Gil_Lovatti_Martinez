import { Router } from "express";
import { getAdminStats } from "./admin.controller.js";
import { authMiddleware } from "../shared/authMiddleware.js";

export const adminRouter = Router();

adminRouter.get("/stats", authMiddleware, getAdminStats);
