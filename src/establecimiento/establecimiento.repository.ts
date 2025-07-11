import { Repository } from '../shared/repository.js'
import { Establecimiento } from './establecimiento.entity.js'

const establecimientos = [
  new Establecimiento(
    "Club Belgrano",
    "Pellegrini 476",
    "San Nicolas de los Arroyos",
    "a02b91bc-3769-4221-beb1-d7a3aeba7dad"
  ),
]

export class EstablecimientoRepository implements Repository<Establecimiento> {
  public findAll(): Establecimiento[] | undefined {
    return establecimientos
  }

  public findOne(item: { id: string }): Establecimiento | undefined {
    return establecimientos.find((establecimiento) => establecimiento.id === item.id)
  }

  public add(item: Establecimiento): Establecimiento | undefined {
    establecimientos.push(item)
    return item
  }

  public update(item: Establecimiento): Establecimiento | undefined {
    const establecimientoIdx = establecimientos.findIndex((establecimiento) => establecimiento.id === item.id)

    if (establecimientoIdx !== -1) {
      establecimientos[establecimientoIdx] = { ...establecimientos[establecimientoIdx], ...item }
    }
    return establecimientos[establecimientoIdx]
  }

  public delete(item: { id: string }): Establecimiento | undefined {
    const establecimientoIdx = establecimientos.findIndex((establecimiento) => establecimiento.id === item.id)

    if (establecimientoIdx !== -1) {
      const deletedEstablecimiento = establecimientos[establecimientoIdx]
      establecimientos.splice(establecimientoIdx, 1)
      return deletedEstablecimiento
    }
  }
}