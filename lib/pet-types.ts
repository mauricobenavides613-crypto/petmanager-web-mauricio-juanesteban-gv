export type AnimalType = 'Dog' | 'Cat'

export const HEALTH_STATUSES = ['Healthy', 'Sick', 'In Surgery'] as const

export type Pet = {
  petId: number
  code: string
  name: string
  bornYear: number
  color: string
  healthStatus: string
  breed: string
  pedigree: boolean
}

export type PetInput = Omit<Pet, 'petId'>

export type HealthCount = { status: string; count: number }

export type ActionResult = { ok: true; message: string; pet?: Pet } | { ok: false; message: string }
