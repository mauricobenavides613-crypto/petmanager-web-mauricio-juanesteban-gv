import { PawPrint } from 'lucide-react'
import { healthReport, listPets } from '@/lib/pets'
import { PetManager } from '@/components/pet-manager'
import { HealthReport } from '@/components/health-report'
import { ExportButtons } from '@/components/export-buttons'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [dogs, cats, report] = await Promise.all([listPets('Dog'), listPets('Cat'), healthReport()])

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <PawPrint className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Pet Manager</h1>
              <p className="text-sm text-muted-foreground">Register, search, edit and delete dogs and cats</p>
            </div>
          </div>
          <ExportButtons dogs={dogs} cats={cats} />
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
        <div className="min-w-0 flex-1">
          <PetManager dogs={dogs} cats={cats} />
        </div>
        <aside className="lg:w-80">
          <HealthReport report={report} />
        </aside>
      </main>
    </div>
  )
}
