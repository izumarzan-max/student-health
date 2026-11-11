import { Link } from 'react-router-dom';
import { Moon, Droplets, Activity, Smile, ArrowRight, TrendingUp, Sparkles, BookOpen, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTodaySleep, useTodayWater, useTodayActivity, useTodayMood } from '@/hooks/useToday';
import { useSleepRecords, useWaterRecords, useActivityRecords, useMoodRecords } from '@/hooks/useRecords';
import { Card, StatCard, SectionHeader, EmptyState, PageLoader, TrendIndicator } from '@/components/ui';
import { SleepAreaChart } from '@/components/charts';
import { MoodIcon } from '@/components/mood';
import { formatLongDate, minutesToHM, todayISO, startOfWeek, dateISO } from '@/lib/utils';
import { weekRange, bucketByDay, fillSleep, fillWater, fillActivity, fillMood, avg, sumDefined, countDefined } from '@/lib/analytics';

export default function Dashboard() {
  const { profile } = useAuth();
  const today = new Date();
  const todayStr = todayISO();

  const { record: sleepRecord } = useTodaySleep();
  const { total: waterTotal } = useTodayWater();
  const { total: activityTotal } = useTodayActivity();
  const { record: moodRecord } = useTodayMood();

  const week = weekRange(0);
  const prevWeek = weekRange(1);
  const combinedRange = { from: prevWeek.from, to: week.to };

  const { records: sleepAll } = useSleepRecords(combinedRange);
  const { records: waterAll } = useWaterRecords(combinedRange);
  const { records: activityAll } = useActivityRecords(combinedRange);
  const { records: moodAll } = useMoodRecords(combinedRange);

  const buckets = bucketByDay(week);
  const sleepData = fillSleep(buckets, sleepAll.filter((r) => r.sleep_date >= week.from));
  const waterData = fillWater(buckets, waterAll.filter((r) => r.log_date >= week.from));
  const activityData = fillActivity(buckets, activityAll.filter((r) => r.activity_date >= week.from));
  const moodData = fillMood(buckets, moodAll.filter((r) => r.mood_date >= week.from));

  // current week averages
  const sleepAvg = avg(sleepData.map((d) => d.sleep));
  const waterAvg = avg(waterData.map((d) => d.water));
  const activityAvg = avg(activityData.map((d) => d.activity));
  const moodAvg = avg(moodData.map((d) => d.mood));

  // previous week
  const prevBuckets = bucketByDay(prevWeek);
  const prevSleepAvg = avg(fillSleep(prevBuckets, sleepAll.filter((r) => r.sleep_date >= prevWeek.from && r.sleep_date <= prevWeek.to)).map((d) => d.sleep));
  const prevWaterAvg = avg(fillWater(prevBuckets, waterAll.filter((r) => r.log_date >= prevWeek.from && r.log_date <= prevWeek.to)).map((d) => d.water));
  const prevActivityAvg = avg(fillActivity(prevBuckets, activityAll.filter((r) => r.activity_date >= prevWeek.from && r.activity_date <= prevWeek.to)).map((d) => d.activity));
  const prevMoodAvg = avg(fillMood(prevBuckets, moodAll.filter((r) => r.mood_date >= prevWeek.from && r.mood_date <= prevWeek.to)).map((d) => d.mood));

  const firstName = (profile?.full_name || 'Студент').split(' ')[0];
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Қайырлы таң' : hour < 18 ? 'Қайырлы күн' : 'Қайырлы кеш';

  const weekHasData = sleepData.some((d) => d.sleep !== undefined) || waterData.some((d) => d.water !== undefined) || activityData.some((d) => d.activity !== undefined) || moodData.some((d) => d.mood !== undefined);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-ink-muted">{formatLongDate(today)}</p>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-ink mt-0.5">{greeting}, {firstName}.</h1>
        </div>
        <Link to="/app/tracker" className="btn-primary">
          <Plus className="h-4 w-4" /> Бүгінгі жазбаны қосу
        </Link>
      </div>

      {/* Today's summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Moon className="h-5 w-5" />}
          label="Кешегі ұйқы"
          value={sleepRecord ? minutesToHM(sleepRecord.duration_minutes) : '—'}
          sub={sleepRecord ? <span className="text-ink-muted">Сапасы {sleepRecord.quality}/5</span> : <Link to="/app/sleep" className="text-primary-dark hover:underline">Ұйқыны белгілеу</Link>}
        />
        <StatCard
          icon={<Droplets className="h-5 w-5" />}
          label="Бүгін ішкен су"
          value={waterTotal}
          unit="ml"
          accent="blue"
          sub={<Link to="/app/water" className="text-primary-dark hover:underline">{waterTotal > 0 ? 'Тағы қосу' : 'Су ішуді белгілеу'}</Link>}
        />
        <StatCard
          icon={<Activity className="h-5 w-5" />}
          label="Бүгінгі белсенділік"
          value={activityTotal}
          unit="min"
          sub={<Link to="/app/activity" className="text-primary-dark hover:underline">{activityTotal > 0 ? 'Тағы қосу' : 'Белсенділікті белгілеу'}</Link>}
        />
        <StatCard
          icon={moodRecord ? <MoodIcon level={moodRecord.mood_level} size={20} /> : <Smile className="h-5 w-5" />}
          label="Бүгінгі көңіл күй"
          value={moodRecord ? ['—', 'Өте төмен', 'Төмен', 'Қалыпты', 'Жақсы', 'Өте жақсы'][moodRecord.mood_level] : '—'}
          accent="rose"
          sub={<Link to="/app/mood" className="text-primary-dark hover:underline">{moodRecord ? 'Көңіл күйді өзгерту' : 'Көңіл күйді белгілеу'}</Link>}
        />
      </div>

      {/* Weekly chart + week averages */}
      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <SectionHeader
            title="Осы аптадағы көрсеткіштер"
            subtitle={weekHasData ? 'Күн сайынғы ұйқы ұзақтығы' : 'Апталық диаграмманы көру үшін жазба қосуды бастаңыз'}
            action={<Link to="/app/analytics" className="text-sm text-primary-dark font-semibold hover:underline flex items-center gap-1">Толық талдау <ArrowRight className="h-3.5 w-3.5" /></Link>}
          />
          {weekHasData ? (
            <SleepAreaChart data={sleepData as any} xKey="label" yKey="sleep" />
          ) : (
            <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="Бұл аптада әзірге жазба жоқ" description="Ұйқы, су ішу, белсенділік немесе көңіл күйді белгілесеңіз, апталық диаграмма осында көрінеді." action={<Link to="/app/tracker" className="btn-primary">Бүгінгі жазбаны қосу</Link>} />
          )}
        </Card>

        <Card className="p-5">
          <SectionHeader title="Апталық орташа көрсеткіш" subtitle="алдыңғы аптамен салыстыру" />
          <div className="space-y-1">
            <AvgRow label="Ұйқы" current={sleepAvg} previous={prevSleepAvg} format={(v) => minutesToHM(Math.round(v))} />
            <AvgRow label="Су ішу" current={waterAvg} previous={prevWaterAvg} format={(v) => `${Math.round(v)} ml`} />
            <AvgRow label="Белсенділік" current={activityAvg} previous={prevActivityAvg} format={(v) => `${Math.round(v)} min`} />
            <AvgRow label="Көңіл күй" current={moodAvg} previous={prevMoodAvg} format={(v) => v.toFixed(1)} />
          </div>
          <div className="mt-4 pt-4 border-t border-line grid grid-cols-2 gap-3 text-center">
            <div>
              <p className="font-display text-xl font-bold text-ink">{countDefined(sleepData.map((d) => d.sleep)) + countDefined(waterData.map((d) => d.water)) + countDefined(activityData.map((d) => d.activity)) + countDefined(moodData.map((d) => d.mood))}</p>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider">Осы аптадағы жазба</p>
            </div>
            <div>
              <p className="font-display text-xl font-bold text-ink">{sumDefined(activityData.map((d) => d.activity))}</p>
              <p className="text-[10px] text-ink-muted uppercase tracking-wider">Белсенділік (минут)</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { to: '/app/sleep', icon: Moon, label: 'Ұйқыны белгілеу' },
          { to: '/app/water', icon: Droplets, label: 'Су ішуді қосу' },
          { to: '/app/activity', icon: Activity, label: 'Белсенділікті қосу' },
          { to: '/app/mood', icon: Smile, label: 'Көңіл күйді белгілеу' },
        ].map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.to} to={q.to} className="card card-hover p-5 flex items-center gap-3 group">
              <div className="h-10 w-10 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </div>
              <span className="font-semibold text-ink text-sm flex-1">{q.label}</span>
              <ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-primary-dark transition" />
            </Link>
          );
        })}
      </div>

      {/* Explore */}
      <div className="grid md:grid-cols-2 gap-5">
        <Link to="/app/library" className="card card-hover p-6 flex items-start gap-4 group">
          <div className="h-12 w-12 rounded-xl bg-cream text-primary-dark flex items-center justify-center shrink-0">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink">Денсаулық кітапханасы</h3>
            <p className="text-sm text-ink-muted mt-1">Ұйқы, су ішу, тамақтану, күйзелісті басқару және басқа тақырыптардағы мақалаларды оқыңыз.</p>
          </div>
        </Link>
        <Link to="/app/assistant" className="card card-hover p-6 flex items-start gap-4 group">
          <div className="h-12 w-12 rounded-xl bg-cream text-primary-dark flex items-center justify-center shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink">Денсаулық көмекшісі</h3>
            <p className="text-sm text-ink-muted mt-1">Ұйқы, су ішу, тамақтану және апталық көрсеткіштер туралы жалпы сұрақ қойыңыз.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

function AvgRow({ label, current, previous, format }: { label: string; current: number | null; previous: number | null; format: (v: number) => string }) {
  const delta = current !== null && previous !== null && previous !== 0 ? ((current - previous) / previous) * 100 : null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-line last:border-0">
      <span className="text-sm text-ink font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-ink">{current === null ? '—' : format(current)}</span>
        <div className="w-16 text-right"><TrendIndicator delta={delta} /></div>
      </div>
    </div>
  );
}
