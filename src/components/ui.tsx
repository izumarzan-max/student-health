import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Card({ children, className, hover }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={cn('card', hover && 'card-hover', className)}>{children}</div>;
}

export function StatCard({
  icon,
  label,
  value,
  unit,
  sub,
  accent = 'primary',
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit?: string;
  sub?: ReactNode;
  accent?: 'primary' | 'blue' | 'amber' | 'rose';
}) {
  const accents = {
    primary: 'bg-primary-light text-primary-dark',
    blue: 'bg-blue-50 text-blue-700',
    amber: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
  };
  return (
    <Card hover className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-ink-muted font-medium">{label}</p>
          <p className="mt-1 font-display text-2xl font-bold text-ink">
            {value}
            {unit && <span className="ml-1 text-base font-semibold text-ink-muted">{unit}</span>}
          </p>
          {sub && <div className="mt-1 text-xs">{sub}</div>}
        </div>
        <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center shrink-0', accents[accent])}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">{title}</h2>
        {subtitle && <p className="text-sm text-ink-muted mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'bad' | 'warn' }) {
  const tones = {
    neutral: 'bg-primary-light text-primary-dark',
    good: 'bg-emerald-100 text-emerald-700',
    bad: 'bg-red-100 text-red-700',
    warn: 'bg-amber-100 text-amber-700',
  };
  return <span className={cn('chip', tones[tone])}>{children}</span>;
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6 animate-fadeIn">
      {icon && <div className="h-14 w-14 rounded-2xl bg-primary-light text-primary-dark flex items-center justify-center mb-4">{icon}</div>}
      <p className="font-display font-semibold text-ink">{title}</p>
      {description && <p className="text-sm text-ink-muted mt-1 max-w-md">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-primary-light border-t-primary"
      style={{ width: size, height: size }}
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <Spinner size={32} />
    </div>
  );
}

export function TrendIndicator({ delta, unit = '%', invert = false }: { delta: number | null; unit?: string; invert?: boolean }) {
  if (delta === null) {
    return <span className="text-xs text-ink-muted">Алдыңғы дерек жоқ</span>;
  }
  const up = delta > 0;
  const flat = Math.abs(delta) < 1;
  const good = flat ? true : invert ? !up : up;
  const color = flat ? 'text-ink-muted' : good ? 'text-emerald-600' : 'text-rose-600';
  const arrow = flat ? '→' : up ? '↑' : '↓';
  return (
    <span className={`text-xs font-semibold ${color}`}>
      {arrow} {Math.abs(delta).toFixed(1)}{unit}
    </span>
  );
}
