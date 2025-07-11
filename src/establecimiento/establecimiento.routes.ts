import { Router } from 'express'
import { sanitizeEstablecimientoInput, findAll, findOne, add, update, remove } from './establecimiento.controller.js'

export const establecimientoRouter = Router()

establecimientoRouter.get('/', findAll)

establecimientoRouter.get('/:id', findOne)
establecimientoRouter.post('/', sanitizeEstablecimientoInput, add)
establecimientoRouter.put('/:id', sanitizeEstablecimientoInput, update)
establecimientoRouter.patch('/:id', sanitizeEstablecimientoInput, update)
establecimientoRouter.delete('/:id', remove)