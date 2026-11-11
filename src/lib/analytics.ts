import type { SleepRecord, WaterRecord, ActivityRecord, MoodRecord } from '@/types';
import { dateISO, startOfWeek, daysAgo } from './utils';

export interface DayBucket {
  date: string;
  label: string;
  sleep?: number;
  water?: number;
  activity?: number;
  mood?: number;
}

export function weekRange(weeksBack = 0): { from: string; to: string } {
  const start = startOfWeek(daysAgo(7 * weeksBack));
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { from: dateISO(start), to: dateISO(end) };
}

export function monthRange(monthsBack = 0): { from: string; to: string } {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
  const from = dateISO(d);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
  return { from, to: dateISO(end) };
}

export function lastNDays(n: number): { from: string; to: string } {
  return { from: dateISO(daysAgo(n - 1)), to: dateISO(new Date()) };
}

function buildDays(from: string, to: string): string[] {
  const days: string[] = [];
  const start = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    days.push(dateISO(d));
  }
  return days;
}

export function bucketByDay(range: { from: string; to: string }): DayBucket[] {
  return buildDays(range.from, range.to).map((date) => {
    const d = new Date(date + 'T00:00:00');
    return { date, label: d.toLocaleDateString('kk-KZ', { weekday: 'short' }) };
  });
}

export function fillSleep(buckets: DayBucket[], records: SleepRecord[]): DayBucket[] {
  return buckets.map((b) => {
    const r = records.find((x) => x.sleep_date === b.date);
    return { ...b, sleep: r ? r.duration_minutes : undefined };
  });
}

export function fillWater(buckets: DayBucket[], records: WaterRecord[]): DayBucket[] {
  return buckets.map((b) => {
    const dayRecords = records.filter((r) => r.log_date === b.date);
    const total = dayRecords.reduce((s, r) => s + r.amount_ml, 0);
    return { ...b, water: total > 0 ? total : undefined };
  });
}

export function fillActivity(buckets: DayBucket[], records: ActivityRecord[]): DayBucket[] {
  return buckets.map((b) => {
    const dayRecords = records.filter((r) => r.activity_date === b.date);
    const total = dayRecords.reduce((s, r) => s + r.duration_minutes, 0);
    return { ...b, activity: total > 0 ? total : undefined };
  });
}

export function fillMood(buckets: DayBucket[], records: MoodRecord[]): DayBucket[] {
  return buckets.map((b) => {
    const r = records.find((x) => x.mood_date === b.date);
    return { ...b, mood: r ? r.mood_level : undefined };
  });
}

// Average of defined values only (missing data does NOT count as 0)
export function avg(values: (number | undefined)[]): number | null {
  const defined = values.filter((v): v is number => v !== undefined && v !== null);
  if (defined.length === 0) return null;
  return defined.reduce((s, v) => s + v, 0) / defined.length;
}

export function sumDefined(values: (number | undefined)[]): number {
  return values.filter((v): v is number => v !== undefined && v !== null).reduce((s, v) => s + v, 0);
}

export function countDefined(values: (number | undefined)[]): number {
  return values.filter((v): v is number => v !== undefined && v !== null).length;
}

export function pctChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}
