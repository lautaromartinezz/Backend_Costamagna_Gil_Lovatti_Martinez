import { EntityManager } from '@mikro-orm/mysql';
import { Usuario } from '../usuario/usuario.entity.js';
import { Deporte } from '../deporte/deporte.entity.js';
import { Evento } from '../evento/evento.entity.js';

export async function getBasicStats(em: EntityManager) {
  const totalUsers = await em.count(Usuario, {});
  const deportes = await em.count(Deporte, {});
  const eventos = await em.count(Evento, {});

  return {
    totalUsers,
    deportes,
    eventos
  };
}