import 'server-only'
import { getDb } from './db'
import type { AnimalType, HealthCount, Pet } from './pet-types'

type PetRow = {
  id: number
  code: string
  name: string
  born_year: number
  color: string
  health_status: string
}

type ChildRow = { id: number; breed: string; id_pet: number; pedigree?: boolean }

export function childTable(type: AnimalType) {
  return type === 'Dog' ? 'tb_dog' : 'tb_cat'
}

export async function listPets(type: AnimalType): Promise<Pet[]> {
  const db = getDb()
  const columns = type === 'Dog' ? 'id, breed, pedigree, id_pet' : 'id, breed, id_pet'
  const { data: children, error } = await db.from(childTable(type)).select(columns).order('id')
  if (error) throw new Error(error.message)

  const rows = (children ?? []) as unknown as ChildRow[]
  if (rows.length === 0) return []

  const { data: pets, error: petError } = await db
    .from('tb_pet')
    .select('id, code, name, born_year, color, health_status')
    .in(
      'id',
      rows.map((r) => r.id_pet),
    )
  if (petError) throw new Error(petError.message)

  const byId = new Map((pets as PetRow[]).map((p) => [p.id, p]))
  return rows.flatMap((child) => {
    const pet = byId.get(child.id_pet)
    if (!pet) return []
    return [
      {
        petId: pet.id,
        code: pet.code,
        name: pet.name,
        bornYear: pet.born_year,
        color: pet.color,
        healthStatus: pet.health_status,
        breed: child.breed,
        pedigree: Boolean(child.pedigree),
      },
    ]
  })
}

export async function healthReport(): Promise<HealthCount[]> {
  const { data, error } = await getDb().from('tb_pet').select('health_status')
  if (error) throw new Error(error.message)
  const counts = new Map<string, number>()
  for (const row of data as { health_status: string }[]) {
    counts.set(row.health_status, (counts.get(row.health_status) ?? 0) + 1)
  }
  return [...counts.entries()].map(([status, count]) => ({ status, count }))
}
