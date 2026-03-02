import { Request, Response, NextFunction, request } from 'express';
import { Usuario } from './usuario.entity.js';
import { orm } from '../shared/db/orm.js';
import { FilterQuery, PopulateHint } from '@mikro-orm/core';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { config } from '../shared/config.js';

const em = orm.em;

// El safe de las cookies hay que cambiarlo a true en produccion, esta en false para desarrollo

function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    usuario: req.body.usuario,
    contraseña: req.body.contraseña,
    email: req.body.email,
    role: req.body.role ? req.body.role : 'Usuario',
    id: req.body.id,
    estado: req.body.estado,
    equipos: req.body.equipos ? req.body.equipos : [],
    participations: req.body.participations,
    fechaNacimiento:
      req.body.fechaNacimiento !== undefined ? req.body.fechaNacimiento : null,
    ultimoLogin:
      req.body.ultimoLogin !== undefined ? req.body.ultimoLogin : null,
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
    const usuarios = await em.find(
      Usuario,
      {},
      { populate: ['equipos', 'mvps', 'maxAnotador', 'participations'] },
    );
    res.status(200).json({
      message: 'Usuarios encontrados satisfactoriamente',
      data: usuarios,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al recuperar los usuarios' });
  }
}

async function findOne(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuario = await em.findOneOrFail(
      Usuario,
      { id },
      { populate: ['equipos', 'mvps', 'maxAnotador', 'participations'] },
    );
    res.status(200).json({ message: 'Usuario encontrado', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: 'Usuario no encontrado' });
  }
}

async function findSome(req: Request, res: Response) {
  try {
    const filter: FilterQuery<Usuario> = {};

    const qrol = typeof req.query.rol === 'string' ? req.query.rol : undefined;
    if (qrol) {
      filter.role = qrol;
    }

    const estado =
      typeof req.query.estado === 'string' ? req.query.estado : undefined;
    let qestado;
    if (estado == 'Activo') {
      qestado = true;
    } else {
      qestado = false;
    }
    if (estado) {
      filter.estado = qestado;
    }

    const usuarios = await em.find(Usuario, filter);
    res.status(200).json({
      message: 'Usuarios encontrados satisfactoriamente',
      data: usuarios,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al recuperar los usuarios' });
  }
}

async function add(req: Request, res: Response) {
  let usuario;
  try {
    const input = req.body.sanitizedInput;

    // validar duplicados: usuario
    if (input.usuario) {
      const existsUser = await em.findOne(Usuario, { usuario: input.usuario });
      if (existsUser) {
        res.status(409).json({ message: 'Nombre de usuario no disponible' });
        return;
      }
    }

    // validar duplicados: email
    if (input.email) {
      const existsEmail = await em.findOne(Usuario, { email: input.email });
      if (existsEmail) {
        res.status(409).json({ message: 'El email ya está registrado' });
        return;
      }
    }

    usuario = em.create(Usuario, input);
    const hashedPassword = await bcrypt.hash(usuario.contraseña, 8);
    usuario.contraseña = hashedPassword;
    await em.flush();
    res.status(201).json({ message: 'Usuario creado', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
}

async function update(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const input = req.body.sanitizedInput;

    if (input.usuario) {
      const existsUser = await em.findOne(Usuario, {
        usuario: input.usuario,
        id: { $ne: id },
      });
      if (existsUser) {
        res.status(409).json({ message: 'Nombre de usuario no disponible' });
        return;
      }
    }

    if (input.email) {
      const existsEmail = await em.findOne(Usuario, {
        email: input.email,
        id: { $ne: id },
      });
      if (existsEmail) {
        res.status(409).json({ message: 'El email ya está registrado' });
        return;
      }
    }

    const usuarioToUpdate = await em.findOneOrFail(Usuario, { id });
    em.assign(usuarioToUpdate, input);
    await em.flush();
    res
      .status(200)
      .json({ message: 'Usuario actualizado', data: usuarioToUpdate });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const id = Number.parseInt(req.params.id);
    const usuarioToRemove = await em.findOneOrFail(Usuario, { id });
    em.remove(usuarioToRemove);
    await em.flush();
    res.status(200).json({ message: 'Usuario eliminado' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
}

async function loginUsuario(req: Request, res: Response) {
  const { usuario, contraseña, remember } = req.body;
  const userRepo = em.getRepository(Usuario);
  try {
    const user = await userRepo.findOneOrFail({ usuario });
    if (!user) {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      return;
    }
    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
      return;
    }
    // Armamos el payload con los datos mínimos
    const payload = {
      id: user.id,
      usuario: user.usuario,
      email: user.email,
      role: user.role,
      ip: req.ip,
    };

    // Creamos los token
    const token = jsonwebtoken.sign(payload, config.JWT.SECRET, { expiresIn: '1h' });
    if (remember) {
      const recuerdame = jsonwebtoken.sign(payload, config.JWT.SECRET, {
        expiresIn: '7d',
      });
      res.cookie('recuerdame', recuerdame, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      }); // 7 días
    }

    // Respondemos con el token y el payload
    res.json({
      token,
      role: payload.role,
      id: payload.id,
      usuario: payload.usuario,
      email: user.email,
      estado: user.estado,
    });

    // Registrar último acceso
    user.ultimoLogin = new Date();
    await em.flush();
  } catch (error) {
    res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
  }
}
async function restaurarUsuario(req: Request, res: Response) {
  const { recuerdame } = req.cookies;
  if (!recuerdame) {
    return res.status(401).json({ message: 'No autorizado' });
  }
  try {
    const decoded = jsonwebtoken.verify(recuerdame, config.JWT.SECRET);
    if (
      typeof decoded === 'object' &&
      'ip' in decoded &&
      decoded.ip == req.ip && // Verificamos que la IP coincida
      decoded !== null &&
      'id' in decoded &&
      'usuario' in decoded &&
      'email' in decoded &&
      'role' in decoded
    ) {
      const payload = {
        id: decoded.id,
        usuario: decoded.usuario,
        email: decoded.email,
        role: decoded.role,
        ip: req.ip,
      };
      const token = jsonwebtoken.sign(payload, config.JWT.SECRET, { expiresIn: '1h' });
      res.cookie('recuerdame', recuerdame, {
        httpOnly: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      const u = await em.findOne(Usuario, { id: payload.id });
      if (u) {
        u.ultimoLogin = new Date();
        await em.flush();
      }

      return res.json({
        token,
        role: payload.role,
        id: payload.id,
        usuario: payload.usuario,
        email: payload.email,
      });
    } else {
      res.status(401).json({ message: 'Token inválido' });
    }
  } catch {
    res.status(401).json({ message: 'Token inválido' });
  }
}

function logoutUsuario(req: Request, res: Response) {
  try {
    res.clearCookie('recuerdame', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    res.status(500).json({ message: 'Error al hacer logout' });
  }
}

async function bajaUsuario(req: Request, res: Response) {
  try {
    const idRaw = (req.query.id ?? req.params.id ?? req.body.id) as
      | string
      | number
      | undefined;
    const id = idRaw !== undefined ? Number.parseInt(String(idRaw), 10) : NaN;

    if (!Number.isInteger(id) || Number.isNaN(id)) {
      res.status(400).json({ message: 'Id inválido' });
      return;
    }

    const usuarioToBaja = await em.findOne(Usuario, { id });
    if (!usuarioToBaja) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }

    // toggle estado
    usuarioToBaja.estado = !Boolean(usuarioToBaja.estado);
    await em.flush();
    res.status(200).json({
      message:
        usuarioToBaja.estado === false
          ? 'Usuario dado de baja'
          : 'Usuario reactivado',
      data: usuarioToBaja,
    });
    return;
  } catch (error: any) {
    console.error('Error al dar de baja el usuario:', error);
    res.status(500).json({
      message: 'Error al dar de baja el usuario',
      error: error?.message ?? String(error),
    });
    return;
  }
}

async function perfilUsuario(req: Request, res: Response) {
  try {
    const requester = parseInt(req.params.id);
    const usuario = await em.findOne(Usuario, { id: requester });
    if (!usuario) {
      res.status(404).json({ message: 'Usuario no encontrado' });
      return;
    }
    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      usuario: usuario.usuario,
      email: usuario.email,
      fechaNacimiento: usuario.fechaNacimiento,
      role: usuario.role,
      estado: usuario.estado,
    };
    res.status(200).json({ message: 'Perfil de usuario', data: payload });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error al obtener el perfil del usuario' + error });
  }
}

async function findParticipantesEvento(req: Request, res: Response) {
  try {
    const idEventoRaw = req.query.eventoId as string;
    const eventoId = Number.parseInt(idEventoRaw);
    const usuarios = await em.find(
      Usuario,
      {
        equipos: {
          evento: eventoId,
        },
      },
      {
        populate: ['equipos', 'participations.partido'],
        populateWhere: {
          equipos: {
            evento: eventoId,
          },
          participations: {
            partido: {
              evento: eventoId,
            },
          },
        },
      },
    );

    res.status(200).json({
      message: 'Usuarios retrieved successfully',
      data: usuarios,
    });
  } catch (error: any) {
    console.error('Error in findParticipantesEvento:', error);
    res.status(500).json({ message: error.message });
  }
}

export {
  sanitizeUsuarioInput,
  findAll,
  findSome,
  bajaUsuario,
  findOne,
  add,
  update,
  remove,
  loginUsuario,
  logoutUsuario,
  restaurarUsuario,
  perfilUsuario,
  findParticipantesEvento,
};
