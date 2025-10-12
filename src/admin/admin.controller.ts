import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { getBasicStats } from "./admin.service.js";

const em = orm.em;

export async function getAdminStats(req: Request, res: Response) {
  try {
    const stats = await getBasicStats(em);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estadísticas del panel de administración" });
  }
}