import type { HealthCount } from '@/lib/pet-types'

export function HealthReport({ report }: { report: HealthCount[] }) {
  const total = report.reduce((sum, r) => sum + r.count, 0)
  return (
    <section aria-labelledby="health-title" className="rounded-xl border bg-card p-5">
      <h2 id="health-title" className="font-semibold">
        Health status
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Generated from the health-status records in the database.</p>

      {total === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No pets registered yet.</p>
      ) : (
        <ul className="mt-5 flex flex-col gap-4">
          {report.map((r) => {
            const pct = Math.round((r.count / total) * 100)
            return (
              <li key={r.status} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{r.status}</span>
                  <span className="text-muted-foreground">
                    {r.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
                  <div
                    className={r.status === 'Sick' ? 'h-full rounded-full bg-destructive' : 'h-full rounded-full bg-primary'}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}
      <p className="mt-5 border-t pt-4 text-sm">
        Total pets: <span className="font-semibold">{total}</span>
      </p>
    </section>
  )
}
