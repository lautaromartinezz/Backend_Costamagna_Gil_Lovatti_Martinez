import { Request, Response, NextFunction } from 'express';
import { Noticia } from './noticia.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeNoticiaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
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
    const noticias = await em.find(Noticia, {});
    res
      .status(200)
      .json({ message: 'Noticias retrieved successfully', data: noticias });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error retrieving noticias', error: error.message });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const noticia = await em.findOneOrFail(Noticia, { id });
    res.status(200).json({ message: 'found noticia', data: noticia });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const noticia = em.create(Noticia, req.body.sanitizedInput);
    await em.flush();
    res.status(201).json({ message: 'noticia created', data: noticia });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const noticiaToUpdate = await em.findOneOrFail(Noticia, { id });
    em.assign(noticiaToUpdate, req.body.sanitizedInput);
    await em.flush();
    res.status(200).json({ message: 'noticia updated', data: noticiaToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const noticia = em.getReference(Noticia, id);
    await em.removeAndFlush(noticia);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export { sanitizeNoticiaInput, findAll, findOne, add, update, remove };
