import {
  Entity,
  Property,
  Cascade,
  Collection,
  ManyToMany,
  ManyToOne,
  Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
import { Evento } from '../evento/evento.entity.js';

@Entity()
export class Equipo extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;

  @Property({ nullable: false })
  nombreCapitan!: string;

  @Property({ nullable: false })
  puntos!: number;

  @Property({ nullable: false })
  esPublico!: boolean;

  @Property({ nullable: false })
  contraseña!: string;

  @ManyToMany(() => Usuario)
  miembros = new Collection<Usuario>(this);

  @ManyToOne(() => Evento, { nullable: false })
  evento!: Rel<Evento>;
}
