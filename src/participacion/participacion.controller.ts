import { Request, Response, NextFunction } from 'express';
import { Participacion } from './participacion.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeparticipacionInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    puntos: req.body.puntos,
    minutosjugados: req.body.minutosjugados,
    faltas: req.body.faltas,
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
    const participacions = await em.find(Participacion, {});
    res.status(200).json({
      message: 'participacions retrieved successfully',
      data: participacions,
    });
  } catch (error: any) {
    res.status(500).json({
      message: 'Error retrieving participacions',
      error: error.message,
    });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const participacion = await em.findOneOrFail(Participacion, { id });
    res
      .status(200)
      .json({ message: 'found participacion', data: participacion });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const participacion = em.create(Participacion, req.body.sanitizedInput);
    await em.flush();
    res
      .status(201)
      .json({ message: 'participacion created', data: participacion });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const participacionToUpdate = await em.findOneOrFail(Participacion, { id });
    em.assign(participacionToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'participacion updated', data: participacionToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const participacion = em.getReference(Participacion, id);
    await em.removeAndFlush(participacion);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeparticipacionInput, findAll, findOne, add, update, remove };
