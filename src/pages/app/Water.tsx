import { useState } from 'react';
import { Droplets, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useWaterRecords } from '@/hooks/useRecords';
import { Card, StatCard, SectionHeader, EmptyState, TrendIndicator } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { WaterBarChart } from '@/components/charts';
import { weekRange, monthRange, bucketByDay, fillWater, avg, pctChange } from '@/lib/analytics';
import { todayISO, formatDateFull } from '@/lib/utils';
import type { WaterRecord } from '@/types';

export default function WaterPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const month = monthRange(0);
  const { records, loading, reload } = useWaterRecords(month);

  const [editing, setEditing] = useState<WaterRecord | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [delId, setDelId] = useState<string | null>(null);

  const quick = [150, 250, 500];

  const addToday = async (ml: number) => {
    if (!user) return;
    const { error } = await supabase.from('water_records').insert({ user_id: user.id, log_date: todayISO(), amount_ml: ml });
    if (error) { toast('Су жазбасын сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast(`${ml} мл су қосылды.`, 'success');
    reload();
  };

  const update = async () => {
    if (!editing) return;
    const ml = parseInt(editAmount);
    if (!ml || ml <= 0) { toast('Дұрыс мөлшер енгізіңіз.', 'error'); return; }
    const { error } = await supabase.from('water_records').update({ amount_ml: ml }).eq('id', editing.id);
    if (error) { toast('Су жазбасын сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast('Су мөлшері жаңартылды.', 'success');
    setEditing(null); reload();
  };

  const del = async () => {
    if (!delId) return;
    await supabase.from('water_records').delete().eq('id', delId);
    toast('Жазба өшірілді.', 'info');
    setDelId(null); reload();
  };

  // weekly
  const thisWeek = weekRange(0);
  const prevWeek = weekRange(1);
  const weekData = fillWater(bucketByDay(thisWeek), records.filter((r) => r.log_date >= thisWeek.from));
  const prevWeekData = fillWater(bucketByDay(prevWeek), records.filter((r) => r.log_date >= prevWeek.from && r.log_date <= prevWeek.to));
  const weekAvg = avg(weekData.map((d) => d.water));
  const prevAvg = avg(prevWeekData.map((d) => d.water));
  const delta = pctChange(weekAvg, prevAvg);

  // today total
  const todayTotal = records.filter((r) => r.log_date === todayISO()).reduce((s, r) => s + r.amount_ml, 0);
  const goal = 2500;
  const pct = Math.min(100, (todayTotal / goal) * 100);

  // monthly
  const monthData = fillWater(bucketByDay(month), records);
  const recent = [...records].sort((a, b) => b.log_date.localeCompare(a.log_date)).slice(0, 8);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Су ішу күнделігі</h1>
        <p className="text-sm text-ink-muted mt-1">Күнделікті мөлшер, мақсатқа жету барысы және апталық салыстыру.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Droplets className="h-5 w-5" />} label="Бүгін" value={todayTotal} unit="мл" accent="blue" sub={<span className="text-ink-muted">Мақсаттың {Math.round(pct)}% · {goal} мл</span>} />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Апталық орташа" value={weekAvg ? `${Math.round(weekAvg)}` : '—'} unit="мл" sub={<TrendIndicator delta={delta} />} />
        <StatCard icon={<Droplets className="h-5 w-5" />} label="Өткен апта орташа" value={prevAvg ? `${Math.round(prevAvg)}` : '—'} unit="мл" accent="blue" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Айырмашылық" value={weekAvg && prevAvg ? `${Math.round(weekAvg - prevAvg)}` : '—'} unit="мл" accent="amber" sub={<TrendIndicator delta={delta} />} />
      </div>

      <Card className="p-5">
        <SectionHeader title="Бүгінгі мөлшерді жылдам қосу" subtitle={`${todayTotal} мл белгіленді`} />
        <div className="flex flex-wrap items-center gap-3">
          {quick.map((ml) => (
            <button key={ml} onClick={() => addToday(ml)} className="btn-secondary px-5 py-3">
              <Droplets className="h-4 w-4" /> +{ml} мл
            </button>
          ))}
          <div className="flex-1 min-w-[180px] flex items-center gap-2">
            <div className="flex-1 h-3 rounded-full bg-primary-light overflow-hidden">
              <div className="h-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-sm font-semibold text-ink">{Math.round(pct)}%</span>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="Апталық диаграмма" subtitle="Күн сайын ішкен су мөлшері" />
        {weekData.some((d) => d.water !== undefined) ? (
          <WaterBarChart data={weekData as any} xKey="label" yKey="water" height={280} />
        ) : (
          <EmptyState icon={<Droplets className="h-6 w-6" />} title="Бұл аптада су ішу жазбасы жоқ" description="Апталық диаграмманы көру үшін су мөлшерін белгілеңіз." action={<button className="btn-primary" onClick={() => addToday(250)}>250 мл қосу</button>} />
        )}
      </Card>

      <Card className="p-5">
        <SectionHeader title="Айлық өзгеріс" subtitle={month.from.slice(0, 7)} />
        {monthData.some((d) => d.water !== undefined) ? (
          <WaterBarChart data={monthData.map((d) => ({ ...d, label: `${new Date(d.date + 'T00:00:00').getDate()}` })) as any} xKey="label" yKey="water" height={220} />
        ) : (
          <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="Бұл айда су ішу жазбасы жоқ" description="Су мөлшерін белгілегеннен кейін айлық көрсеткіш осында көрінеді." />
        )}
      </Card>

      <Card className="p-5">
        <SectionHeader title="Соңғы жазбалар" subtitle="Соңғы 8 жазба" />
        {recent.length ? (
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-cream/40 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><Droplets className="h-4 w-4" /></div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{r.amount_ml} мл</p>
                    <p className="text-xs text-ink-muted">{formatDateFull(r.log_date)}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(r); setEditAmount(String(r.amount_ml)); }} className="p-1.5 text-ink-muted hover:text-primary-dark"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => setDelId(r.id)} className="p-1.5 text-ink-muted hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon={<Droplets className="h-6 w-6" />} title="Әзірге су ішу жазбасы жоқ" description="Алғашқы стақан суды белгілеңіз." />
        )}
      </Card>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Су ішу жазбасын өңдеу" size="sm" footer={<><button className="btn-ghost" onClick={() => setEditing(null)}>Болдырмау</button><button className="btn-primary" onClick={update}>Сақтау</button></>}>
        <label className="label">Мөлшері (мл)</label>
        <input type="number" className="input" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
      </Modal>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={del} title="Су ішу жазбасын өшіресіз бе?" message="Бұл жазба өшіріледі." />
    </div>
  );
}
