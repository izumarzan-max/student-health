import { useState } from 'react';
import { Activity, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useActivityRecords } from '@/hooks/useRecords';
import { Card, StatCard, SectionHeader, EmptyState, TrendIndicator } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { ActivityBarChart } from '@/components/charts';
import { weekRange, monthRange, bucketByDay, fillActivity, avg, pctChange, sumDefined } from '@/lib/analytics';
import { todayISO, formatDateFull, activityTypeLabel, intensityLabel } from '@/lib/utils';
import type { ActivityRecord } from '@/types';

const TYPES = ['Жаяу жүру', 'Жүгіру', 'Велосипед тебу', 'Жүзу', 'Йога', 'Жаттығу залы', 'Би', 'Футбол', 'Баскетбол', 'Басқа'];

export default function ActivityPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const month = monthRange(0);
  const { records, reload } = useActivityRecords(month);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityRecord | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState('Жаяу жүру');
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState('moderate');

  const save = async () => {
    if (!user) return;
    const dur = parseInt(duration);
    if (!dur || dur <= 0) { toast('Ұзақтықты дұрыс енгізіңіз.', 'error'); return; }
    const payload = { user_id: user.id, activity_date: date, activity_type: type, duration_minutes: dur, intensity, id: editing?.id };
    const { error } = editing
      ? await supabase.from('activity_records').update(payload).eq('id', editing.id)
      : await supabase.from('activity_records').insert(payload);
    if (error) { toast('Белсенділік жазбасын сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast(editing ? 'Белсенділік жаңартылды.' : 'Белсенділік қосылды.', 'success');
    setOpen(false); setEditing(null); reload();
  };

  const del = async () => {
    if (!delId) return;
    await supabase.from('activity_records').delete().eq('id', delId);
    toast('Белсенділік жазбасы өшірілді.', 'info');
    setDelId(null); reload();
  };

  const openAdd = () => { setEditing(null); setDate(todayISO()); setType('Жаяу жүру'); setDuration('30'); setIntensity('moderate'); setOpen(true); };
  const openEdit = (r: ActivityRecord) => { setEditing(r); setDate(r.activity_date); setType(r.activity_type); setDuration(String(r.duration_minutes)); setIntensity(r.intensity || 'moderate'); setOpen(true); };

  // weekly
  const thisWeek = weekRange(0);
  const prevWeek = weekRange(1);
  const weekData = fillActivity(bucketByDay(thisWeek), records.filter((r) => r.activity_date >= thisWeek.from));
  const prevWeekData = fillActivity(bucketByDay(prevWeek), records.filter((r) => r.activity_date >= prevWeek.from && r.activity_date <= prevWeek.to));
  const weekAvg = avg(weekData.map((d) => d.activity));
  const prevAvg = avg(prevWeekData.map((d) => d.activity));
  const delta = pctChange(weekAvg, prevAvg);
  const weekTotal = sumDefined(weekData.map((d) => d.activity));

  // monthly
  const monthData = fillActivity(bucketByDay(month), records);

  // breakdown by type
  const byType = new Map<string, number>();
  records.forEach((r) => byType.set(r.activity_type, (byType.get(r.activity_type) || 0) + r.duration_minutes));
  const breakdown = [...byType.entries()].sort((a, b) => b[1] - a[1]);
  const maxType = breakdown[0]?.[1] || 1;

  const recent = [...records].sort((a, b) => b.activity_date.localeCompare(a.activity_date)).slice(0, 8);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Дене белсенділігі</h1>
          <p className="text-sm text-ink-muted mt-1">Қозғалыс, апталық қорытынды және айлық өзгерістерді бақылаңыз.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus className="h-4 w-4" /> Белсенділік қосу</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Activity className="h-5 w-5" />} label="Апталық орташа" value={weekAvg ? `${Math.round(weekAvg)}` : '—'} unit="мин" sub={<TrendIndicator delta={delta} />} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Өткен аптадағы орташа" value={prevAvg ? `${Math.round(prevAvg)}` : '—'} unit="мин" accent="blue" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Айырмашылық" value={weekAvg && prevAvg ? `${Math.round(weekAvg - prevAvg)}` : '—'} unit="мин" accent="amber" sub={<TrendIndicator delta={delta} />} />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Апта жиыны" value={weekTotal} unit="мин" />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <Card className="p-5 lg:col-span-2">
          <SectionHeader title="Апталық белсенділік диаграммасы" subtitle="Күн сайынғы минут саны" />
          {weekData.some((d) => d.activity !== undefined) ? (
            <ActivityBarChart data={weekData as any} xKey="label" yKey="activity" height={280} />
          ) : (
            <EmptyState icon={<Activity className="h-6 w-6" />} title="Осы аптада белсенділік жазбасы жоқ" description="Жаттығу, серуен немесе кез келген қозғалысты белгілеңіз." action={<button className="btn-primary" onClick={openAdd}>Белсенділік қосу</button>} />
          )}
        </Card>
        <Card className="p-5">
          <SectionHeader title="Түрлері бойынша" subtitle="Осы ай" />
          {breakdown.length ? (
            <div className="space-y-3">
              {breakdown.slice(0, 6).map(([t, mins]) => (
                <div key={t}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ink font-medium">{t}</span>
                    <span className="text-ink-muted">{mins}m</span>
                  </div>
                  <div className="h-2 rounded-full bg-primary-light overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(mins / maxType) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon={<Activity className="h-6 w-6" />} title="Әзірге белсенділік жоқ" />
          )}
        </Card>
      </div>

      <Card className="p-5">
        <SectionHeader title="Айлық өзгеріс" subtitle={month.from.slice(0, 7)} />
        {monthData.some((d) => d.activity !== undefined) ? (
          <ActivityBarChart data={monthData.map((d) => ({ ...d, label: `${new Date(d.date + 'T00:00:00').getDate()}` })) as any} xKey="label" yKey="activity" height={220} />
        ) : (
          <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="Осы айда белсенділік жазбасы жоқ" />
        )}
      </Card>

      <Card className="p-5">
        <SectionHeader title="Соңғы жазбалар" subtitle="Соңғы 8 жазба" />
        {recent.length ? (
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-cream/40 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary-light text-primary-dark flex items-center justify-center"><Activity className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{activityTypeLabel(r.activity_type)} · {r.duration_minutes} мин</p>
                    <p className="text-xs text-ink-muted">{formatDateFull(r.activity_date)} · {intensityLabel(r.intensity)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(r)} className="p-1.5 text-ink-muted hover:text-primary-dark"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDelId(r.id)} className="p-1.5 text-ink-muted hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Activity className="h-6 w-6" />} title="Белсенділік жазбасы жоқ" action={<button className="btn-primary" onClick={openAdd}>Белсенділік қосу</button>} />
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Белсенділікті өңдеу' : 'Белсенділік қосу'} footer={<><button className="btn-ghost" onClick={() => setOpen(false)}>Болдырмау</button><button className="btn-primary" onClick={save}>Сақтау</button></>}>
        <div className="space-y-4">
          <div><label className="label">Күні</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div><label className="label">Белсенділік түрі</label><select className="input" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Ұзақтығы (мин)</label><input type="number" className="input" value={duration} onChange={(e) => setDuration(e.target.value)} /></div>
            <div><label className="label">Қарқындылығы</label><select className="input" value={intensity} onChange={(e) => setIntensity(e.target.value)}><option value="light">Жеңіл</option><option value="moderate">Орташа</option><option value="high">Жоғары</option></select></div>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={del} title="Белсенділік жазбасын өшіресіз бе?" message="Бұл жазба жойылады." />
    </div>
  );
}
