import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Participacion } from './participacion.entity.js';
import { orm } from '../shared/db/orm.js';
import { Equipo } from '../equipo/equipo.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
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

    console.log(`Fetching equipo with ID: ${equipoid}`);
    const equipo = await em.findOneOrFail(
      Equipo,
      { id: equipoid },
      { populate: ['miembros'] },
    );

    console.log(`Equipo fetched successfully:`, equipo);
    const miembroIds = equipo.miembros
      .getItems()
      .map((miembro) => miembro.id)
      .filter((id): id is number => id !== undefined);

    console.log(`Member IDs extracted:`, miembroIds);

    const participaciones = await em.find(
      Participacion,
      {
        partido: idpartido,
        usuario: { $in: miembroIds },
      },
      { populate: ['usuario'] },
    );

    console.log(`Participaciones fetched successfully:`, participaciones);

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
    console.log(
      `Fetching participaciones for usuario ID: ${usuarioId} in evento ID: ${idevento}`,
    );

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
  console.log(`Fetching participaciones for evento ID: ${idevento}`);
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
    const participacionesTotales = new Map<number, Participacion>();
    for (const participacion of participaciones) {
      const usuario = participacion.usuario;
      if (!usuario?.id) continue;
      const usuarioId = usuario.id;
      if (!participacionesTotales.has(usuarioId)) {
        const p = new Participacion();
        p.usuario = usuario;
        participacionesTotales.set(usuarioId, p);
      }
      participacionesTotales.get(usuarioId)?.sumarParticipacion(participacion);
    }
    res.status(200).json({
      message: 'Participaciones totales retrieved successfully',
      data: Array.from(participacionesTotales.values()).map((p) => ({
        puntos: p.puntos,
        minutosjugados: p.minutosjugados,
        faltas: p.faltas,
        usuario: {
          id: p.usuario!.id,
          nombre: p.usuario!.nombre,
          apellido: p.usuario!.apellido,
          equipos: [
            p.usuario!.getEquipoEvento(
              Number.parseInt(req.query.eventoId as string),
            ),
          ],
        },
      })),
    });
  } catch (error: any) {
    console.error('Error in traerParticipacionesTotalesPorTorneo:', error);
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
};
