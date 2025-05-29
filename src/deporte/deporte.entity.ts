import crypto from 'node:crypto';

export class Deporte{
  constructor(
    public nombre : string,
    public cantMinJugadores : number,
    public cantMaxJugadores : number,
    public duracion: number,
    public id = crypto.randomUUID()
  ){}
}