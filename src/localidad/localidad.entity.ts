import { Entity, Property, OneToMany, Collection } from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Evento } from '../evento/evento.entity.js';

@Entity()
export class Localidad extends BaseEntity {
  @Property({ nullable: false, unique: true })
  descripcion!: string;

  @Property({ nullable: false })
  lat!: string;

  @Property({ nullable: false })
  lng!: string;

  @Property({ nullable: false })
  codigo!: string;


  @OneToMany(() => Evento, (evento) => evento.localidad)
  eventos = new Collection<Evento>(this);
}
