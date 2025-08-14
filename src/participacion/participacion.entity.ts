import {
  Entity,
  Property,
  ManyToMany,
  Cascade,
  ManyToOne,
  Rel,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Partido } from '../evento/partido.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';
@Entity()
export class Participacion extends BaseEntity {
  @Property({ nullable: false })
  puntos!: number;
  @Property({ nullable: false })
  minutosjugados!: number;
  @Property({ nullable: false })
  faltas!: number;
  @ManyToOne(() => Partido, { nullable: true })
  partido!: Rel<Partido>;
  @ManyToOne(() => Usuario, { nullable: true })
  usuario?: Rel<Usuario>;
}
