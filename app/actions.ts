'use server'

import { revalidatePath } from 'next/cache'
import { getDb } from '@/lib/db'
import { childTable, listPets } from '@/lib/pets'
import { HEALTH_STATUSES, type ActionResult, type AnimalType, type PetInput } from '@/lib/pet-types'

function validate(type: AnimalType, input: PetInput): string | null {
  if (type !== 'Dog' && type !== 'Cat') return 'Invalid animal type'
  if (!input.code?.trim()) return 'Code is required'
  if (!input.name?.trim()) return 'Name is required'
  const year = Number(input.bornYear)
  const current = new Date().getFullYear()
  if (!Number.isInteger(year) || year < 1900 || year > current) return `Born year must be between 1900 and ${current}`
  if (!HEALTH_STATUSES.includes(input.healthStatus as (typeof HEALTH_STATUSES)[number])) return 'Invalid health status'
  if (input.code.length > 50 || input.name.length > 100 || input.color.length > 50 || input.breed.length > 100) {
    return 'One or more fields are too long'
  }
  return null
}

function clean(input: PetInput) {
  return {
    code: input.code.trim(),
    name: input.name.trim(),
    born_year: Number(input.bornYear),
    color: input.color.trim(),
    health_status: input.healthStatus,
  }
}

function childValues(type: AnimalType, input: PetInput) {
  return type === 'Dog' ? { breed: input.breed.trim(), pedigree: Boolean(input.pedigree) } : { breed: input.breed.trim() }
}

async function findPetId(code: string) {
  const { data, error } = await getDb().from('tb_pet').select('id').eq('code', code.trim()).maybeSingle()
  if (error) throw new Error(error.message)
  return data?.id as number | undefined
}

export async function createPet(type: AnimalType, input: PetInput): Promise<ActionResult> {
  const invalid = validate(type, input)
  if (invalid) return { ok: false, message: invalid }
  try {
    if (await findPetId(input.code)) return { ok: false, message: `A pet with code "${input.code}" already exists` }
    const db = getDb()
    const { data: pet, error } = await db.from('tb_pet').insert(clean(input)).select('id').single()
    if (error) return { ok: false, message: error.message }

    const { error: childError } = await db.from(childTable(type)).insert({ ...childValues(type, input), id_pet: pet.id })
    if (childError) {
      await db.from('tb_pet').delete().eq('id', pet.id)
      return { ok: false, message: childError.message }
    }
    revalidatePath('/')
    return { ok: true, message: `${type} "${input.name}" saved` }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}

export async function searchPet(type: AnimalType, code: string): Promise<ActionResult> {
  if (!code?.trim()) return { ok: false, message: 'Enter a code to search' }
  try {
    const pet = (await listPets(type)).find((p) => p.code === code.trim())
    if (!pet) return { ok: false, message: `No ${type.toLowerCase()} found with code "${code}"` }
    return { ok: true, message: `${type} found`, pet }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}

export async function editPet(type: AnimalType, input: PetInput): Promise<ActionResult> {
  const invalid = validate(type, input)
  if (invalid) return { ok: false, message: invalid }
  try {
    const petId = await findPetId(input.code)
    if (!petId) return { ok: false, message: `No pet found with code "${input.code}"` }
    const db = getDb()
    const { error } = await db.from('tb_pet').update(clean(input)).eq('id', petId)
    if (error) return { ok: false, message: error.message }
    const { error: childError } = await db.from(childTable(type)).update(childValues(type, input)).eq('id_pet', petId)
    if (childError) return { ok: false, message: childError.message }
    revalidatePath('/')
    return { ok: true, message: `${type} "${input.name}" updated` }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}

export async function deletePet(type: AnimalType, code: string): Promise<ActionResult> {
  try {
    const petId = await findPetId(code)
    if (!petId) return { ok: false, message: `No pet found with code "${code}"` }
    const db = getDb()
    for (const table of [childTable(type), 'tb_pet_hospital']) {
      const { error } = await db.from(table).delete().eq('id_pet', petId)
      if (error) return { ok: false, message: error.message }
    }
    const { error } = await db.from('tb_pet').delete().eq('id', petId)
    if (error) return { ok: false, message: error.message }
    revalidatePath('/')
    return { ok: true, message: `${type} deleted` }
  } catch (e) {
    return { ok: false, message: (e as Error).message }
  }
}
