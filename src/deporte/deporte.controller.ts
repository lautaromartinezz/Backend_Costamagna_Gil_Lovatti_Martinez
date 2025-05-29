import { Request, Response, NextFunction } from 'express'
import { DeporteRepository } from './deporte.repository.js'
import { Deporte } from './deporte.entity.js'

const repository = new DeporteRepository()

function sanitizeDeporteInput(req: Request, res: Response, next: NextFunction) {
  req.body.sanitizedInput = {
    nombre: req.body.nombre,
    cantMinJugadores: req.body.cantMinJugadores,
    cantMaxJugadores: req.body.cantMaxJugadores,
    duracion: req.body.duracion,
    id: req.body.id,
  }
  //more checks here

  Object.keys(req.body.sanitizedInput).forEach((key) => {
    if (req.body.sanitizedInput[key] === undefined) {
      delete req.body.sanitizedInput[key]
    }
  })
  next()
}

function findAll(req: Request, res: Response) {
  res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  const id = req.params.id
  const deporte = repository.findOne({ id })
  if (!deporte) {
    res.status(404).send({ message: 'Deporte not found' })
    return
  }
  res.json({ data: deporte })
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const deporteInput = new Deporte(
    input.nombre,
    input.cantMinJugadores,
    input.cantMaxJugadores,
    input.duracion,
  )

  const deporte = repository.add(deporteInput)
  res.status(201).send({ message: 'Deporte created', data: deporte })
}

function update(req: Request, res: Response) {
  req.body.sanitizedInput.id = req.params.id
  const deporte = repository.update(req.body.sanitizedInput)

  if (!deporte) {
    res.status(404).send({ message: 'Deporte not found' })
    return
  }

  res.status(200).send({ message: 'Deporte updated successfully', data: deporte })
}

function remove(req: Request, res: Response) {
  const id = req.params.id
  const deporte = repository.delete({ id })

  if (!deporte) {
    res.status(404).send({ message: 'Deporte not found' })
    return
  }
  
  res.status(200).send({ message: 'Deporte deleted successfully' })
}

export { sanitizeDeporteInput, findAll, findOne, add, update, remove }