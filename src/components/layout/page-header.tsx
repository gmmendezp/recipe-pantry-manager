type PageHeaderProps = {
  description?: string;
  eyebrow: string;
  title: string;
};

export function PageHeader({ description, eyebrow, title }: PageHeaderProps) {
  return (
    <header className="space-y-3">
      <p className="font-medium text-accent text-sm uppercase tracking-[0.25em]">
        {eyebrow}
      </p>
      <h1 className="font-bold text-4xl tracking-tight">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-muted">{description}</p>
      ) : null}
    </header>
  );
}
