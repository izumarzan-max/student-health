import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, EmptyState } from '@/components/ui';
import type { HealthArticle } from '@/types';

export default function ArticleDetail() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<HealthArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase.from('health_articles').select('*').eq('id', id).maybeSingle().then(({ data }) => {
      setArticle(data as HealthArticle | null);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="py-20 text-center text-ink-muted">Мақала жүктелуде…</div>;
  if (!article) {
    return (
      <Card className="p-6">
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title="Мақала табылмады" action={<Link to="/app/library" className="btn-primary">Кітапханаға оралу</Link>} />
      </Card>
    );
  }

  // Render simple markdown-ish content
  const blocks = article.content.split('\n').filter((l) => l.trim());

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <Link to="/app/library" className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-primary-dark transition">
        <ArrowLeft className="h-4 w-4" /> Кітапханаға оралу
      </Link>

      <article>
        <span className="chip bg-primary-light text-primary-dark">{article.category}</span>
        <h1 className="font-display text-3xl font-extrabold text-ink mt-3 text-balance">{article.title}</h1>
        <p className="text-sm text-ink-muted mt-3 flex items-center gap-2"><Clock className="h-3.5 w-3.5" /> {article.read_time_minutes} мин оқу</p>

        <Card className="p-6 sm:p-8 mt-5">
          <div className="prose prose-sm max-w-none space-y-3">
            {blocks.map((line, i) => {
              if (line.startsWith('# ')) return <h1 key={i} className="font-display text-2xl font-bold text-ink mt-4">{line.slice(2)}</h1>;
              if (line.startsWith('## ')) return <h2 key={i} className="font-display text-lg font-bold text-ink mt-5">{line.slice(3)}</h2>;
              if (line.startsWith('- ')) return <li key={i} className="text-sm text-ink leading-relaxed ml-4 list-disc">{line.slice(2)}</li>;
              return <p key={i} className="text-sm text-ink leading-relaxed">{line}</p>;
            })}
          </div>
        </Card>

        <div className="card mt-5 p-5 bg-cream/50 border-primary/20">
          <p className="text-sm text-ink-muted leading-relaxed">
            Бұл мақала жалпы саулық туралы ақпарат береді және медицина маманының кеңесін алмастырмайды. Денсаулығыңызға қатысты сұрағыңыз болса, білікті медицина маманымен кеңесіңіз.
          </p>
        </div>
      </article>
    </div>
  );
}
