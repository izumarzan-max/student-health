import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, EmptyState } from '@/components/ui';
import type { HealthArticle } from '@/types';

const CATEGORIES = ['Барлығы', 'Ұйқы', 'Су ішу', 'Теңгерімді тамақтану', 'Дене белсенділігі', 'Күйзелісті басқару', 'Психологиялық саулық', 'Аурудың алдын алу'];
const CATEGORY_COLORS: Record<string, string> = {
  'Ұйқы': 'bg-indigo-50 text-indigo-700',
  'Су ішу': 'bg-blue-50 text-blue-700',
  'Теңгерімді тамақтану': 'bg-emerald-50 text-emerald-700',
  'Дене белсенділігі': 'bg-amber-50 text-amber-700',
  'Күйзелісті басқару': 'bg-rose-50 text-rose-700',
  'Психологиялық саулық': 'bg-violet-50 text-violet-700',
  'Аурудың алдын алу': 'bg-teal-50 text-teal-700',
};

export default function Library() {
  const [articles, setArticles] = useState<HealthArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('Барлығы');

  useEffect(() => {
    supabase.from('health_articles').select('*').order('title').then(({ data }) => {
      setArticles((data as HealthArticle[]) || []);
      setLoading(false);
    });
  }, []);

  const filtered = category === 'Барлығы' ? articles : articles.filter((article) => article.category === category);

  return <div className="space-y-6 animate-fadeIn">
    <div><h1 className="font-display text-2xl font-bold text-ink">Денсаулық кітапханасы</h1><p className="text-sm text-ink-muted mt-1">Жеті тақырып бойынша түсінікті әрі сенімді мақалалар.</p></div>
    <div className="flex flex-wrap gap-2" role="group" aria-label="Мақалаларды тақырып бойынша сүзу">
      {CATEGORIES.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item} className={`chip transition ${category === item ? 'bg-primary-dark text-white' : 'bg-primary-light text-primary-dark hover:bg-primary/30'}`}>{item}</button>)}
    </div>
    {loading ? <Card className="p-6"><EmptyState icon={<BookOpen className="h-6 w-6" />} title="Мақалалар жүктелуде…" /></Card> : filtered.length ? <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filtered.map((article) => <Link key={article.id} to={`/app/library/${article.id}`} className="card card-hover p-5 flex flex-col group">
        <span className={`chip ${CATEGORY_COLORS[article.category] || 'bg-primary-light text-primary-dark'} mb-3 self-start`}>{article.category}</span>
        <h2 className="font-display font-bold text-ink group-hover:text-primary-dark transition">{article.title}</h2>
        <p className="text-sm text-ink-muted mt-2 flex-1 leading-relaxed">{article.summary}</p>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-line"><span className="text-xs text-ink-muted flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.read_time_minutes} мин оқу</span><ArrowRight className="h-4 w-4 text-ink-muted group-hover:text-primary-dark transition" /></div>
      </Link>)}
    </div> : <Card className="p-6"><EmptyState icon={<BookOpen className="h-6 w-6" />} title={category === 'Барлығы' ? 'Әзірге мақала жоқ' : 'Бұл тақырыпта мақала жоқ'} description="Мақалалар қазақша нұсқасы қосылғанда осында көрсетіледі." /></Card>}
  </div>;
}
