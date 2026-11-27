'use client'

import { useState } from 'react'
import { Cat, Dog } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AnimalType, Pet } from '@/lib/pet-types'
import { PetForm } from './pet-form'
import { PetTable } from './pet-table'

export function PetManager({ dogs, cats }: { dogs: Pet[]; cats: Pet[] }) {
  const [type, setType] = useState<AnimalType>('Dog')
  const [selected, setSelected] = useState<Pet | null>(null)
  const pets = type === 'Dog' ? dogs : cats

  const tabs = [
    { value: 'Dog' as const, label: 'Dog Manager', icon: Dog, count: dogs.length },
    { value: 'Cat' as const, label: 'Cat Manager', icon: Cat, count: cats.length },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div role="tablist" aria-label="Animal type" className="inline-flex w-fit gap-1 rounded-lg border bg-background p-1">
        {tabs.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={type === t.value}
            onClick={() => {
              setType(t.value)
              setSelected(null)
            }}
            className={cn(
              'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              type === t.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted',
            )}
          >
            <t.icon className="size-4" aria-hidden="true" />
            {t.label}
            <span className="rounded-full bg-background/20 px-1.5 text-xs">{t.count}</span>
          </button>
        ))}
      </div>

      <PetForm key={`${type}-${selected?.petId ?? 'new'}`} type={type} initial={selected} onLoaded={setSelected} />
      <PetTable type={type} pets={pets} onSelect={setSelected} selectedId={selected?.petId} />
    </div>
  )
}
