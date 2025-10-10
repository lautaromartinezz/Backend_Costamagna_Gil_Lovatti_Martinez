import {
  Entity,
  ManyToOne,
  OneToMany,
  Property,
  Rel,
  Collection,
  Cascade,
  OneToOne,
} from '@mikro-orm/core';
import { BaseEntity } from '../shared/db/baseEntity.entity.js';
import { Deporte } from '../deporte/deporte.entity.js';
import { Partido } from './partido.entity.js';
import { Equipo } from '../equipo/equipo.entity.js';
import { Localidad } from '../localidad/localidad.entity.js';
import { Establecimiento } from '../establecimiento/establecimiento.entity.js';
import { Usuario } from '../usuario/usuario.entity.js';

@Entity()
export class Evento extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string;
  @Property({ nullable: false })
  descripcion!: string;
  @Property({ nullable: false })
  esPublico!: boolean;
  @Property({ nullable: true })
  contraseña?: string;
  @Property({ nullable: false })
  cantEquiposMax!: Number;
  @Property({ nullable: false })
  fechaInicioInscripcion!: Date;
  @Property({ nullable: false })
  fechaFinInscripcion!: Date;
  @Property({ nullable: true })
  fechaInicioEvento?: Date;
  @Property({ nullable: true })
  fechaFinEvento?: Date;

  @ManyToOne(() => Usuario, { nullable: true })
  creador!: Rel<Usuario>;

  @OneToMany(() => Equipo, (equipo) => equipo.evento, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  equipos? = new Collection<Equipo>(this);

  @ManyToOne(() => Deporte, { nullable: true })
  deporte!: Rel<Deporte>;

  @OneToMany(() => Partido, (partido) => partido.evento, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  partidos = new Collection<Partido>(this);

  @ManyToOne(() => Localidad, { nullable: false })
  localidad!: Rel<Localidad>;

  @OneToMany(
    () => Establecimiento,
    (establecimiento) => establecimiento.evento,
    {
      nullable: true,
      cascade: [Cascade.ALL],
    }
  )
  establecimientos = new Collection<Establecimiento>(this);
}
