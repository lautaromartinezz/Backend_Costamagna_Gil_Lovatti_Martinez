import { Request, Response, NextFunction } from 'express';
import { orm } from '../shared/db/orm.js';
import { Partido } from './partido.entity.js';
import { Equipo } from '../equipo/equipo.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Evento } from './evento.entity.js';
import { Establecimiento } from '../establecimiento/establecimiento.entity.js';

const em = orm.em;

function sanitizePartidoInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    fecha: req.body.fecha,
    hora: req.body.hora,
    juez: req.body.juez,
    resultadoLocal: req.body.resultadoLocal,
    resultadoVisitante: req.body.resultadoVisitante,
    equipoLocal: req.body.equipoLocal,
    equipoVisitante: req.body.equipoVisitante,
    mvp: req.body.mvp,
    maxAnotador: req.body.maxAnotador,
    evento: req.body.evento,
    establecimiento: req.body.establecimiento,
    id: req.body.id,
    participations: req.body.participations,
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
    const partidos = await em.find(
      Partido,
      {},
      {
        populate: [
          'evento',
          'evento.deporte',
          'establecimiento',
          'equipoLocal',
          'equipoVisitante',
          'mvp',
          'maxAnotador',
          'participations',
          'participations.usuario',
        ],
      }
    );
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
    const partido = await em.findOneOrFail(
      Partido,
      { id },
      {
        populate: [
          'evento',
          'evento.deporte',
          'establecimiento',
          'equipoLocal.miembros',
          'equipoVisitante.miembros',
          'equipoLocal',
          'equipoVisitante',
          'equipoLocal.capitan',
          'equipoVisitante.capitan',
          'mvp',
          'maxAnotador',
          'participations',
          'participations.usuario',
        ],
      }
    );
    res.status(200).json({ message: 'found partido', data: partido });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function add(req: Request, res: Response) {
  try {
    const sanitizedPartido = req.body.sanitizedInput;

    const evento = await em.findOneOrFail(Evento, {
      id: sanitizedPartido.evento,
    });
    const fechaStr: string | undefined = sanitizedPartido.fecha;
    const partidoDate = (() => {
      if (fechaStr) return new Date(`${fechaStr}`);
    })();

    const inicio = evento?.fechaInicioEvento
      ? new Date(evento.fechaInicioEvento)
      : null;
    const fin = evento?.fechaFinEvento ? new Date(evento.fechaFinEvento) : null;

    if (
      inicio &&
      partidoDate &&
      fin &&
      !(partidoDate >= inicio && partidoDate <= fin)
    ) {
      res.status(400).json({
        message: 'El partido no se puede crear fuera del rango del evento',
      });
    }
    if (sanitizedPartido.equipoLocal === sanitizedPartido.equipoVisitante) {
      res.status(400).json({
        message: 'El equipo local y visitante no pueden ser el mismo',
      });
    }

    const partido = em.create(Partido, sanitizedPartido);
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
    res.status(200).json({ message: 'partido deleted', data: partido });
    await em.removeAndFlush(partido);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

async function findAllByEvento(req: Request, res: Response) {
  try {
    const eventoId = Number.parseInt(req.params.eventoId);
    const partidos = await em.find(Partido, {
      evento: eventoId,
    });
    res.status(200).json({
      message: 'Partidos encontrados satisfactoriamente',
      data: partidos,
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: 'Error al recuperar los establecimientos' });
  }
}
export {
  sanitizePartidoInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  findAllByEvento,
};
