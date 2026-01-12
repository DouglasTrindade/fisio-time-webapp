const PulseCard = ({ lines = 3 }: { lines?: number }) => (
  <div className="rounded-xl border bg-card p-5 shadow-sm">
    <div className="space-y-2 text-sm text-muted-foreground">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={`pulse-line-${index}`}
          className="h-3 w-full animate-pulse rounded-full bg-muted/60"
        />
      ))}
    </div>
  </div>
)

const SectionHeading = ({ title }: { title: string }) => (
  <div className="space-y-2">
    <p className="text-lg font-semibold text-muted-foreground">{title}</p>
    <p className="text-sm text-muted-foreground/80 animate-pulse">Carregando...</p>
  </div>
)

export const DashboardPageSkeleton = () => (
  <section className="space-y-6">
    <SectionHeading title="Carregando painel" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <PulseCard key={`dashboard-card-${index}`} lines={3} />
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <PulseCard key={`dashboard-panel-${index}`} lines={6} />
      ))}
    </div>
  </section>
)

export const RecordsPageSkeleton = () => (
  <section className="space-y-6">
    <SectionHeading title="Carregando registros" />
    <div className="flex flex-wrap gap-2 text-muted-foreground text-sm">
      Aplicando filtros...
    </div>
    <PulseCard lines={10} />
  </section>
)

export const CalendarPageSkeleton = () => (
  <section className="space-y-6">
    <SectionHeading title="Carregando calendário" />
    <PulseCard lines={4} />
    <PulseCard lines={6} />
  </section>
)

export const ReportPageSkeleton = () => (
  <section className="space-y-6">
    <SectionHeading title="Carregando relatório" />
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <PulseCard key={`report-card-${index}`} lines={4} />
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <PulseCard lines={8} />
      <PulseCard lines={8} />
      <PulseCard lines={8} />
    </div>
  </section>
)
