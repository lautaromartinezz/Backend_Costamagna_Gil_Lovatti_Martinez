import { Request, Response, NextFunction } from 'express';
import { Usuario } from './usuario.entity.js';
import { orm } from '../shared/db/orm.js';
import jsonwebtoken from 'jsonwebtoken';
import bcrypt from 'bcrypt';

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
    equipos: req.body.equipos ? req.body.equipos : [],
    participations: req.body.participations,
    fechaNacimiento:
      req.body.fechaNacimiento !== undefined ? req.body.fechaNacimiento : null,
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
      { populate: ['equipos', 'mvps', 'maxAnotador', 'participations'] }
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
      { populate: ['equipos', 'mvps', 'maxAnotador', 'participations'] }
    );
    res.status(200).json({ message: 'Usuario encontrado', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: 'Usuario no encontrado' });
  }
}

async function add(req: Request, res: Response) {
  let usuario;
  try {
    usuario = em.create(Usuario, req.body.sanitizedInput);
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
    const usuarioToUpdate = await em.findOneOrFail(Usuario, { id });
    em.assign(usuarioToUpdate, req.body.sanitizedInput);
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

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_para_dev'; // Lo ideal es usar process.env.JWT_SECRET, hay que setear la variable de entorno

async function loginUsuario(req: Request, res: Response) {
  const { usuario, contraseña, remember } = req.body;
  const userRepo = em.getRepository(Usuario);
  try {
    const user = await userRepo.findOneOrFail({ usuario});
    if (!user) {
      res.status(401).json({ message: "Usuario o contraseña incorrectos" });
      return;
    }
    const match = await bcrypt.compare(contraseña, user.contraseña);
    if (!match) {
      res.status(401).json({ message: "Usuario o contraseña incorrectos" });
      return;
    }
    // Armamos el payload con los datos mínimos
    const payload = {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      usuario: user.usuario,
      role: user.role,
      ip: req.ip
    };

    // Creamos los token
    const token = jsonwebtoken.sign(payload, JWT_SECRET, { expiresIn: '1s' });
    if (remember) {
      const recuerdame = jsonwebtoken.sign(payload, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('recuerdame', recuerdame, { httpOnly: true, secure: false, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 días
    }

    // Respondemos con el token y el payload
    res.json({ token, role: payload.role, id: payload.id, nombre: payload.nombre, apellido: payload.apellido, usuario: payload.usuario });
  } catch (error) {
    res.status(401).json({ message: "Usuario o contraseña incorrectos" });
  }
};
function restaurarUsuario(req: Request, res: Response) {
  const { recuerdame } = req.cookies;
  if (!recuerdame) {
    return res.status(401).json({ message: "No autorizado" });
  }
  try {
    const decoded = jsonwebtoken.verify(recuerdame, JWT_SECRET);
    if (
    typeof decoded === 'object' &&
    'ip' in decoded &&
    decoded.ip == req.ip && // Verificamos que la IP coincida
    decoded !== null &&
    'id' in decoded &&
    'nombre' in decoded &&
    'apellido' in decoded &&
    'usuario' in decoded &&
    'role' in decoded
    ) {
      const payload = {
        id: decoded.id,
        nombre: decoded.nombre,
        apellido: decoded.apellido,
        usuario: decoded.usuario,
        role: decoded.role,
        ip: req.ip
      };
      const token = jsonwebtoken.sign(payload, JWT_SECRET, { expiresIn: '15m' });
      res.cookie('recuerdame', recuerdame, { httpOnly: true, secure: false, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 }); // 7 días
      return res.json({ token, role: payload.role, id: payload.id, nombre: payload.nombre, apellido: payload.apellido, usuario: payload.usuario });
    } else {
      res.status(401).json({ message: "Token inválido" });
    }
  } catch {
    res.status(401).json({ message: "Token inválido" });
  }
}

function logoutUsuario(req: Request, res: Response) {
  try {
    res.clearCookie('recuerdame', { httpOnly: true, secure: false, sameSite: 'strict' });
    res.status(200).json({ message: 'Logout exitoso' });
  } catch (error) {
    res.status(500).json({ message: 'Error al hacer logout' });
  }
}

export { sanitizeUsuarioInput, findAll, findOne, add, update, remove, loginUsuario, logoutUsuario, restaurarUsuario };
