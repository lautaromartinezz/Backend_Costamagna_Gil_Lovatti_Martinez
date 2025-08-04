import { Request, Response, NextFunction } from 'express'
import { Equipo } from './equipo.entity.js'
import { orm } from '../shared/db/orm.js' 

const em = orm.em;

function sanitizeEquipoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
    nombre: req.body.nombre,
    nombreCapitan: req.body.nombreCapitan,
    puntos: req.body.puntos,
    esPublico: req.body.esPublico,
    contraseña: req.body.contraseña,
    id: req.body.id,
  }
    Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

async function findAll(req: Request, res: Response) {
    try{
      const equipo = await em.find(Equipo, {})
      res.status(200).json({ message: 'Equipos encontrados satisfactoriamente', data: equipo })
    }catch (error: any) {
      res.status(500).json({ message: 'Error al recuperar los equipos'})
    }
}

async function findOne(req: Request, res: Response) {
 try{
const id = Number.parseInt(req.params.id)
const equipo = await em.findOneOrFail(Equipo, {id})
res.status(200).json({ message: 'Equipo encontrado', data: equipo })  
 }catch (error: any) {
    res.status(500).json({ message: 'Equipo no encontrado'})
}}

async function add(req: Request, res: Response) {
 try{
  const equipo = em.create(Equipo, req.body.sanitizedInput)
  await em.flush()
  res.status(201).json({ message: 'Equipo creado', data: equipo })
 }catch (error: any) {
    res.status(500).json({ message: 'Error al crear el equipo'})
  }
}

async function update(req: Request, res: Response) {
 try{
  const id = Number.parseInt(req.params.id)
  const equipoToUpdate= await em.findOneOrFail(Equipo, { id })
  em.assign(equipoToUpdate, req.body.sanitizedInput)
  await em.flush()
  res.status(200).json({ message: 'Equipo actualizado', data: equipoToUpdate })
 } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el equipo' })
  }
}

async function remove(req: Request, res: Response) {
    try{
  const id = Number.parseInt(req.params.id)
  const equipoToRemove = await em.findOneOrFail(Equipo, { id })
  em.remove(equipoToRemove)
  await em.flush()
  res.status(200).json({ message: 'Equipo eliminado' })
 } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el equipo' })
    }
}

export { sanitizeEquipoInput, findAll, findOne, add, update, remove }