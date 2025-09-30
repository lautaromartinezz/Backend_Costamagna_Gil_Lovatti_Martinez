import { Entity, Property, OneToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Evento } from '../evento/evento.entity.js';

@Entity()
export class Localidad extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  descripcion!: string;

  @OneToMany(() => Evento, (evento) => evento.localidad)
  eventos = new Collection<Evento>(this);
}
