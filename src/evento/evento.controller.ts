import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Evento } from './evento.entity.js';
import { Deporte } from '../deporte/deporte.entity.js';
import { FilterQuery } from '@mikro-orm/core';

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
    localidad: req.body.localidad ? req.body.localidad : 1,
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
      res
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
      res
        .status(403)
        .json({ message: 'No tienes permiso para eliminar este evento' });
    }

    await em.removeAndFlush(evento);
    res.status(200).json({ message: 'Evento eliminado', data: evento });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findSome(req: Request, res: Response) {
  try {
    const filter: FilterQuery<Evento> = {};

    const qDeporte = typeof req.query.deporte === 'string' ? parseInt(req.query.deporte) : undefined;
    if (qDeporte) filter.deporte = qDeporte;

    const qLocalidad = typeof req.query.localidad === 'string' ? parseInt(req.query.localidad) : undefined;
    if (qLocalidad) filter.localidad = qLocalidad;

    const qMaxEquip = typeof req.query.equiposHasta === 'string' ? parseInt(req.query.equiposHasta) : undefined;
    if (qMaxEquip) filter.cantEquiposMax = { $lte: qMaxEquip } as any;

    const qMinEquip = typeof req.query.equiposDesde === 'string' ? parseInt(req.query.equiposDesde) : undefined;
    if (qMinEquip) filter.cantEquiposMax = { ...(filter.cantEquiposMax as object), $gte: qMinEquip } as any;

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
    if (Object.keys(range).length) filter.fechaInicioEvento = range as any;

    const eventos = await em.find(Evento, filter, { orderBy: { fechaInicioEvento: 'desc' }, populate: ['deporte', 'equipos', 'partidos'] });
    res.status(200).json({ message: 'Eventos filtrados', data: eventos });
  } catch (error: any) {
    res.status(500).json({ message: 'Error filtrando eventos', error: error.message });
  }
}

export { sanitizeEventoInput, findAll, findOne, add, update, remove, findSome };
