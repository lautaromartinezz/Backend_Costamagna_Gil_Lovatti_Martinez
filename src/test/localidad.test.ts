import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

const {
	findMock,
	findOneOrFailMock,
	assignMock,
	flushMock,
	forkMock,
	forkFindOneMock,
	forkCreateMock,
	forkFlushMock,
} = vi.hoisted(() => {
	return {
		findMock: vi.fn(),
		findOneOrFailMock: vi.fn(),
		assignMock: vi.fn(),
		flushMock: vi.fn(),
		forkMock: vi.fn(),
		forkFindOneMock: vi.fn(),
		forkCreateMock: vi.fn(),
		forkFlushMock: vi.fn(),
	};
});

vi.mock('../shared/db/orm.js', () => ({
	orm: {
		em: {
			find: findMock,
			findOneOrFail: findOneOrFailMock,
			assign: assignMock,
			flush: flushMock,
			fork: forkMock,
		},
	},
}));

import { Localidad } from '../localidad/localidad.entity.js';
import { add, findAll, update } from '../localidad/localidad.controller.js';

function createResponseMock() {
	const json = vi.fn();
	const status = vi.fn().mockReturnValue({ json });
	return { status, json };
}

describe('Localidad controller', () => {
	beforeEach(() => {
		vi.clearAllMocks();

		forkMock.mockReturnValue({
			findOne: forkFindOneMock,
			create: forkCreateMock,
			flush: forkFlushMock,
		});
	});

	it('add crea localidad correctamente y devuelve 201', async () => {
		const input = {
			descripcion: 'Rosario',
			lat: '-32.95',
			lng: '-60.66',
			codigo: '2000',
		};
		const localidadCreada = { id: 1, ...input };

		forkFindOneMock.mockResolvedValue(null);
		forkCreateMock.mockReturnValue(localidadCreada);
		forkFlushMock.mockResolvedValue(undefined);

		const req = { body: { sanitizedInput: input } } as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await add(req, res);

		expect(forkFindOneMock).toHaveBeenCalledWith(Localidad, {
			descripcion: 'Rosario',
		});
		expect(forkCreateMock).toHaveBeenCalledWith(Localidad, input);
		expect(forkFlushMock).toHaveBeenCalledTimes(1);
		expect(resMock.status).toHaveBeenCalledWith(201);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'Localidad creada',
			data: localidadCreada,
		});
	});

	it('findAll devuelve 500 cuando falla la consulta', async () => {
		findMock.mockRejectedValue(new Error('DB down'));

		const req = {} as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await findAll(req, res);

		expect(findMock).toHaveBeenCalledWith(
			Localidad,
			{},
			{ populate: ['eventos'] },
		);
		expect(resMock.status).toHaveBeenCalledWith(500);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'Error al recuperar las localidades',
		});
	});

	it('update devuelve 500 cuando falla al buscar/actualizar', async () => {
		findOneOrFailMock.mockRejectedValue(new Error('No Localidad entity found'));

		const req = {
			params: { id: '10' },
			body: { sanitizedInput: { descripcion: 'Santa Fe' } },
		} as unknown as Request;
		const resMock = createResponseMock();
		const res = resMock as unknown as Response;

		await update(req, res);

		expect(findOneOrFailMock).toHaveBeenCalledWith(Localidad, { id: 10 });
		expect(assignMock).not.toHaveBeenCalled();
		expect(flushMock).not.toHaveBeenCalled();
		expect(resMock.status).toHaveBeenCalledWith(500);
		expect(resMock.json).toHaveBeenCalledWith({
			message: 'Error al actualizar la localidad',
		});
	});
});
