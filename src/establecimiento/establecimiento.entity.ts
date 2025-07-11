import crypto from 'node:crypto';

export class Establecimiento{
  constructor(
    public nombre : string,
    public direccion : string,
    public localidad : string,
    public id = crypto.randomUUID()
  ){}
}