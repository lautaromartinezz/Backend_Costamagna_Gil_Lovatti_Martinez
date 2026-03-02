import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Participacion } from './participacion.entity.js';
import { orm } from '../shared/db/orm.js';
import { Equipo } from '../equipo/equipo.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { ParticipacionTotalDTO } from './dto/participacionDTO.js';

const em = orm.em;

function sanitizeparticipacionInput(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.body.sanitizedInput = {
    puntos: req.body.puntos,
    minutosjugados: req.body.minutosjugados,
    faltas: req.body.faltas,
    partido: req.body.partido,
    usuario: req.body.usuario,
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
    const participacions = await em.find(
      Participacion,
      {},
      {
        populate: ['usuario', 'partido'],
      },
    );
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
    res.status(200).json({ message: 'participacion deleted' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
}

const traerparticipacionesporequipo: RequestHandler = async function (
  req,
  res,
) {
  try {
    const partidoIdRaw = (req.query.partidoId ?? req.query.partidoid) as string;
    const equipoIdRaw = (req.query.equipoid ?? req.query.equipo) as string;
    const idpartido = Number.parseInt(partidoIdRaw);
    const equipoid = Number.parseInt(equipoIdRaw);

    const equipo = await em.findOneOrFail(
      Equipo,
      { id: equipoid },
      { populate: ['miembros'] },
    );

    const miembroIds = equipo.miembros
      .getItems()
      .map((miembro) => miembro.id)
      .filter((id): id is number => id !== undefined);


    const participaciones = await em.find(
      Participacion,
      {
        partido: idpartido,
        usuario: { $in: miembroIds },
      },
      { populate: ['usuario'] },
    );

    res.status(200).json({
      message: 'Participaciones retrieved successfully',
      data: participaciones,
    });
  } catch (error: any) {
    console.error('Error in traerparticipacionesporequipo:', error);
    res.status(500).json({ message: error.message });
  }
};

const traerParticipacionesPorUsuarioEnTorneo: RequestHandler = async function (
  req,
  res,
) {
  try {
    const usuarioIdRaw = req.query.usuarioId as string;
    const idEventoRaw = req.query.eventoId as string;
    const usuarioId = Number.parseInt(usuarioIdRaw);
    const idevento = Number.parseInt(idEventoRaw);

    const participaciones = await em.find(
      Participacion,
      {
        usuario: usuarioId,
        partido: {
          evento: idevento,
        },
      },
      { populate: ['partido'] },
    );

    res.status(200).json({
      message: 'Participaciones retrieved successfully',
      data: participaciones,
    });
  } catch (error: any) {
    console.error('Error in traerParticipacionesPorUsuarioEnTorneo:', error);
    res.status(500).json({ message: error.message });
  }
};

//se puede ver de parametrizar la funcion para poder trabajar con varios populate
const buscarParticipacionesPorTorneo = async function (
  req: Request,
  res: Response,
) {
  const idEventoRaw = req.query.eventoId as string;
  const idevento = Number.parseInt(idEventoRaw);
  const participaciones = await em.find(
    Participacion,
    {
      partido: {
        evento: idevento,
      },
    },
    { populate: ['partido', 'usuario.equipos'] },
  );
  return participaciones;
};

const traerParticipacionesPorTorneo: RequestHandler = async function (
  req,
  res,
) {
  try {
    const participaciones = buscarParticipacionesPorTorneo(req, res);
    res.status(200).json({
      message: 'Participaciones retrieved successfully',
      data: participaciones,
    });
  } catch (error: any) {
    console.error('Error in traerParticipacionesPorTorneo:', error);
    res.status(500).json({ message: error.message });
  }
};

const traerParticipacionesTotalesPorTorneo: RequestHandler = async function (
  req,
  res,
) {
  try {
    const participaciones = await buscarParticipacionesPorTorneo(req, res);
    const participacionesTotales = new Map<number, ParticipacionTotalDTO>();
    for (const participacion of participaciones) {
      const usuario = participacion.usuario;
      if (!usuario?.id) continue;
      const usuarioId = usuario.id;
      if (!participacionesTotales.has(usuarioId)) {
        const equipo = usuario.getEquipoEvento(
          Number.parseInt(req.query.eventoId as string),
        );
        participacionesTotales.set(usuarioId, {
          usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido: usuario.apellido,
            equipos: equipo
              ? [
                  {
                    id: equipo.id!,
                    nombre: equipo.nombre,
                  },
                ]
              : [],
          },
          puntos: 0,
          faltas: 0,
          minutosjugados: 0,
        });
      }
      const acumulado = participacionesTotales.get(usuarioId)!;

      acumulado.puntos += participacion.puntos ?? 0;
      acumulado.faltas += participacion.faltas ?? 0;
      acumulado.minutosjugados += participacion.minutosjugados ?? 0;
    }
    res.status(200).json({
      message: 'Participaciones totales retrieved successfully',
      data: Array.from(participacionesTotales.values()).sort(
        (a, b) => b.puntos - a.puntos,
      ),
    });
  } catch (error: any) {
    console.error('Error in traerParticipacionesTotalesPorTorneo:', error);
    res.status(500).json({ message: error.message });
  }
};

const traerParticipacionesPorUsuario: RequestHandler = async function (
  req,
  res,
) {
  try {
    const usuarioIdRaw = req.query.usuarioId as string;
    const usuarioId = Number.parseInt(usuarioIdRaw);

    if (Number.isNaN(usuarioId)) {
      res.status(400).json({ message: 'usuarioId inválido' });
      return;
    }

    const participaciones = await em.find(
      Participacion,
      {
        usuario: usuarioId,
      },
      {
        populate: [
          'usuario',
          'partido',
          'partido.evento',
          'partido.evento.deporte',
          'partido.fecha',
          'partido.equipoLocal',
          'partido.equipoVisitante',
          'partido.equipoLocal',
        ],
      },
    );

    res.status(200).json({
      message: 'Participaciones retrieved successfully',
      data: participaciones,
    });
  } catch (error: any) {
    console.error('Error in traerParticipacionesPorUsuario:', error);
    res.status(500).json({ message: error.message });
  }
};

export {
  sanitizeparticipacionInput,
  findAll,
  findOne,
  add,
  update,
  remove,
  traerparticipacionesporequipo,
  traerParticipacionesPorUsuarioEnTorneo,
  traerParticipacionesPorTorneo,
  traerParticipacionesTotalesPorTorneo,
  traerParticipacionesPorUsuario,
};
