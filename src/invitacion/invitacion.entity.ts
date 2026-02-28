import { Entity, Property, ManyToOne, Rel } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Equipo } from '../equipo/equipo.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';

export enum InvitacionEstado {
  PENDIENTE = 'pendiente',
  ACEPTADA = 'aceptada',
  EXPIRADA = 'expirada',
  CANCELADA = 'cancelada',
}

@Entity()
export class Invitacion extends BaseEntity {
  @Property({ nullable: false })
  emailInvitado!: string;

  @Property({ nullable: false })
  token!: string;

  @Property({ nullable: false })
  estado!: InvitacionEstado;

  @Property({ nullable: false })
  fechaExpiracion!: Date;

  @Property({ nullable: true })
  fechaAceptacion?: Date;

  @ManyToOne(() => Equipo, { nullable: false })
  equipo!: Rel<Equipo>;

  @ManyToOne(() => Usuario, { nullable: false })
  capitan!: Rel<Usuario>;
}
