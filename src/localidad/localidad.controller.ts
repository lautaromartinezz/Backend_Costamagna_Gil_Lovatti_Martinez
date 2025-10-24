import { Request, Response, NextFunction } from 'express';
import { Localidad } from './localidad.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeLocalidadInput(
  req: Request,
  res: Response,
  next: NextFunction
) {
  req.body.sanitizedInput = {
    descripcion: req.body.descripcion,
    lat: req.body.lat,
    lng: req.body.lng,
    codigo: req.body.codigo,
    id: req.body.id,
    eventos: req.body.eventos ? req.body.eventos : [],
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
    const localidad = await em.find(
      Localidad,
      {},
      {
        populate: ['eventos'],
      }
    );
    res.status(200).json({
      message: 'Localidades encontradas satisfactoriamente',
      data: localidad,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al recuperar las localidades' });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const localidad = await em.findOneOrFail(
      Localidad,
      { id },
      {
        populate: ['eventos'],
      }
    );
    res.status(200).json({ message: 'Localidad encontrada', data: localidad });
  } catch (error: any) {
    res.status(500).json({ message: 'Localidad no encontrada' });
  }
}

// async function add(req: Request, res: Response) {
//   try {
//     const localidad = em.create(Localidad, req.body.sanitizedInput);
//     const existe = await em.findOne(Localidad, { descripcion: localidad.descripcion })
//     if (existe) {
//       res.status(400).json({ message: 'La localidad ya existe' });
//       return;
//     }
//     await em.flush();
//     res.status(201).json({ message: 'Localidad creada', data: localidad });
//   } catch (error: any) {
//     res.status(500).json({ message: 'Error al crear la localidad' });
//   }
// }

async function add(req: Request, res: Response) {
  const em = orm.em.fork();
  try {
    const input = req.body.sanitizedInput as Localidad;

    // validar requeridos
    if (!input.descripcion || !input.lat || !input.lng || !input.codigo) {
      res.status(400).json({ message: 'descripcion, lat, lng y codigo son obligatorios' });
      return;
    }

    const existe = await em.findOne(Localidad, { descripcion: input.descripcion });
    if (existe) {
      res.status(409).json({ message: 'La localidad ya existe' });
      return;
    }

    const localidad = em.create(Localidad, input);
    await em.flush();
    res.status(201).json({ message: 'Localidad creada', data: localidad });
    return;
  } catch (error: any) {
    console.error('Error al crear la localidad:', error);
    if (error?.code === 'ER_DUP_ENTRY' || /unique/i.test(error?.message || '')) {
      res.status(409).json({ message: 'La localidad ya existe (constraint)' });
      return;
    }
    res.status(500).json({ message: 'Error al crear la localidad', error: error?.message });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const localidadToUpdate = await em.findOneOrFail(Localidad, { id });
    em.assign(localidadToUpdate, req.body.sanitizedInput);
    await em.flush();
    res
      .status(200)
      .json({ message: 'Localidad actualizada', data: localidadToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar la localidad' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const localidadToRemove = await em.findOneOrFail(Localidad, { id });
    em.remove(localidadToRemove);
    await em.flush();
    res.status(200).json({ message: 'Localidad eliminada' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar la localidad' });
  }
}

export { sanitizeLocalidadInput, findAll, findOne, add, update, remove };
