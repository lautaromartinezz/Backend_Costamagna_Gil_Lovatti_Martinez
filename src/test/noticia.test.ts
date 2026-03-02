import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const { findMock, findOneOrFailMock } = vi.hoisted(() => {
	return {
		findMock: vi.fn(),
		findOneOrFailMock: vi.fn(),
	};
});

vi.mock('../shared/db/orm.js', () => ({
	orm: {
		em: {
			find: findMock,
			findOneOrFail: findOneOrFailMock,
		},
	},
}));

import { Noticia } from '../noticia/noticia.entity.js';
import { findAll, findOne } from '../noticia/noticia.controller.js';

function createResponseMock() {
	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });
	return { status, json };
}

describe('Noticia controller', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('devuelve 200 y todas las noticias en findAll', async () => {
		const noticias = [{ id: 1, titulo: 'Noticia de ejemplo', descripcion: 'Descripción de ejemplo', fecha: new Date() }];
		findMock.mockResolvedValue(noticias);

		const req = { query: {} } as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await findAll(req, res);

		expect(findMock).toHaveBeenCalledTimes(1);
		expect(resMock.status).toHaveBeenCalledWith(200);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'Noticias retrieved successfully',
			data: noticias,
		});
	});

	it('devuelve 200 y la noticia cuando findOne lo encuentra', async () => {
		const noticia = { id: 7, titulo: 'Noticia de ejemplo' };
		findOneOrFailMock.mockResolvedValue(noticia);

		const req = { params: { id: '7' } } as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await findOne(req, res);

		expect(findOneOrFailMock).toHaveBeenCalledWith(
			Noticia,
			{ id: 7 },
		);
		expect(resMock.status).toHaveBeenCalledWith(200);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'found noticia',
			data: noticia,
		});
	});

	it('devuelve 404 cuando findOne no encuentra la noticia', async () => {
		findOneOrFailMock.mockRejectedValue(
			new Error('No Noticia entity found for query'),
		);

		const req = { params: { id: '9999' } } as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await findOne(req, res);

		expect(resMock.status).toHaveBeenCalledWith(404);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'Noticia no encontrada',
		});
	});
});
