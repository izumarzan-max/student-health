import { useState } from 'react';
import { BarChart3, Moon, Droplets, Activity, Smile, TrendingUp } from 'lucide-react';
import { useSleepRecords, useWaterRecords, useActivityRecords, useMoodRecords } from '@/hooks/useRecords';
import { Card, SectionHeader, EmptyState, TrendIndicator } from '@/components/ui';
import { SleepAreaChart, WaterBarChart, ActivityBarChart, MoodLineChart } from '@/components/charts';
import { weekRange, monthRange, bucketByDay, fillSleep, fillWater, fillActivity, fillMood, avg, sumDefined, pctChange } from '@/lib/analytics';
import { minutesToHM } from '@/lib/utils';

type Period = 'week' | 'month';

export default function Analytics() {
  const [period, setPeriod] = useState<Period>('week');

  const range = period === 'week' ? weekRange(0) : monthRange(0);
  const prevRange = period === 'week' ? weekRange(1) : monthRange(1);
  const combined = { from: prevRange.from, to: range.to };

  const { records: sleepAll } = useSleepRecords(combined);
  const { records: waterAll } = useWaterRecords(combined);
  const { records: activityAll } = useActivityRecords(combined);
  const { records: moodAll } = useMoodRecords(combined);

  const buckets = bucketByDay(range);
  const prevBuckets = bucketByDay(prevRange);

  const sleepData = fillSleep(buckets, sleepAll.filter((r) => r.sleep_date >= range.from));
  const prevSleepData = fillSleep(prevBuckets, sleepAll.filter((r) => r.sleep_date >= prevRange.from && r.sleep_date <= prevRange.to));
  const waterData = fillWater(buckets, waterAll.filter((r) => r.log_date >= range.from));
  const prevWaterData = fillWater(prevBuckets, waterAll.filter((r) => r.log_date >= prevRange.from && r.log_date <= prevRange.to));
  const activityData = fillActivity(buckets, activityAll.filter((r) => r.activity_date >= range.from));
  const prevActivityData = fillActivity(prevBuckets, activityAll.filter((r) => r.activity_date >= prevRange.from && r.activity_date <= prevRange.to));
  const moodData = fillMood(buckets, moodAll.filter((r) => r.mood_date >= range.from));
  const prevMoodData = fillMood(prevBuckets, moodAll.filter((r) => r.mood_date >= prevRange.from && r.mood_date <= prevRange.to));

  const sleepAvg = avg(sleepData.map((d) => d.sleep));
  const prevSleepAvg = avg(prevSleepData.map((d) => d.sleep));
  const waterAvg = avg(waterData.map((d) => d.water));
  const prevWaterAvg = avg(prevWaterData.map((d) => d.water));
  const activityAvg = avg(activityData.map((d) => d.activity));
  const prevActivityAvg = avg(prevActivityData.map((d) => d.activity));
  const activityTotal = sumDefined(activityData.map((d) => d.activity));
  const prevActivityTotal = sumDefined(prevActivityData.map((d) => d.activity));
  const moodAvg = avg(moodData.map((d) => d.mood));
  const prevMoodAvg = avg(prevMoodData.map((d) => d.mood));

  const hasAny = sleepData.some((d) => d.sleep !== undefined) || waterData.some((d) => d.water !== undefined) || activityData.some((d) => d.activity !== undefined) || moodData.some((d) => d.mood !== undefined);

  const labelFor = (d: any) => period === 'week' ? d.label : `${new Date(d.date + 'T00:00:00').getDate()}`;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Талдау</h1>
          <p className="text-sm text-ink-muted mt-1">Жазбаларыңыз негізінде ағымдағы және алдыңғы кезеңдерді салыстырыңыз.</p>
        </div>
        <div className="inline-flex rounded-xl bg-white border border-line p-1">
          {(['week', 'month'] as Period[]).map((p) => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition ${period === p ? 'bg-primary-dark text-white' : 'text-ink-muted hover:text-ink'}`}>
              {p === 'week' ? 'Осы апта' : 'Осы ай'}
            </button>
          ))}
        </div>
      </div>

      {!hasAny ? (
        <Card className="p-6">
          <EmptyState
            icon={<BarChart3 className="h-6 w-6" />}
            title={`${period === 'week' ? 'Осы аптада' : 'Осы айда'} жазба жоқ`}
            description="Талдау сақталған жазбаларыңыз бойынша жасалады. Ұйқы, су ішу, белсенділік немесе көңіл күйді белгілесеңіз, статистика осында көрінеді."
          />
        </Card>
      ) : (
        <>
          {/* Comparison summary */}
          <Card className="p-5">
            <SectionHeader title={`${period === 'week' ? 'Апталық' : 'Айлық'} салыстыру`} subtitle={`${range.from} → ${range.to} · алдыңғы кезеңмен салыстыру`} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <CompCard icon={<Moon className="h-4 w-4" />} label="Орташа ұйқы" current={sleepAvg} previous={prevSleepAvg} fmt={(v) => minutesToHM(Math.round(v))} />
              <CompCard icon={<Droplets className="h-4 w-4" />} label="Орташа су мөлшері" current={waterAvg} previous={prevWaterAvg} fmt={(v) => `${Math.round(v)} мл`} />
              <CompCard icon={<Activity className="h-4 w-4" />} label="Орташа белсенділік" current={activityAvg} previous={prevActivityAvg} fmt={(v) => `${Math.round(v)} мин`} />
              <CompCard icon={<Smile className="h-4 w-4" />} label="Орташа көңіл күй" current={moodAvg} previous={prevMoodAvg} fmt={(v) => v?.toFixed(1) ?? '—'} />
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
              <CompCard icon={<Moon className="h-4 w-4" />} label="Ұйқы жазбалары" current={sleepData.filter((d) => d.sleep !== undefined).length} previous={prevSleepData.filter((d) => d.sleep !== undefined).length} fmt={(v) => `${v}`} deltaless />
              <CompCard icon={<Droplets className="h-4 w-4" />} label="Су ішу жазбалары" current={waterData.filter((d) => d.water !== undefined).length} previous={prevWaterData.filter((d) => d.water !== undefined).length} fmt={(v) => `${v}`} deltaless />
              <CompCard icon={<Activity className="h-4 w-4" />} label="Жалпы белсенділік" current={activityTotal} previous={prevActivityTotal} fmt={(v) => `${v} мин`} />
              <CompCard icon={<Smile className="h-4 w-4" />} label="Көңіл күй жазбалары" current={moodData.filter((d) => d.mood !== undefined).length} previous={prevMoodData.filter((d) => d.mood !== undefined).length} fmt={(v) => `${v}`} deltaless />
            </div>
          </Card>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-5">
            <Card className="p-5">
              <SectionHeader title="Ұйқы өзгерісі" subtitle={period === 'week' ? 'Осы апта' : 'Осы ай'} />
              {sleepData.some((d) => d.sleep !== undefined)
                ? <SleepAreaChart data={sleepData.map((d) => ({ ...d, label: labelFor(d) })) as any} xKey="label" yKey="sleep" height={240} />
                : <EmptyState icon={<Moon className="h-6 w-6" />} title="Ұйқы деректері жоқ" />}
            </Card>
            <Card className="p-5">
              <SectionHeader title="Су ішу өзгерісі" subtitle={period === 'week' ? 'Осы апта' : 'Осы ай'} />
              {waterData.some((d) => d.water !== undefined)
                ? <WaterBarChart data={waterData.map((d) => ({ ...d, label: labelFor(d) })) as any} xKey="label" yKey="water" height={240} />
                : <EmptyState icon={<Droplets className="h-6 w-6" />} title="Су ішу деректері жоқ" />}
            </Card>
            <Card className="p-5">
              <SectionHeader title="Белсенділік өзгерісі" subtitle={period === 'week' ? 'Осы апта' : 'Осы ай'} />
              {activityData.some((d) => d.activity !== undefined)
                ? <ActivityBarChart data={activityData.map((d) => ({ ...d, label: labelFor(d) })) as any} xKey="label" yKey="activity" height={240} />
                : <EmptyState icon={<Activity className="h-6 w-6" />} title="Белсенділік деректері жоқ" />}
            </Card>
            <Card className="p-5">
              <SectionHeader title="Көңіл күй өзгерісі" subtitle={period === 'week' ? 'Осы апта' : 'Осы ай'} />
              {moodData.some((d) => d.mood !== undefined)
                ? <MoodLineChart data={moodData.map((d) => ({ ...d, label: labelFor(d) })) as any} xKey="label" yKey="mood" height={240} />
                : <EmptyState icon={<Smile className="h-6 w-6" />} title="Көңіл күй деректері жоқ" />}
            </Card>
          </div>

          {/* Trend indicators summary */}
          <Card className="p-5">
            <SectionHeader title="Өзгеріс көрсеткіштері" subtitle="Алдыңғы кезеңмен салыстыру" />
            <div className="space-y-1">
              <TrendRow label="Ұйқы ұзақтығы" delta={pctChange(sleepAvg, prevSleepAvg)} />
              <TrendRow label="Ішкен су мөлшері" delta={pctChange(waterAvg, prevWaterAvg)} />
              <TrendRow label="Белсенділік уақыты" delta={pctChange(activityAvg, prevActivityAvg)} />
              <TrendRow label="Көңіл күй деңгейі" delta={pctChange(moodAvg, prevMoodAvg)} />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function CompCard({ icon, label, current, previous, fmt, deltaless }: { icon: React.ReactNode; label: string; current: number | null; previous: number | null; fmt: (v: number) => string; deltaless?: boolean }) {
  const delta = !deltaless && current !== null && previous !== null && previous !== 0 ? ((current - previous) / previous) * 100 : null;
  return (
    <div className="rounded-xl border border-line bg-cream/30 p-4">
      <div className="flex items-center gap-2 text-ink-muted">
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <p className="font-display text-xl font-bold text-ink mt-1.5">{current === null ? '—' : fmt(current)}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-[11px] text-ink-muted">алдыңғысы: {previous === null ? '—' : fmt(previous)}</span>
        {deltaless ? null : <TrendIndicator delta={delta} />}
      </div>
    </div>
  );
}

function TrendRow({ label, delta }: { label: string; delta: number | null }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-line last:border-0">
      <span className="text-sm font-medium text-ink flex items-center gap-2"><TrendingUp className="h-4 w-4 text-ink-muted" /> {label}</span>
      <TrendIndicator delta={delta} />
    </div>
  );
}
