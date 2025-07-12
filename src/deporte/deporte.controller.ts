import { Request, Response, NextFunction } from 'express';
import { Deporte } from './deporte.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeDeporteInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    cantMinJugadores: req.body.cantMinJugadores,
    cantMaxJugadores: req.body.cantMaxJugadores,
    duracion: req.body.duracion,
    id: req.body.id,
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
    const deportes = await em.find(Deporte, {});
    res
      .status(200)
      .json({ message: 'Deportes retrieved successfully', data: deportes });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error retrieving deportes', error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const deporte = await em.findOneOrFail(Deporte, { id });
    res.status(200).json({ message: 'found deporte', data: deporte });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const deporte = em.create(Deporte, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'deporte created', data: deporte });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const deporteToUpdate = await em.findOneOrFail(Deporte, { id });
    em.assign(deporteToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'deporte updated', data: deporteToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const deporte = em.getReference(Deporte, id);
    await em.removeAndFlush(deporte);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeDeporteInput, findAll, findOne, add, update, remove };
