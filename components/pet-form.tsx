'use client'

import { useState, useTransition } from 'react'
import { Pencil, RotateCcw, Save, Search, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createPet, deletePet, editPet, searchPet } from '@/app/actions'
import { HEALTH_STATUSES, type ActionResult, type AnimalType, type Pet, type PetInput } from '@/lib/pet-types'

const empty: PetInput = { code: '', name: '', bornYear: new Date().getFullYear(), color: '', healthStatus: 'Healthy', breed: '', pedigree: false }

const inputClass =
  'h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50'

type Props = { type: AnimalType; initial: Pet | null; onLoaded: (pet: Pet | null) => void }

export function PetForm({ type, initial, onLoaded }: Props) {
  const [form, setForm] = useState<PetInput>(initial ?? empty)
  const [status, setStatus] = useState<ActionResult | null>(null)
  const [pending, startTransition] = useTransition()

  const set = <K extends keyof PetInput>(key: K, value: PetInput[K]) => setForm((f) => ({ ...f, [key]: value }))

  const run = (action: () => Promise<ActionResult>, after?: (r: ActionResult) => void) =>
    startTransition(async () => {
      const result = await action()
      setStatus(result)
      if (result.ok) after?.(result)
    })

  const clear = () => {
    setForm(empty)
    setStatus(null)
    if (initial) onLoaded(null)
  }

  return (
    <section aria-labelledby="form-title" className="rounded-xl border bg-card p-5">
      <h2 id="form-title" className="font-semibold">
        {type} details
      </h2>
      <form
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        onSubmit={(e) => {
          e.preventDefault()
          run(() => createPet(type, form), () => setForm(empty))
        }}
      >
        <Field label="Code" id="code">
          <input id="code" required maxLength={50} className={inputClass} value={form.code} onChange={(e) => set('code', e.target.value)} />
        </Field>
        <Field label="Name" id="name">
          <input id="name" required maxLength={100} className={inputClass} value={form.name} onChange={(e) => set('name', e.target.value)} />
        </Field>
        <Field label="Born year" id="bornYear">
          <input
            id="bornYear"
            type="number"
            required
            min={1900}
            max={new Date().getFullYear()}
            className={inputClass}
            value={form.bornYear}
            onChange={(e) => set('bornYear', Number(e.target.value))}
          />
        </Field>
        <Field label="Color" id="color">
          <input id="color" maxLength={50} className={inputClass} value={form.color} onChange={(e) => set('color', e.target.value)} />
        </Field>
        <Field label="Health status" id="healthStatus">
          <select id="healthStatus" className={inputClass} value={form.healthStatus} onChange={(e) => set('healthStatus', e.target.value)}>
            {HEALTH_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="Breed" id="breed">
          <input id="breed" maxLength={100} className={inputClass} value={form.breed} onChange={(e) => set('breed', e.target.value)} />
        </Field>
        {type === 'Dog' && (
          <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2 lg:col-span-3">
            <input type="checkbox" className="size-4 accent-primary" checked={form.pedigree} onChange={(e) => set('pedigree', e.target.checked)} />
            Pedigree
          </label>
        )}

        <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-3">
          <Button type="submit" disabled={pending}>
            <Save aria-hidden="true" /> Save
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => run(() => searchPet(type, form.code), (r) => r.ok && r.pet && setForm(r.pet))}
          >
            <Search aria-hidden="true" /> Search
          </Button>
          <Button type="button" variant="secondary" disabled={pending} onClick={() => run(() => editPet(type, form))}>
            <Pencil aria-hidden="true" /> Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={pending || !form.code}
            onClick={() => {
              if (confirm(`Delete ${type.toLowerCase()} with code "${form.code}"?`)) run(() => deletePet(type, form.code), () => setForm(empty))
            }}
          >
            <Trash2 aria-hidden="true" /> Delete
          </Button>
          <Button type="button" variant="ghost" disabled={pending} onClick={clear}>
            <RotateCcw aria-hidden="true" /> Clear
          </Button>
        </div>
      </form>

      <p role="status" aria-live="polite" className={cn('mt-4 min-h-5 text-sm', status?.ok ? 'text-primary' : 'text-destructive')}>
        {pending ? 'Working...' : status?.message}
      </p>
    </section>
  )
}

function Field({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  )
}
