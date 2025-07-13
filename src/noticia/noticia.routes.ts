import { Router } from 'express'
import { sanitizeNoticiaInput, findAll, findOne, add, update, remove } from './noticia.controller.js'

export const noticiaRouter = Router()

noticiaRouter.get('/', findAll)

noticiaRouter.get('/:id', findOne)
noticiaRouter.post('/', sanitizeNoticiaInput, add)
noticiaRouter.put('/:id', sanitizeNoticiaInput, update)
noticiaRouter.patch('/:id', sanitizeNoticiaInput, update)
noticiaRouter.delete('/:id', remove)