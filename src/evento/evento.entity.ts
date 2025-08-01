import { Entity, ManyToOne, OneToMany, Property, Rel, Collection, Cascade } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Deporte } from "../deporte/deporte.entity.js";
import { Partido } from "./partido.entity.js";


@Entity()
export class Evento extends BaseEntity {
  @Property({ nullable: false })
  nombre!: string
  @Property({ nullable: false })
  esPublico!: boolean
  @Property({ nullable: true })
  contraseña ?: string
  @Property({ nullable: false })
  cantEquiposMax !: Number
  @Property({ nullable: false })
  fechaInicioInscripcion !: Date
  @Property({ nullable: false })
  fechaFinInscripcion !: Date
  @Property({ nullable: true })
  fechaInicioEvento ?: Date
  @Property({ nullable: true })
  fechaFinEvento ?: Date

  @ManyToOne(() => Deporte, { nullable: true })
  deporte!: Rel<Deporte>;

  @OneToMany(() => Partido, (partido) => partido.evento, {
    nullable: true,
    cascade: [Cascade.ALL],
  })
  partidos = new Collection<Partido>(this);
}