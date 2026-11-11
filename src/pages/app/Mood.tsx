import { useState } from 'react';
import { Smile, Plus, Pencil, Trash2, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useMoodRecords } from '@/hooks/useRecords';
import { Card, StatCard, SectionHeader, EmptyState, TrendIndicator } from '@/components/ui';
import { Modal, ConfirmDialog } from '@/components/Modal';
import { MoodLineChart, MoodBarChart } from '@/components/charts';
import { MOOD_META, MoodIcon } from '@/components/mood';
import { weekRange, monthRange, bucketByDay, fillMood, avg, pctChange } from '@/lib/analytics';
import { todayISO, formatDateFull } from '@/lib/utils';
import type { MoodRecord, MoodLevel } from '@/types';

export default function MoodPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const month = monthRange(0);
  const { records, reload } = useMoodRecords(month);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MoodRecord | null>(null);
  const [delId, setDelId] = useState<string | null>(null);
  const [date, setDate] = useState(todayISO());
  const [level, setLevel] = useState<MoodLevel>(3);
  const [note, setNote] = useState('');

  const save = async () => {
    if (!user) return;
    const payload = { user_id: user.id, mood_date: date, mood_level: level, note: note || null, id: editing?.id };
    const { error } = editing
      ? await supabase.from('mood_records').update(payload).eq('id', editing.id)
      : await supabase.from('mood_records').insert(payload);
    if (error) { toast('Көңіл күй жазбасын сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast(editing ? 'Көңіл күй жазбасы жаңартылды.' : 'Көңіл күй белгіленді.', 'success');
    setOpen(false); setEditing(null); reload();
  };

  const del = async () => {
    if (!delId) return;
    await supabase.from('mood_records').delete().eq('id', delId);
    toast('Көңіл күй жазбасы өшірілді.', 'info');
    setDelId(null); reload();
  };

  const openAdd = () => { setEditing(null); setDate(todayISO()); setLevel(3); setNote(''); setOpen(true); };
  const openEdit = (r: MoodRecord) => { setEditing(r); setDate(r.mood_date); setLevel(r.mood_level); setNote(r.note || ''); setOpen(true); };

  // weekly
  const thisWeek = weekRange(0);
  const prevWeek = weekRange(1);
  const weekData = fillMood(bucketByDay(thisWeek), records.filter((r) => r.mood_date >= thisWeek.from));
  const prevWeekData = fillMood(bucketByDay(prevWeek), records.filter((r) => r.mood_date >= prevWeek.from && r.mood_date <= prevWeek.to));
  const weekAvg = avg(weekData.map((d) => d.mood));
  const prevAvg = avg(prevWeekData.map((d) => d.mood));
  const delta = pctChange(weekAvg, prevAvg);

  const monthData = fillMood(bucketByDay(month), records);
  const recent = [...records].sort((a, b) => b.mood_date.localeCompare(a.mood_date)).slice(0, 8);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Көңіл күй күнделігі</h1>
          <p className="text-sm text-ink-muted mt-1">Өзіңізді қалай сезінетініңізді түсінуге арналған жеңіл күнделік.</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus className="h-4 w-4" /> Көңіл күйді белгілеу</button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={<Smile className="h-5 w-5" />} label="Апталық орташа" value={weekAvg ? weekAvg.toFixed(1) : '—'} sub={<TrendIndicator delta={delta} />} />
        <StatCard icon={<Smile className="h-5 w-5" />} label="Өткен аптадағы орташа" value={prevAvg ? prevAvg.toFixed(1) : '—'} accent="rose" />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Айырмашылық" value={weekAvg && prevAvg ? (weekAvg - prevAvg).toFixed(1) : '—'} accent="amber" sub={<TrendIndicator delta={delta} />} />
      </div>

      <Card className="p-5">
        <SectionHeader title="Бүгінгі көңіл күй" subtitle="Өзіңізді қалай сезініп тұрсыз?" />
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {([1, 2, 3, 4, 5] as MoodLevel[]).map((lv) => {
            const m = MOOD_META[lv];
            const Icon = m.icon;
            return (
              <button key={lv} type="button" aria-label={`${m.label} көңіл күйін белгілеу`} onClick={() => { setEditing(null); setDate(todayISO()); setNote(''); saveInline(lv); }} className="flex flex-col items-center gap-1.5 rounded-xl py-4 bg-cream/40 hover:bg-cream transition">
                <Icon className={`h-7 w-7 ${m.color}`} />
                <span className="text-[10px] font-medium text-ink-muted">{m.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <SectionHeader title="Апталық көңіл күй диаграммасы" subtitle="Күн сайынғы көңіл күй деңгейі" />
        {weekData.some((d) => d.mood !== undefined) ? (
          <MoodLineChart data={weekData as any} xKey="label" yKey="mood" height={280} />
        ) : (
          <EmptyState icon={<Smile className="h-6 w-6" />} title="Осы аптада көңіл күй жазбасы жоқ" description="Апталық өзгерісті көру үшін көңіл күйіңізді белгілеңіз." action={<button className="btn-primary" onClick={openAdd}>Көңіл күйді белгілеу</button>} />
        )}
      </Card>

      <Card className="p-5">
        <SectionHeader title="Айлық өзгеріс" subtitle={month.from.slice(0, 7)} />
        {monthData.some((d) => d.mood !== undefined) ? (
          <MoodBarChart data={monthData.map((d) => ({ ...d, label: `${new Date(d.date + 'T00:00:00').getDate()}` })) as any} xKey="label" yKey="mood" height={220} />
        ) : (
          <EmptyState icon={<TrendingUp className="h-6 w-6" />} title="Осы айда көңіл күй жазбасы жоқ" />
        )}
      </Card>

      <Card className="p-5">
        <SectionHeader title="Көңіл күй тарихы" subtitle="Соңғы 8 жазба" />
        {recent.length ? (
          <div className="space-y-2">
            {recent.map((r) => (
              <div key={r.id} className="flex items-center justify-between bg-cream/40 rounded-lg px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${MOOD_META[r.mood_level].bg}`}>
                    <MoodIcon level={r.mood_level} size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{MOOD_META[r.mood_level].label}</p>
                    <p className="text-xs text-ink-muted">{formatDateFull(r.mood_date)}{r.note ? ` · ${r.note}` : ''}</p>
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
          <EmptyState icon={<Smile className="h-6 w-6" />} title="Әзірге көңіл күй жазбасы жоқ" action={<button className="btn-primary" onClick={openAdd}>Көңіл күйді белгілеу</button>} />
        )}
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Көңіл күй жазбасын өңдеу' : 'Көңіл күйді белгілеу'} footer={<><button className="btn-ghost" onClick={() => setOpen(false)}>Болдырмау</button><button className="btn-primary" onClick={save}>Сақтау</button></>}>
        <div className="space-y-4">
          <div><label className="label">Күні</label><input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} /></div>
          <div>
            <label className="label">Көңіл күй</label>
            <div className="grid grid-cols-5 gap-2">
              {([1, 2, 3, 4, 5] as MoodLevel[]).map((lv) => {
                const m = MOOD_META[lv];
                const Icon = m.icon;
                return (
                  <button key={lv} type="button" onClick={() => setLevel(lv)} className={`flex flex-col items-center gap-1 rounded-xl py-3 transition ${level === lv ? `${m.bg} ring-2 ring-primary` : 'bg-cream/40'}`}>
                    <Icon className={`h-6 w-6 ${m.color}`} />
                    <span className="text-[10px] text-ink-muted">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div><label className="label">Жазба (міндетті емес)</label><textarea className="input min-h-[80px] resize-none" placeholder="Ойыңызда не бар?" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        </div>
      </Modal>
      <ConfirmDialog open={!!delId} onClose={() => setDelId(null)} onConfirm={del} title="Көңіл күй жазбасын өшіресіз бе?" message="Бұл жазба өшіріледі." />
    </div>
  );

  async function saveInline(lv: MoodLevel) {
    if (!user) return;
    const existing = records.find((r) => r.mood_date === todayISO());
    const { error } = await supabase.from('mood_records').upsert({
      user_id: user.id, mood_date: todayISO(), mood_level: lv, note: existing?.note || null, id: existing?.id,
    });
    if (error) { toast('Көңіл күй жазбасын сақтау мүмкін болмады. Қайталап көріңіз.', 'error'); return; }
    toast('Көңіл күй белгіленді.', 'success');
    reload();
  }
}
