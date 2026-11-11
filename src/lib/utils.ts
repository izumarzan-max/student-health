export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('kk-KZ', { hour: '2-digit', minute: '2-digit' });
}

export function todayISO(): string {
  return dateISO(new Date());
}

export function dateISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function minutesToHM(min: number): string {
  if (min <= 0) return '0 мин';
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} сағ`;
  return `${h} сағ ${m} мин`;
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString('kk-KZ', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('kk-KZ', { month: 'short', day: 'numeric' });
}

export function formatDateFull(iso: string): string {
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('kk-KZ', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function startOfWeek(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function diffPct(current: number, previous: number): number | null {
  if (previous === 0 || !isFinite(previous)) return null;
  return ((current - previous) / previous) * 100;
}

export function trendArrow(delta: number | null): 'up' | 'down' | 'flat' {
  if (delta === null || Math.abs(delta) < 1) return 'flat';
  return delta > 0 ? 'up' : 'down';
}

export function activityTypeLabel(value: string): string {
  const labels: Record<string, string> = {
    Walking: 'Жаяу жүру', Running: 'Жүгіру', Cycling: 'Велосипед тебу', Swimming: 'Жүзу',
    Yoga: 'Йога', Gym: 'Жаттығу залы', Dance: 'Би', Football: 'Футбол', Basketball: 'Баскетбол', Other: 'Басқа',
  };
  return labels[value] || value;
}

export function intensityLabel(value: string | null): string {
  if (value === 'light') return 'Жеңіл';
  if (value === 'moderate') return 'Орташа';
  if (value === 'high') return 'Жоғары';
  return value || '—';
}
