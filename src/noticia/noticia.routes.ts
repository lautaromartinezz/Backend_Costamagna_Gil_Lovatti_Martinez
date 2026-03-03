import { Router } from 'express'
import { sanitizeNoticiaInput, findAll, findOne, add, update, remove, findSome } from './noticia.controller.js'
import { authMiddleware, requireAdmin } from '../shared/authMiddleware.js'

export const noticiaRouter = Router()

noticiaRouter.get('/', findAll)
noticiaRouter.get('/filter', findSome)
noticiaRouter.get('/:id', findOne)
noticiaRouter.post('/', authMiddleware, requireAdmin, sanitizeNoticiaInput, add)
noticiaRouter.put('/:id', authMiddleware, requireAdmin, sanitizeNoticiaInput, update)
noticiaRouter.patch('/:id', authMiddleware, requireAdmin, sanitizeNoticiaInput, update)
noticiaRouter.delete('/:id', authMiddleware, requireAdmin, remove)