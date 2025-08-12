import { Request, Response, NextFunction } from 'express';
import { Usuario } from './usuario.entity.js';
import { Participante } from './participante.entity.js';
import { Administrador } from './administrador.entity.js';
import { orm } from '../shared/db/orm.js';

const em = orm.em;

function sanitizeUsuarioInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    apellido: req.body.apellido,
    usuario: req.body.usuario,
    contraseña: req.body.contraseña,
    email: req.body.email,
    id: req.body.id,
    esAdmin: req.body.esAdmin !== undefined ? req.body.esAdmin : false,
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
    const usuarios = await em.find(Usuario, {});
    res
      .status(200)
      .json({
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
    const usuario = await em.findOneOrFail(Usuario, { id });
    res.status(200).json({ message: 'Usuario encontrado', data: usuario });
  } catch (error: any) {
    res.status(500).json({ message: 'Usuario no encontrado' });
  }
}

async function add(req: Request, res: Response) {
  let usuario;
  try {
    if (req.body.sanitizedInput.esAdmin) {
      usuario = em.create(Administrador, req.body.sanitizedInput);
    } else {
      usuario = em.create(Participante, req.body.sanitizedInput);
    }
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

export { sanitizeUsuarioInput, findAll, findOne, add, update, remove };
