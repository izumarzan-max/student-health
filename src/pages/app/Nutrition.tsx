import { useState, useMemo, useEffect } from 'react';
import { Search, Nut, Flame, Beef, Wheat, Droplet, Leaf } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, EmptyState } from '@/components/ui';
import type { NutritionItem } from '@/types';

const CATEGORIES = ['Барлығы', 'Дәнді дақылдар', 'Ақуыз көздері', 'Бұршақ тұқымдастар', 'Сүт өнімдері', 'Жемістер', 'Көкөністер', 'Жаңғақтар мен дәндер'];

export default function Nutrition() {
  const [items, setItems] = useState<NutritionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Барлығы');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    supabase.from('nutrition_items').select('*').order('name').then(({ data, error }) => {
      if (cancelled) return;
      setItems(error ? [] : (data as NutritionItem[]) || []);
      setLoadError(Boolean(error));
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [retryKey]);

  const filtered = useMemo(() => items.filter((item) => {
    if (category !== 'Барлығы' && item.category !== category) return false;
    return !search || `${item.name} ${item.benefits || ''}`.toLocaleLowerCase('kk-KZ').includes(search.toLocaleLowerCase('kk-KZ'));
  }), [items, search, category]);

  return <div className="space-y-6 animate-fadeIn">
    <div><h1 className="font-display text-2xl font-bold text-ink">Тамақтану анықтамалығы</h1><p className="text-sm text-ink-muted mt-1">Тағамның 100 грамындағы калориясы мен негізгі қоректік заттары туралы жалпы мәлімет.</p></div>
    <Card className="p-5 bg-gradient-to-br from-primary-light to-cream border-primary/20">
      <h2 className="font-display font-bold text-ink flex items-center gap-2"><Leaf className="h-5 w-5 text-primary-dark" /> Студенттерге арналған қолжетімді ас идеялары</h2>
      <div className="grid sm:grid-cols-3 gap-3 mt-3">{[
        { name: 'Сұлы мен банан', desc: 'Банан және жаңғақ езбесі қосылған сұлы — тез дайындалатын тойымды таңғы ас.' },
        { name: 'Жасымық сорпасы', desc: 'Тұтас дәнді нан қосылған жасымық сорпасы — қолжетімді әрі ақуызға бай түскі ас.' },
        { name: 'Жұмыртқа мен саумалдық', desc: 'Саумалдық пен нан қосылған жұмыртқа — күннің кез келген мезгіліне нәрлі ас.' },
      ].map((meal) => <div key={meal.name} className="rounded-xl bg-white/70 p-3"><p className="text-sm font-semibold text-ink">{meal.name}</p><p className="text-xs text-ink-muted mt-1 leading-relaxed">{meal.desc}</p></div>)}</div>
    </Card>
    <Card className="p-5">
      <div className="flex flex-col sm:flex-row gap-3 mb-4"><div className="relative flex-1"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted" /><input className="input pl-10" aria-label="Тағам іздеу" placeholder="Тағам іздеу…" value={search} onChange={(event) => setSearch(event.target.value)} /></div></div>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Тағамды санат бойынша сүзу">{CATEGORIES.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`chip transition ${category === item ? 'bg-primary-dark text-white' : 'bg-primary-light text-primary-dark hover:bg-primary/30'}`}>{item}</button>)}</div>
    </Card>
    {loading ? <Card className="p-6"><EmptyState icon={<Nut className="h-6 w-6" />} title="Тағамдар жүктелуде…" /></Card> : loadError ? <Card className="p-6 text-center"><EmptyState icon={<Nut className="h-6 w-6" />} title="Тағамдар жүктелмеді" description="Байланысты тексеріп, қайта көріңіз." /><button type="button" className="btn-primary mt-4" onClick={() => setRetryKey((key) => key + 1)}>Қайта жүктеу</button></Card> : filtered.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((item) => <Card key={item.id} hover className="p-5">
        <div className="flex items-start justify-between gap-2"><div><h2 className="font-display font-bold text-ink">{item.name}</h2><span className="chip bg-primary-light text-primary-dark mt-1">{item.category}</span></div><div className="text-right"><p className="font-display text-lg font-bold text-primary-dark">{item.calories_per_100g}</p><p className="text-[10px] text-ink-muted">ккал / 100 г</p></div></div>
        <div className="grid grid-cols-3 gap-2 mt-4"><Macro icon={<Beef className="h-3.5 w-3.5" />} label="Ақуыз" value={item.protein_g} unit=" г" color="text-rose-600" /><Macro icon={<Wheat className="h-3.5 w-3.5" />} label="Көмірсу" value={item.carbs_g} unit=" г" color="text-amber-600" /><Macro icon={<Droplet className="h-3.5 w-3.5" />} label="Май" value={item.fat_g} unit=" г" color="text-blue-600" /></div>
        {item.fiber_g !== null && item.fiber_g > 0 && <p className="text-xs text-ink-muted mt-3 flex items-center gap-1.5"><Leaf className="h-3.5 w-3.5 text-primary" /> Талшық: {item.fiber_g} г</p>}
        {item.benefits && <p className="text-xs text-ink-muted mt-2 leading-relaxed">{item.benefits}</p>}
        <p className="text-xs text-ink-muted mt-3 pt-3 border-t border-line">Үлес мөлшері: {item.serving_size}</p>
      </Card>)}
    </div> : <Card className="p-6"><EmptyState icon={<Search className="h-6 w-6" />} title="Тағам табылмады" description="Іздеу сөзін немесе санатты өзгертіп көріңіз." /></Card>}
    <p className="text-xs text-ink-muted text-center px-4"><Flame className="inline h-3.5 w-3.5" /> Тағамдық құндылықтар шамамен берілген және жалпы ақпаратқа арналған; бұл жеке тамақтану кеңесі емес.</p>
  </div>;
}

function Macro({ icon, label, value, unit, color }: { icon: React.ReactNode; label: string; value: number | null; unit: string; color: string }) {
  return <div className="rounded-lg bg-cream/50 p-2 text-center"><div className={`flex items-center justify-center gap-1 ${color}`}>{icon}</div><p className="text-sm font-bold text-ink mt-1">{value ?? '—'}{value === null ? '' : unit}</p><p className="text-[10px] text-ink-muted">{label}</p></div>;
}
