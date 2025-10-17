import { Request, Response, NextFunction } from 'express';
import { Noticia } from './noticia.entity.js';
import { orm } from '../shared/db/orm.js';
import { FilterQuery } from '@mikro-orm/core';

const em = orm.em;

function sanitizeNoticiaInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    titulo: req.body.titulo,
    descripcion: req.body.descripcion,
    fecha: req.body.fecha,
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
    const orderParam = String(req.query.order || 'desc').toLowerCase();
    const order: 'asc' | 'desc' = orderParam === 'asc' ? 'asc' : 'desc';
    const noticias = await em.find(Noticia, {}, { orderBy: { fecha: order } });
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
    const noticia = await em.findOneOrFail(Noticia, { id });
    em.remove(noticia);
    await em.flush();
    res.status(200).json({ message: 'noticia deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findSome(req: Request, res: Response) {
  try {
    const filter: FilterQuery<Noticia> = {};

    const qDesde = typeof req.query.fechaDesde === 'string' ? req.query.fechaDesde : undefined;
    const qHasta = typeof req.query.fechaHasta === 'string' ? req.query.fechaHasta : undefined;

    const parseLocalDay = (s: string) => {
      const d = new Date(s);
      if (isNaN(d.getTime())) return null;
      d.setHours(0, 0, 0, 0);
      const end = new Date(d);
      end.setDate(end.getDate() + 1); // exclusivo
      return { start: d, end };
    };
    
    const range: Record<string, Date> = {};
    
    if (qDesde) {
      const r = parseLocalDay(qDesde);
      if (!r){ 
        res.status(400).json({ message: 'Parametro fechaDesde inválido (YYYY-MM-DD)' });
        return;
      }
      range.$gte = r.start;
    }
    if (qHasta) {
      const r = parseLocalDay(qHasta);
      if (!r) {
        res.status(400).json({ message: 'Parametro fechaHasta inválido (YYYY-MM-DD)' });
        return;
      }
      range.$lt = r.end; // incluye todo el día de fechaHasta
    }
    if (Object.keys(range).length) filter.fecha = range as any;

    const noticias = await em.find(Noticia, filter, { orderBy: { fecha: 'desc' } });
    res.status(200).json({ message: 'Noticias filtradas', data: noticias });
  } catch (error: any) {
    res.status(500).json({ message: 'Error filtrando noticias', error: error.message });
  }
}


export { sanitizeNoticiaInput, findAll, findOne, add, update, remove, findSome };
