import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Partido } from './partido.entity.js';

const em = orm.em;

function sanitizePartidoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    fecha: req.body.fecha,
    hora: req.body.hora,
    juez: req.body.juez,
    resultado: req.body.resultado,
    equipoLocal: req.body.equipoLocal,
    equipoVisitante: req.body.equipoVisitante,
    mpv: req.body.mpv,
    maxAnotador: req.body.maxAnotador,
    evento: req.body.evento,
    establecimiento: req.body.establecimiento,
    id: req.body.id,
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
    const partidos = await em.find(Partido, {}, {populate: ['evento', 'establecimiento']});
    res
      .status(200)
      .json({ message: 'Partidos retrieved successfully', data: partidos });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error retrieving partidos', error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const partido = await em.findOneOrFail(Partido, { id }, {populate: ['evento', 'establecimiento']});
    res.status(200).json({ message: 'found partido', data: partido });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const partido = em.create(Partido, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'partido created', data: partido });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const partidoToUpdate = await em.findOneOrFail(Partido, { id });
    em.assign(partidoToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'partido updated', data: partidoToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const partido = em.getReference(Partido, id);
    res.status(200).json({ message: 'partido deleted', data: partido })
    await em.removeAndFlush(partido);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizePartidoInput, findAll, findOne, add, update, remove };