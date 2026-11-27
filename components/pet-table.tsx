'use client'

import { cn } from '@/lib/utils'
import type { AnimalType, Pet } from '@/lib/pet-types'

type Props = { type: AnimalType; pets: Pet[]; selectedId?: number; onSelect: (pet: Pet) => void }

export function PetTable({ type, pets, selectedId, onSelect }: Props) {
  return (
    <section aria-labelledby="list-title" className="rounded-xl border bg-card">
      <div className="border-b px-5 py-4">
        <h2 id="list-title" className="font-semibold">
          {type === 'Dog' ? 'Dogs' : 'Cats'} list
        </h2>
        <p className="text-sm text-muted-foreground">Select a row to load it into the form.</p>
      </div>
      {pets.length === 0 ? (
        <p className="px-5 py-10 text-center text-sm text-muted-foreground">No {type.toLowerCase()}s registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th className="px-5 py-2.5 font-medium">Code</th>
                <th className="px-3 py-2.5 font-medium">Name</th>
                <th className="px-3 py-2.5 font-medium">Born</th>
                <th className="px-3 py-2.5 font-medium">Color</th>
                <th className="px-3 py-2.5 font-medium">Breed</th>
                {type === 'Dog' && <th className="px-3 py-2.5 font-medium">Pedigree</th>}
                <th className="px-5 py-2.5 font-medium">Health</th>
              </tr>
            </thead>
            <tbody>
              {pets.map((p) => (
                <tr
                  key={p.petId}
                  tabIndex={0}
                  onClick={() => onSelect(p)}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(p))}
                  aria-selected={selectedId === p.petId}
                  className={cn(
                    'cursor-pointer border-t outline-none hover:bg-muted/60 focus-visible:bg-muted',
                    selectedId === p.petId && 'bg-muted',
                  )}
                >
                  <td className="px-5 py-3 font-mono text-xs">{p.code}</td>
                  <td className="px-3 py-3 font-medium">{p.name}</td>
                  <td className="px-3 py-3">{p.bornYear}</td>
                  <td className="px-3 py-3">{p.color}</td>
                  <td className="px-3 py-3">{p.breed}</td>
                  {type === 'Dog' && <td className="px-3 py-3">{p.pedigree ? 'Yes' : 'No'}</td>}
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        p.healthStatus === 'Sick' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
                      )}
                    >
                      {p.healthStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
