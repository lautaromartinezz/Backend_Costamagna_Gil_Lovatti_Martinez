import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Equipo } from './equipo.entity.js';
import { Evento } from '../evento/evento.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { orm } from '../shared/db/orm.js';
import { FilterQuery } from '@mikro-orm/core';

const em = orm.em;

function sanitizeEquipoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    nombreCapitan: req.body.nombreCapitan,
    capitan: req.body.capitan,
    puntos: req.body.puntos,
    esPublico: req.body.esPublico,
    contraseña: req.body.contraseña,
    id: req.body.id,
    evento: req.body.evento,
    miembros: req.body.miembros ? req.body.miembros : [],
  };
  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const equipo = await em.find(
      Equipo,
      {},
      {
        populate: [
          'miembros',
          'evento',
          'partidoVisitante',
          'partidoLocal',
          'evento.deporte',
        ],
      }
    );
    res.status(200).json({
      message: 'Equipos encontrados satisfactoriamente',
      data: equipo,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al recuperar los equipos' });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const equipo = await em.findOneOrFail(
      Equipo,
      { id },
      {
        populate: [
          'miembros',
          'evento',
          'partidoVisitante',
          'partidoLocal',
          'evento.deporte',
          'capitan',
        ],
      }
    );
    res.status(200).json({ message: 'Equipo encontrado', data: equipo });
  } catch (error: any) {
    res.status(500).json({ message: 'Equipo no encontrado' });
  }
}

async function add(req: Request, res: Response) {
  try {
    const sanitizedInput = req.body.sanitizedInput;
    const eventoId = sanitizedInput.evento;
    if (!eventoId) {
      res.status(400).json({ message: 'eventoId es requerido' });
      return;
    }
    const evento = await em.findOne(Evento, { id: eventoId });
    if (!evento) {
      res.status(404).json({ message: 'Evento no encontrado' });
      return;
    }
    const ahora = new Date();
    const fechaini = evento.fechaInicioInscripcion;
    const fechafin = evento.fechaFinInscripcion;
    if (ahora < fechaini || ahora > fechafin) {
      res.status(400).json({
        message: 'No se puede crear un equipo fuera del período de inscripción',
      });
      return;
    }

    const equiposActuales = await em.count(Equipo, { evento: evento.id });
    const maxEquipos = Number(evento.cantEquiposMax);
    if (equiposActuales >= maxEquipos) {
      res.status(400).json({
        message: 'El evento ya alcanzó la cantidad máxima de equipos',
      });
      return;
    }
    const equipo = em.create(Equipo, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'Equipo creado', data: equipo });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al crear el equipo' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const equipoToUpdate = await em.findOneOrFail(Equipo, { id });
    em.assign(equipoToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'Equipo actualizado', data: equipoToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el equipo' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const equipoToRemove = await em.findOneOrFail(Equipo, { id });
    em.remove(equipoToRemove);
    await em.flush();
    res.status(200).json({ message: 'Equipo eliminado' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el equipo' });
  }
}

async function postAddMember(req: Request, res: Response) {
  try {
    const equipoId = Number.parseInt(req.params.id);
    const { usuarioId } = req.body;

    if (!usuarioId) {
      res.status(400).json({ message: 'usuarioId requerido' });
      return;
    }
    const equipo = await em.findOneOrFail(
      Equipo,
      { id: equipoId },
      { populate: ['miembros', 'evento', 'evento.deporte'] }
    );
    const fechaini = (equipo as any).evento?.fechaInicioInscripcion;
    const fechafin = (equipo as any).evento?.fechaFinInscripcion;
    const ahora = new Date();
    if (ahora < fechaini || ahora > fechafin) {
      res.status(400).json({
        message:
          'No se puede agregar miembros fuera del período de inscripción',
      });
      return;
    }
    const deporte = (equipo as any).evento?.deporte as any;
    const cantmax = deporte?.cantMaxJugadores;
    if (cantmax && equipo.miembros.length >= cantmax) {
      res.status(400).json({
        message: 'El equipo ya alcanzó la cantidad máxima de miembros',
      });
      return;
    }

    const usuario = await em.findOne(Usuario, { id: usuarioId });
    if (!usuario) {
      res.status(400).json({ message: 'Usuario no existe' });
      return;
    }
    if ((equipo.miembros as any).contains(usuario)) {
      res.status(400).json({ message: 'Usuario ya es miembro del equipo' });
      return;
    }

    if (!equipo.miembros.contains(usuario)) {
      equipo.miembros.add(usuario);
      await em.flush();
    }

    res.status(200).json({ message: 'Usuario añadido', data: equipo });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al añadir miembro', error: error.message });
  }
}

async function deleteSelfFromMembers(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    console.log(
      '[deleteSelf] called, equipo id=',
      id,
      'req.user=',
      (req as any).user
    );

    const requester = (req as any).user;
    if (!requester?.id)
      return res.status(401).json({ message: 'No autenticado' });
    const requesterId = Number(requester.id);
    if (Number.isNaN(requesterId)) {
      return res
        .status(400)
        .json({ message: 'Id de usuario en token inválido' });
    }
    const { usuarioId } = req.body || {};

    const equipo = await em.findOneOrFail(
      Equipo,
      { id },
      { populate: ['miembros', 'capitan'] }
    );
    const targetId =
      usuarioId !== undefined && usuarioId !== null
        ? Number(usuarioId)
        : requesterId;
    if (Number.isNaN(targetId)) {
      return res
        .status(400)
        .json({ message: 'Id de usuario a eliminar inválido' });
    }

    const capId = (equipo.capitan as any)?.id;
    const isCaptain = capId === requesterId;

    if (targetId !== requesterId && !isCaptain) {
      return res
        .status(403)
        .json({ message: 'Solo el capitán puede eliminar a otros miembros' });
    }

    if (targetId === requesterId && isCaptain) {
      return res.status(403).json({
        message:
          'El capitán no puede eliminarse a sí mismo. Transfiere la capitanía o elimina el equipo.',
      });
    }

    const usuario = await em.findOne(Usuario, { id: targetId });
    if (!usuario) return res.status(400).json({ message: 'Usuario no existe' });

    if (
      (equipo.miembros as any).contains &&
      (equipo.miembros as any).contains(usuario)
    ) {
      (equipo.miembros as any).remove(usuario);
      await em.flush();
    } else {
      return res
        .status(404)
        .json({ message: 'Usuario no es miembro del equipo' });
    }

    const updated = await em.findOne(
      Equipo,
      { id },
      { populate: ['miembros', 'capitan'] }
    );
    const message =
      targetId === requesterId
        ? 'Usuario eliminado de miembros'
        : 'Usuario eliminado por el capitán';
    return res.status(200).json({ message, data: updated });
  } catch (error: any) {
    console.error('[deleteSelf] error:', error);
    return res
      .status(500)
      .json({ message: 'Error al eliminar miembro', error: error.message });
  }
}

async function findAllByEvento(req: Request, res: Response) {
  try {
    const eventoId = Number.parseInt(req.params.eventoId);
    const equipos = await em.find(
      Equipo,
      { evento: eventoId },
      { populate: ['miembros', 'evento'] }
    );
    res
      .status(200)
      .json({ message: 'Equipos del evento encontrados', data: equipos });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al recuperar los equipos del evento' });
  }
}

async function findByUsuario(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);

    const filter: FilterQuery<Equipo> = {
      $or: [{ capitan: userId }, { miembros: { id: userId } }],
    };

    const equipos = await em.find(Equipo, filter, {
      populate: ['evento', 'evento.partidos', 'evento.deporte'],
      orderBy: { nombre: 'asc' },
    });

    res.status(200).json({ message: 'OK', data: equipos });
    return;
  } catch (e: any) {
    res.status(500).json({
      message: 'Error obteniendo equipos del usuario',
      error: e?.message,
    });
    return;
  }
}

export {
  sanitizeEquipoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  postAddMember,
  deleteSelfFromMembers,
  findAllByEvento,
  findByUsuario,
};
