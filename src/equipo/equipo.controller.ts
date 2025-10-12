import { Request, Response, NextFunction } from 'express';
import { Equipo } from './equipo.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { orm } from '../shared/db/orm.js';

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

// simple add member endpoint: POST /equipos/:id/miembros { usuarioId }
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
      { populate: ['miembros'] }
    );
    const usuario = await em.findOne(Usuario, { id: usuarioId });
    if (!usuario) {
      res.status(400).json({ message: 'Usuario no existe' });
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

    // Optional usuarioId in body: if provided, requester must be the capitan to remove that user
    const { usuarioId } = req.body || {};

    const equipo = await em.findOneOrFail(
      Equipo,
      { id },
      { populate: ['miembros', 'capitan'] }
    );

    // determine the id of the user to remove
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

    // If trying to remove someone else, only captain can do it
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

    // ensure miembro exists on the equipo
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
  try{
    const eventoId = Number.parseInt(req.params.eventoId);
    const equipos = await em.find(Equipo, { evento: eventoId }, { populate: ['miembros', 'evento'] });
    res.status(200).json({ message: 'Equipos del evento encontrados', data: equipos });
  }
  catch (error: any) {
    res.status(500).json({ message: 'Error al recuperar los equipos del evento' });
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
};
