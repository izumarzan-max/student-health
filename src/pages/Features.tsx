import { Link } from 'react-router-dom';
import { Moon, Droplets, Activity, Smile, BarChart3, BookOpen, Sparkles, ArrowRight, LayoutDashboard, Nut } from 'lucide-react';

const FEATURES = [
  { icon: LayoutDashboard, title: 'Жеке шолу беті', desc: 'Ұйқы, су ішу, белсенділік пен көңіл күйге арналған күндік қорытынды, апталық диаграмма және жылдам әрекеттер.' },
  { icon: Moon, title: 'Ұйқыны бақылау', desc: 'Ұйықтау мен ояну уақытын енгізіп, ұзақтығы мен апта, ай қорытындыларын көріңіз.' },
  { icon: Droplets, title: 'Су ішу күнделігі', desc: 'Жылдам қосу батырмалары, күндік мақсат және апта сайынғы салыстыру.' },
  { icon: Activity, title: 'Дене белсенділігі', desc: 'Қозғалыс түрі мен ұзақтығын жазып, апта және ай қорытындысын бақылаңыз.' },
  { icon: Smile, title: 'Көңіл күй күнделігі', desc: 'Бес деңгейдің бірін таңдап, қажет болса қысқаша жазба қалдырыңыз.' },
  { icon: BarChart3, title: 'Апталық және айлық талдау', desc: 'Ағымдағы және алдыңғы кезеңді салыстырып, нақты жазбаларыңыздағы өзгерістерді көріңіз.' },
  { icon: Nut, title: 'Тамақтану анықтамалығы', desc: 'Тағамдарды іздеп, калориясы мен негізгі қоректік құндылықтарын біліңіз.' },
  { icon: BookOpen, title: 'Денсаулық кітапханасы', desc: 'Ұйқы, су ішу, тамақтану, белсенділік, күйзеліс және алдын алу тақырыптары.' },
  { icon: Sparkles, title: 'Денсаулық көмекшісі', desc: 'Ұйқы, тамақтану, су ішу және жеке көрсеткіштер туралы жалпы сұрақтарға жауап алыңыз.' },
];

export default function Features() {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14"><div className="text-center max-w-2xl mx-auto mb-12"><span className="chip bg-primary-light text-primary-dark mb-4">Мүмкіндіктер</span><h1 className="font-display text-4xl font-extrabold text-ink text-balance">Күнделікті саулығыңызға қажет құралдар</h1><p className="mt-4 text-ink-muted">Жазба қосып, өзгертіп, талдаңыз және өзіңізге пайдалы ақпаратты бір жерден табыңыз.</p></div>
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{FEATURES.map(({ icon: Icon, title, desc }) => <div key={title} className="card card-hover p-6"><div className="h-11 w-11 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center mb-4"><Icon className="h-5 w-5" /></div><h3 className="font-display font-bold text-ink">{title}</h3><p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{desc}</p></div>)}</div>
    <div className="mt-12 text-center"><Link to="/signup" className="btn-primary text-base px-6 py-3.5">Тіркелгі ашу <ArrowRight className="h-4 w-4" /></Link></div>
  </div>;
}
