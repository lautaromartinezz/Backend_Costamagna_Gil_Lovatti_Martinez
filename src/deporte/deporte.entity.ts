import {
  Entity,
  Property,
  Cascade,
  OneToMany,
  Collection,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Evento } from '../evento/evento.entity.js';

@Entity()
export class Deporte extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  cantMinJugadores!: number;

  @Property({ nullable: false })
  cantMaxJugadores!: number;

  @Property({ nullable: false })
  duracion!: number;

  @OneToMany(() => Evento, (evento) => evento.deporte, {
    cascade: [Cascade.ALL],
  })
  eventos = new Collection<Evento>(this);
}
