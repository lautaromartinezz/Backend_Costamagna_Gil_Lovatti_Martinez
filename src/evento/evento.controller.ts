import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Evento } from './evento.entity.js';
import { Deporte } from '../deporte/deporte.entity.js';
import { FilterQuery, NotFoundError } from '@mikro-orm/core';

import { EntityManager } from '@mikro-orm/mysql';
import { randomInt } from 'crypto';
const em = orm.em;

function sanitizeEventoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    descripcion: req.body.descripcion,
    esPublico: req.body.esPublico,
    id: req.body.id,
    contrasenia: req.body.contrasenia,
    cantEquiposMax: req.body.cantEquiposMax,
    fechaInicioInscripcion: req.body.fechaInicioInscripcion,
    fechaFinInscripcion: req.body.fechaFinInscripcion,
    fechaInicioEvento: req.body.fechaInicioEvento,
    fechaFinEvento: req.body.fechaFinEvento,
    deporte: req.body.deporte,
    equipos: req.body.equipos ? req.body.equipos : [],
    partidos: req.body.partidos ? req.body.partidos : [],
    localidad: req.body.localidad,
    codigo: req.body.codigo,
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
          'partidos.equipoLocal',
          'partidos.equipoVisitante',
          'partidos.establecimiento',
        ],
      },
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
          'partidos.equipoLocal',
          'partidos.equipoVisitante',
          'partidos.establecimiento',
        ],
      },
    );
    res.status(200).json({ message: 'found evento', data: evento });
  } catch (error: any) {
    const message = String(error?.message ?? '');
    const isNotFound =
      error instanceof NotFoundError ||
      error?.name === 'NotFoundError' ||
      /not found|no\s+\w+\s+entity\s+found/i.test(message);

    if (isNotFound) {
      res.status(404).json({ message: 'Evento no encontrado' });
      return;
    }

    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const sanitizedInput = req.body.sanitizedInput;
    if (
      sanitizedInput.fechaFinInscripcion < sanitizedInput.fechaInicioInscripcion
    ) {
      res.status(400).json({
        message:
          'La fecha de fin de inscripción no puede ser anterior a la fecha de inicio de inscripción.',
      });
      return;
    }
    if (
      sanitizedInput.fechaInicioEvento &&
      sanitizedInput.fechaInicioEvento < sanitizedInput.fechaFinInscripcion
    ) {
      res.status(400).json({
        message:
          'La fecha de inicio del evento no puede ser anterior a la fecha de fin de inscripción.',
      });
      return;
    }
    if (
      sanitizedInput.fechaFinEvento &&
      sanitizedInput.fechaInicioEvento &&
      sanitizedInput.fechaFinEvento < sanitizedInput.fechaInicioEvento
    ) {
      res.status(400).json({
        message:
          'La fecha de fin del evento no puede ser anterior a la fecha de inicio del evento.',
      });
      return;
    }

    const evento = em.create(Evento, {
      ...sanitizedInput,
      creador: userId,
      codigo: await generarCodigoUnico(em),
    });

    await em.flush();
    res.status(201).json({ message: 'Evento creado', data: evento });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(len = 8): string {
  let out = '';
  for (let i = 0; i < len; i++) out += ALPHABET[randomInt(0, ALPHABET.length)];
  return out;
}

async function generarCodigoUnico(em: EntityManager, len = 8): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode(len);
    const exists = await em.count(Evento, { codigo: code });
    if (exists === 0) return code;
  }
  return generarCodigoUnico(em, len + 1);
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const userId = (req as any).user.id;

    const eventoToUpdate = await em.findOneOrFail(
      Evento,
      { id },
      { populate: ['creador'] },
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

async function buscarxcodigo(req: Request, res: Response) {
  try {
    const codigo = req.params.codigo;
    const evento = await em.findOne(Evento, { codigo });
    if (!evento) {
      res.status(404).json({ message: 'Evento no encontrado' });
    }
    res.status(200).json({ message: 'Evento encontrado', data: evento });
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
      { populate: ['creador', 'equipos', 'partidos', 'establecimientos'] },
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

    const qDeporte =
      typeof req.query.deporte === 'string'
        ? parseInt(req.query.deporte)
        : undefined;
    if (qDeporte) filter.deporte = qDeporte;

    const qLocalidad =
      typeof req.query.localidad === 'string'
        ? parseInt(req.query.localidad)
        : undefined;
    if (qLocalidad) filter.localidad = qLocalidad;

    const qMaxEquip =
      typeof req.query.equiposHasta === 'string'
        ? parseInt(req.query.equiposHasta)
        : undefined;
    if (qMaxEquip) filter.cantEquiposMax = { $lte: qMaxEquip } as any;

    const qMinEquip =
      typeof req.query.equiposDesde === 'string'
        ? parseInt(req.query.equiposDesde)
        : undefined;
    if (qMinEquip)
      filter.cantEquiposMax = {
        ...(filter.cantEquiposMax as object),
        $gte: qMinEquip,
      } as any;

    const qDesde =
      typeof req.query.fechaDesde === 'string'
        ? req.query.fechaDesde
        : undefined;
    const qHasta =
      typeof req.query.fechaHasta === 'string'
        ? req.query.fechaHasta
        : undefined;

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
      if (!r) {
        res
          .status(400)
          .json({ message: 'Parametro fechaDesde inválido (YYYY-MM-DD)' });
        return;
      }
      range.$gte = r.start;
    }
    if (qHasta) {
      const r = parseLocalDay(qHasta);
      if (!r) {
        res
          .status(400)
          .json({ message: 'Parametro fechaHasta inválido (YYYY-MM-DD)' });
        return;
      }
      range.$lt = r.end; // incluye todo el día de fechaHasta
    }
    if (Object.keys(range).length) filter.fechaInicioEvento = range as any;

    const eventos = await em.find(Evento, filter, {
      orderBy: { fechaInicioEvento: 'desc' },
      populate: ['deporte', 'equipos', 'partidos'],
    });
    res.status(200).json({ message: 'Eventos filtrados', data: eventos });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error filtrando eventos', error: error.message });
  }
}

//findXCreator y findXParticipant tendrian que ser con AuthMiddleware pero no lo pude hacer andar
async function findXCreator(req: Request, res: Response) {
  try {
    const userId = Number.parseInt(req.params.idCreador);
    if (!userId) {
      res.status(401).json({ message: 'User ID no proporcionado' });
    }
    const eventos = await em.find(
      Evento,
      { creador: { id: userId } },
      { populate: ['deporte', 'localidad', 'creador'] },
    );
    res.status(200).json({ message: 'Eventos del creador', data: eventos });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: (req as any).user.id, error: error.message });
  }
}
async function findXParticipant(req: Request, res: Response) {
  try {
    const userId = Number.parseInt(req.params.idUsuario);
    if (!userId) {
      res.status(401).json({ message: 'User ID no proporcionado' });
    }
    const eventos = await em.find(
      Evento,
      { equipos: { miembros: { id: userId } } },
      { populate: ['deporte', 'localidad', 'equipos.miembros'] },
    );

    res
      .status(200)
      .json({ message: 'Eventos donde participa el usuario', data: eventos });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

export {
  sanitizeEventoInput,
  findAll,
  findSome,
  findOne,
  add,
  update,
  remove,
  buscarxcodigo,
  findXCreator,
  findXParticipant,
};
