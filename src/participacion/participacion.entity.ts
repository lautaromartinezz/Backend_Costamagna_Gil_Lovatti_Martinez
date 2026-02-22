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
  @Property({ nullable: true })
  puntos!: number;
  @Property({ nullable: true })
  minutosjugados!: number;
  @Property({ nullable: true })
  faltas!: number;
  @ManyToOne(() => Partido, { nullable: true })
  partido!: Rel<Partido>;
  @ManyToOne(() => Usuario, { nullable: true })
  usuario?: Rel<Usuario>;

  constructor(
    usuario = new Usuario(),
    puntos = 0,
    minutosjugados = 0,
    faltas = 0,
  ) {
    super();
    this.usuario = usuario;
    this.puntos = puntos;
    this.minutosjugados = minutosjugados;
    this.faltas = faltas;
  }

  sumarParticipacion(p: Participacion) {
    this.puntos += p.puntos;
    this.minutosjugados += p.minutosjugados;
    this.faltas += p.faltas;
  }
}
