import { EntityManager } from '@mikro-orm/mysql';
import { Usuario } from '../usuario/usuario.entity.js';
import { Deporte } from '../deporte/deporte.entity.js';
import { Evento } from '../evento/evento.entity.js';
import { Partido } from '../evento/partido.entity.js';

export async function getBasicStats(em: EntityManager) {
  try {
    const now = new Date();
    const totalUsers = await em.count(Usuario, {});
    const deportes = await em.count(Deporte, {});
    const eventos = await em.count(Evento, {});
    const publicos = await em.count(Evento, { esPublico: true });
    const partidosJugados = await em.count(Partido, {
      resultadoLocal: { $ne: null },
    });
    const partidosPorJugar = await em.count(Partido, {
      fecha: { $gt: now },
    });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const activeUsers = await em.count(Usuario, {
      ultimoLogin: { $gt: thirtyDaysAgo },
    });

    const activeEventos = await em.count(Evento, {
      fechaFinEvento: { $gte: now },
      fechaInicioEvento: { $lte: now },
    });

    const rows = await em
      .getConnection()
      .execute(`SELECT COUNT(DISTINCT deporte_id) AS cnt FROM evento`);
    const activeDeportes = Number((rows as any)[0]?.cnt ?? 0);

    return {
      totalUsers,
      deportes,
      eventos,
      publicos,
      activeUsers,
      activeEventos,
      activeDeportes,
      partidosJugados,
      partidosPorJugar,
    };
  } catch (error) {
    throw new Error('Error al obtener estadísticas básicas');
  }
}

export async function getDeportesStats(em: EntityManager) {
  try {
    const rows = await em.getConnection().execute(
      `SELECT d.id AS deporteId, d.nombre AS deporte, COUNT(e.id) AS totalEventos
      FROM deporte d
      INNER JOIN evento e ON d.id = e.deporte_id
      GROUP BY d.id, d.nombre`
    );

    const deportesConEventosMap = (rows as any[]).map((r) => ({
      deporteId: Number(r.deporteId),
      deporte: String(r.deporte),
      totalEventos: Number(r.totalEventos),
    }));
    return deportesConEventosMap;
  } catch (error) {
    throw new Error('Error al obtener estadísticas de deportes con eventos');
  }
}
