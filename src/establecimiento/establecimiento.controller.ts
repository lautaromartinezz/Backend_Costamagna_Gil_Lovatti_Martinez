import { Request, Response, NextFunction } from 'express'
import { Establecimiento } from './establecimiento.entity.js'
import { EstablecimientoRepository } from './establecimiento.repository.js'

const repository = new EstablecimientoRepository()

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

function findAll(req: Request, res: Response) {
    res.json({ data: repository.findAll() })
}

function findOne(req: Request, res: Response) {
  const id = req.params.id
  const establecimiento = repository.findOne({ id })
  if (!establecimiento) {
    res.status(404).send({ message: 'Establecimiento not found' })
    return
  }
  res.json({ data: establecimiento })
}

function add(req: Request, res: Response) {
  const input = req.body.sanitizedInput

  const establecimientoInput = new Establecimiento(
    input.nombre,
    input.direccion,
    input.localidad,
  )

  const establecimiento = repository.add(establecimientoInput)
  res.status(201).send({ message: 'Establecimiento created', data: establecimiento })
}

function update(req: Request, res: Response) {
    req.body.sanitizedInput.id = req.params.id
    const establecimiento = repository.update(req.body.sanitizedInput)
    
    if (!establecimiento) {
        res.status(404).send({ message: 'Establecimiento not found' })
        return
    }
    
    res.json({ message: 'Establecimiento updated', data: establecimiento })
    }

function remove(req: Request, res: Response) {
    const id = req.params.id
    const establecimiento = repository.delete({ id })
    
    if (!establecimiento) {
        res.status(404).send({ message: 'Establecimiento not found' })
        return
    }
    
    res.json({ message: 'Establecimiento removed', data: establecimiento })
}

export { sanitizeEstablecimientoInput, findAll, findOne, add, update, remove }