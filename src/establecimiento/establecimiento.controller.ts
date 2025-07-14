import { Request, Response, NextFunction } from 'express'
import { Establecimiento } from './establecimiento.entity.js'
import { orm } from '../shared/db/orm.js' 

const em = orm.em;

function sanitizeEstablecimientoInput(req: Request, res: Response, next: NextFunction) {
    req.body.sanitizedInput = {
    nombre: req.body.nombre,
    direccion: req.body.direccion,
    localidad: req.body.localidad,
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
      const establecimientos = await em.find(Establecimiento, {})
      res.status(200).json({ message: 'Establecimientos encontrados satisfactoriamente', data: establecimientos })
    }catch (error: any) {
      res.status(500).json({ message: 'Error al recuperar los establecimientos'})
    }
}

async function findOne(req: Request, res: Response) {
 try{
const id = Number.parseInt(req.params.id)
const establecimiento = await em.findOneOrFail(Establecimiento, {id})
res.status(200).json({ message: 'Establecimiento encontrado', data: establecimiento })  
 }catch (error: any) {
    res.status(500).json({ message: 'Establecimiento no encontrado'})
}}

async function add(req: Request, res: Response) {
 try{
  const establecimiento = em.create(Establecimiento, req.body.sanitizedInput)
  await em.flush()
  res.status(201).json({ message: 'Establecimiento creado', data: establecimiento })
 }catch (error: any) {
    res.status(500).json({ message: 'Error al crear el establecimiento'})
  }
}

async function update(req: Request, res: Response) {
 try{
  const id = Number.parseInt(req.params.id)
  const establecimientoToUpdate= await em.findOneOrFail(Establecimiento, { id })
  em.assign(establecimientoToUpdate, req.body.sanitizedInput)
  await em.flush()
  res.status(200).json({ message: 'Establecimiento actualizado', data: establecimientoToUpdate })
 } catch (error: any) {
    res.status(500).json({ message: 'Error al actualizar el establecimiento' })
  }
}

async function remove(req: Request, res: Response) {
    try{
  const id = Number.parseInt(req.params.id)
  const establecimientoToRemove = await em.findOneOrFail(Establecimiento, { id })
  em.remove(establecimientoToRemove)
  await em.flush()
  res.status(200).json({ message: 'Establecimiento eliminado' })
 } catch (error: any) {
    res.status(500).json({ message: 'Error al eliminar el establecimiento' })
    }
}

export { sanitizeEstablecimientoInput, findAll, findOne, add, update, remove }