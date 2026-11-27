'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Pet } from '@/lib/pet-types'

type Row = Pet & { type: string }

function toCsv(rows: Row[]) {
  const header = ['Type', 'Code', 'Name', 'Born year', 'Color', 'Health status', 'Breed', 'Pedigree']
  const escape = (v: unknown) => `"${String(v).replaceAll('"', '""')}"`
  const lines = rows.map((r) =>
    [r.type, r.code, r.name, r.bornYear, r.color, r.healthStatus, r.breed, r.type === 'Dog' ? (r.pedigree ? 'Yes' : 'No') : '']
      .map(escape)
      .join(','),
  )
  return [header.join(','), ...lines].join('\n')
}

function download(filename: string, rows: Row[]) {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportButtons({ dogs, cats }: { dogs: Pet[]; cats: Pet[] }) {
  const dogRows = dogs.map((d) => ({ ...d, type: 'Dog' }))
  const catRows = cats.map((c) => ({ ...c, type: 'Cat' }))
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => download('pets.csv', [...dogRows, ...catRows])}>
        <Download aria-hidden="true" /> Export pets
      </Button>
      <Button variant="outline" size="sm" onClick={() => download('dogs.csv', dogRows)}>
        <Download aria-hidden="true" /> Export dogs
      </Button>
      <Button variant="outline" size="sm" onClick={() => download('cats.csv', catRows)}>
        <Download aria-hidden="true" /> Export cats
      </Button>
    </div>
  )
}
