import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Evento } from './evento.entity.js';

const em = orm.em;

function sanitizeEventoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    esPublico: req.body.esPublico,
    id: req.body.id,
    contraseña: req.body.contraseña,
    cantEquiposMax: req.body.cantEquiposMax,
    fechaInicioInscripcion: req.body.fechaInicioInscripcion,
    fechaFinInscripcion: req.body.fechaFinInscripcion,
    fechaInicioEvento: req.body.fechaInicioEvento,
    fechaFinEvento: req.body.fechaFinEvento,
    deporte: req.body.deporte,
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
    const eventos = await em.find(Evento, {}, {populate: ['deporte']});
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
    const evento = await em.findOneOrFail(Evento, { id }, {populate: ['deporte']});
    res.status(200).json({ message: 'found evento', data: evento });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const evento = em.create(Evento, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'evento created', data: evento });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const eventoToUpdate = await em.findOneOrFail(Evento, { id });
    em.assign(eventoToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'evento updated', data: eventoToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const evento = em.getReference(Evento, id);
    res.status(200).json({ message: 'evento deleted', data: evento })
    await em.removeAndFlush(evento);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeEventoInput, findAll, findOne, add, update, remove };
