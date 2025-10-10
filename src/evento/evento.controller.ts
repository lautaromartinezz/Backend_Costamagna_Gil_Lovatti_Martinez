import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Evento } from './evento.entity.js';

const em = orm.em;

function sanitizeEventoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    esPublico: req.body.esPublico,
    id: req.body.id,
    contraseña: req.body.contraseña,
    cantEquiposMax: req.body.cantEquiposMax,
    fechaInicioInscripcion: req.body.fechaInicioInscripcion,
    fechaFinInscripcion: req.body.fechaFinInscripcion,
    fechaInicioEvento: req.body.fechaInicioEvento,
    fechaFinEvento: req.body.fechaFinEvento,
    deporte: req.body.deporte,
    equipos: req.body.equipos ? req.body.equipos : [],
    partidos: req.body.partidos ? req.body.partidos : [],
    localidad: req.body.localidad,
  };
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key];
    }
  });
  next();
}

async function findAll(req: Request, res: Response) {
  try {
    const eventos = await em.find(
      Evento,
      {},
      {
        populate: [
          'deporte',
          'equipos',
          'equipos.miembros',
          'partidos',
          'localidad',
          'equipos.capitan',
          'partidos',
        ],
      }
    );
    res
      .status(200)
      .json({ message: 'Eventos retrieved successfully', data: eventos });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error retrieving eventos', error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const evento = await em.findOneOrFail(
      Evento,
      { id },
      {
        populate: [
          'deporte',
          'equipos',
          'equipos.miembros',
          'partidos',
          'localidad',
          'equipos.capitan',
          'partidos',
        ],
      }
    );
    res.status(200).json({ message: 'found evento', data: evento });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const sanitizedInput = req.body.sanitizedInput;

    const evento = em.create(Evento, {
      ...sanitizedInput,
      creador: userId,
    });

    await em.flush();
    res.status(201).json({ message: 'Evento creado', data: evento });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const userId = (req as any).user.id;

    const eventoToUpdate = await em.findOneOrFail(
      Evento,
      { id },
      { populate: ['creador'] }
    );

    if (eventoToUpdate.creador.id !== userId) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para modificar este evento' });
    }

    em.assign(eventoToUpdate, req.body.sanitizedInput);
    await em.flush();

    res
      .status(200)
      .json({ message: 'Evento actualizado', data: eventoToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const userId = (req as any).user.id;

    const evento = await em.findOneOrFail(
      Evento,
      { id },
      { populate: ['creador'] }
    );

    if (evento.creador.id !== userId) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para eliminar este evento' });
    }

    await em.removeAndFlush(evento);
    res.status(200).json({ message: 'Evento eliminado', data: evento });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeEventoInput, findAll, findOne, add, update, remove };
