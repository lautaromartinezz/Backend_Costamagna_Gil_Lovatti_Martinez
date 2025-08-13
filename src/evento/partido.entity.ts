import { Entity, ManyToOne, Property, Rel } from "@mikro-orm/core";
import { BaseEntity } from "../shared/db/baseEntity.entity.js";
import { Evento } from "./evento.entity.js";
import { Establecimiento } from "../establecimiento/establecimiento.entity.js";

@Entity()
export class Partido extends BaseEntity {
  @Property({ nullable: false })
  fecha!: Date;
  @Property({ nullable: true })
  hora?: string
  @Property({ nullable: true })
  juez?: string
  @Property({ nullable: true })
  resultado?: string

  //cambiar la relacion cuando se implemente la entidad Equipo y Participante
  @Property({ nullable: true })
  equipoLocal?: string
  @Property({ nullable: true })
  equipoVisitante?: string
  @Property({ nullable: true })
  mvp?: string // jugador más valioso
  @Property({ nullable: true })
  maxAnotador?: string

  @ManyToOne(() => Evento, { nullable: false })
  evento!: Rel<Evento>;

  @ManyToOne(() => Establecimiento, { nullable: true })
  establecimiento?: Rel<Establecimiento>;
}