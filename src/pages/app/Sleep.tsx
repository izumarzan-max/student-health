import { useState } from 'react';
import { Moon, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useSleepRecords } from '@/hooks/useRecords';
import { Card, StatCard, SectionHeader, EmptyState, TrendIndicator } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { SleepAreaChart } from '@/components/charts';
import { weekRange, monthRange, bucketByDay, fillSleep, avg, pctChange } from '@/lib/analytics';
import { minutesToHM, todayISO, formatDateFull } from '@/lib/utils';
import type { SleepRecord } from '@/types';

export default function SleepPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const month = monthRange(0);
  const { records, loading, reload } = useSleepRecords(month);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SleepRecord | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [start, setStart] = useState('23:00');
  const [end, setEnd] = useState('07:00');
  const [quality, setQuality] = useState(3);

  const computeDuration = (d: string, s: string, e: string) => {
    const st = new Date(`${d}T${s}:00`);
    let en = new Date(`${d}T${e}:00`);
    if (en <= st) en = new Date(en.getTime() + 86400000);
    return Math.round((en.getTime() - st.getTime()) / 60000);
  };

  const save = async () => {
    if (!user) return;
    const duration = computeDuration(date, start, end);
    if (duration <= 0) { toast('Ұйықтау және ояну уақытын тексеріңіз.', 'error'); return; }
    const payload = {
      user_id: user.id, sleep_date: date,
      start_time: new Date(`${date}T${start}:00`).toISOString(),
      end_time: new Date(`${date}T${end}:00`).toISOString(),
      duration_minutes: duration, quality, id: editing?.id,
    };
    const { error } = editing
      ? await supabase.from('sleep_records').update(payload).eq('id', editing.id)
      : await supabase.from('sleep_records').insert(payload);
    if (error) { toast('Ұйқы жазбасын сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast(editing ? 'Ұйқы жазбасы жаңартылды.' : 'Ұйқы жазбасы қосылды.', 'success');
    setOpen(false); setEditing(null); reload();
  };

  const del = async () => {
    if (!delId) return;
    await supabase.from('sleep_records').delete().eq('id', delId);
    toast('Ұйқы жазбасы өшірілді.', 'info');
    setDelId(null); reload();
  };

  const openAdd = () => { setEditing(null); setDate(todayISO()); setStart('23:00'); setEnd('07:00'); setQuality(3); setOpen(true); };
  const openEdit = (r: SleepRecord) => {
    setEditing(r); setDate(r.sleep_date);
    setStart(new Date(r.start_time).toTimeString().slice(0, 5));
    setEnd(new Date(r.end_time).toTimeString().slice(0, 5));
    setQuality(r.quality); setOpen(true);
  };

  // weekly analytics
  const thisWeek = weekRange(0);
  const prevWeek = weekRange(1);
  const buckets = bucketByDay(thisWeek);
  const prevBuckets = bucketByDay(prevWeek);
  const weekData = fillSleep(buckets, records.filter((r) => r.sleep_date >= thisWeek.from));
  const prevWeekData = fillSleep(prevBuckets, records.filter((r) => r.sleep_date >= prevWeek.from && r.sleep_date <= prevWeek.to));
  const weekAvg = avg(weekData.map((d) => d.sleep));
  const prevAvg = avg(prevWeekData.map((d) => d.sleep));
  const delta = pctChange(weekAvg, prevAvg);

  // monthly trend
  const monthBuckets = bucketByDay(month);
  const monthData = fillSleep(monthBuckets, records);
  const monthAvg = avg(monthData.map((d) => d.sleep));

  const recent = [...records].sort((a, b) => b.sleep_date.localeCompare(a.sleep_date)).slice(0, 7);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Ұйқы күнделігі</h1>
          <p className="text-sm text-ink-muted mt-1">Ұйқы ұзақтығы, апталық орташа және айлық өзгерістер.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus className="h-4 w-4" /> Ұйқыны қосу</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Moon className="h-5 w-5" />} label="Осы аптадағы орташа" value={weekAvg ? minutesToHM(Math.round(weekAvg)) : '—'} sub={<TrendIndicator delta={delta} />} />
        <StatCard icon={<Moon className="h-5 w-5" />} label="Өткен аптадағы орташа" value={prevAvg ? minutesToHM(Math.round(prevAvg)) : '—'} accent="blue" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Айырмашылық" value={weekAvg && prevAvg ? minutesToHM(Math.round(weekAvg - prevAvg)) : '—'} accent="amber" sub={weekAvg && prevAvg ? <TrendIndicator delta={delta} /> : undefined} />
        <StatCard icon={<Moon className="h-5 w-5" />} label="Айлық орташа" value={monthAvg ? minutesToHM(Math.round(monthAvg)) : '—'} />
      </div>

      <Card className="p-5">
        <SectionHeader title="Апталық ұйқы диаграммасы" subtitle="Осы апта · 8 сағаттық мақсат" />
        {weekData.some((d) => d.sleep !== undefined) ? (
          <SleepAreaChart data={weekData as any} xKey="label" yKey="sleep" height={280} />
        ) : (
          <EmptyState icon={<Moon className="h-6 w-6" />} title="Осы аптада ұйқы жазбасы жоқ" description="Апталық диаграмманы көру үшін алғашқы ұйқы жазбаңызды қосыңыз." action={<button className="btn-primary" onClick={openAdd}>Ұйқыны қосу</button>} />
        )}
      </Card>

      <Card className="p-5">
        <SectionHeader title="Айлық өзгеріс" subtitle={month.from.slice(0, 7)} />
        {monthData.some((d) => d.sleep !== undefined) ? (
          <SleepAreaChart data={monthData.map((d) => ({ ...d, label: `${new Date(d.date + 'T00:00:00').getDate()}` })) as any} xKey="label" yKey="sleep" height={240} />
        ) : (
          <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="Осы айда ұйқы жазбасы жоқ" description="Жазбалар қосылғаннан кейін айлық өзгеріс осында көрінеді." />
        )}
      </Card>

      <Card className="p-5">
        <SectionHeader title="Соңғы жазбалар" subtitle="Соңғы 7 жазба" />
        {recent.length ? (
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-cream/40 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary-light text-primary-dark flex items-center justify-center"><Moon className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{minutesToHM(r.duration_minutes)}</p>
                    <p className="text-xs text-ink-muted">{formatDateFull(r.sleep_date)} · Сапасы {r.quality}/5</p>
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
          <EmptyState icon={<Moon className="h-6 w-6" />} title="Әзірге ұйқы жазбасы жоқ" description="Белгілеген ұйқыңыз осында көрсетіледі." action={<button className="btn-primary" onClick={openAdd}>Ұйқыны қосу</button>} />
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Ұйқы жазбасын өңдеу' : 'Ұйқы жазбасын қосу'} footer={<><button className="btn-ghost" onClick={() => setOpen(false)}>Болдырмау</button><button className="btn-primary" onClick={save}>Сақтау</button></>}>
        <div className="space-y-4">
          <div><label className="label">Күні</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="label">Ұйықтаған уақыт</label><input type="time" className="input" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div><label className="label">Оянған уақыт</label><input type="time" className="input" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
          </div>
          <div>
            <label className="label">Ұйқы сапасы: {quality}/5</label>
            <input type="range" min={1} max={5} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full accent-primary" />
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={del} title="Ұйқы жазбасын өшіресіз бе?" message="Бұл жазба біржола өшіріледі." />
    </div>
  );
}
