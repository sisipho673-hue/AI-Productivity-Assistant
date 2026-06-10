export function PageHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="h-12 w-12 rounded-xl bg-[var(--gradient-primary)] text-primary-foreground grid place-items-center shadow-[var(--shadow-elegant)]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
    </div>
  );
}