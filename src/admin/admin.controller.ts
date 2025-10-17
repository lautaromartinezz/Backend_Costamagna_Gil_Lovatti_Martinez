import { Request, Response } from "express";
import { orm } from "../shared/db/orm.js";
import { getBasicStats, getDeportesStats } from "./admin.service.js";

const em = orm.em;

export async function getAdminStats(req: Request, res: Response) {
  try {
    const stats = await getBasicStats(em);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estadísticas del panel de administración" });
  }
}

export async function getDeportesConEventosStats(req: Request, res: Response) {
  try {
    const deportesConEventos = await getDeportesStats(em);
    res.json(deportesConEventos);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener estadísticas de deportes con eventos" });
  }
}