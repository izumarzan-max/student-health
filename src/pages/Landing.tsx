import { Link } from 'react-router-dom';
import { Moon, Droplets, Activity, Smile, BarChart3, BookOpen, ArrowRight, HeartPulse, ShieldCheck, Smartphone, Sparkles } from 'lucide-react';

const HERO_IMG = 'https://images.pexels.com/photos/15206701/pexels-photo-15206701.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const WATER_IMG = 'https://images.pexels.com/photos/8484295/pexels-photo-8484295.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
const FOOD_IMG = 'https://images.pexels.com/photos/13803823/pexels-photo-13803823.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const FEATURES = [
  { icon: Moon, title: 'Ұйқыны бақылау', desc: 'Ұйықтаған және оянған уақытыңызды белгілеп, апта сайынғы өзгерістерді көріңіз.' },
  { icon: Droplets, title: 'Су ішу әдеті', desc: 'Күнделікті ішкен су мөлшерін оңай тіркеп, мақсатыңызға жету барысын бақылаңыз.' },
  { icon: Activity, title: 'Дене белсенділігі', desc: 'Жаттығу түрі мен ұзақтығын жазып, апта және ай қорытындысын қараңыз.' },
  { icon: Smile, title: 'Көңіл күй күнделігі', desc: 'Көңіл күйіңізді белгілеп, қажет болса қысқаша жазба қалдырыңыз.' },
  { icon: BarChart3, title: 'Жеке талдау', desc: 'Апта мен ай бойынша көрсеткіштерді салыстырып, пайдалы үрдістерді байқаңыз.' },
  { icon: BookOpen, title: 'Денсаулық кітапханасы', desc: 'Ұйқы, тамақтану және күнделікті саулық туралы түсінікті мақалаларды оқыңыз.' },
];

const STATS = [
  { value: '4', label: 'күнделікті көрсеткіш' },
  { value: '2', label: 'салыстыру кезеңі' },
  { value: '7', label: 'ақпарат санаты' },
  { value: '24/7', label: 'жеке жазбаларға қолжетімділік' },
];

export default function Landing() {
  return <div>
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-20 lg:pb-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="animate-fadeIn">
          <span className="chip bg-primary-light text-primary-dark mb-5"><HeartPulse className="h-3.5 w-3.5" /> Студенттерге арналған саулық платформасы</span>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-ink leading-[1.1] text-balance">Өзіңізді жақсырақ таныңыз, <span className="text-primary">бір күннен бастаңыз.</span></h1>
          <p className="mt-5 text-lg text-ink-muted max-w-xl leading-relaxed">Ұйқы, су ішу, қозғалыс пен көңіл күйді бір жерде бақылаңыз. Күнделікті шағын қадамдар өзіңізді жақсы сезінуге көмектеседі.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link to="/signup" className="btn-primary text-base px-6 py-3.5">Бастауды қолға алу <ArrowRight className="h-4 w-4" /></Link><Link to="/features" className="btn-secondary text-base px-6 py-3.5">Мүмкіндіктерді көру</Link></div>
          <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-ink-muted"><span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Жеке деректеріңіз қорғалған</span><span className="flex items-center gap-2"><Smartphone className="h-4 w-4 text-primary" /> Кез келген құрылғыда ыңғайлы</span></div>
        </div>
        <div className="relative animate-scaleIn"><div className="absolute -inset-4 bg-primary-light/60 rounded-3xl blur-2xl" /><img src={HERO_IMG} alt="Табиғат аясында бірге серуендеп жүрген студенттер" className="relative rounded-3xl shadow-cardhover w-full h-[340px] sm:h-[440px] object-cover" /><div className="absolute -bottom-5 -left-5 card p-4 w-44 hidden sm:block"><p className="text-xs text-ink-muted">Осы аптадағы ұйқы</p><p className="font-display text-2xl font-bold text-ink">7,4 сағ</p><p className="text-xs text-emerald-600 font-semibold mt-0.5">Өткен аптадан +0,6 сағ</p></div></div>
      </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16"><div className="text-center max-w-2xl mx-auto mb-12"><h2 className="font-display text-3xl font-bold text-ink">Күнделікті саулығыңызға қажеттінің бәрі</h2><p className="mt-3 text-ink-muted">Әдеттерді тіркеу, түсінікті талдау және сенімді ақпарат — бір жайлы кеңістікте.</p></div><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{FEATURES.map(({ icon: Icon, title, desc }) => <div key={title} className="card card-hover p-6"><div className="h-11 w-11 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center mb-4"><Icon className="h-5 w-5" /></div><h3 className="font-display font-bold text-ink text-lg">{title}</h3><p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{desc}</p></div>)}</div></section>
    <section className="bg-cream border-y border-line"><div className="max-w-7xl mx-auto px-4 sm:px-6 py-14"><div className="grid grid-cols-2 lg:grid-cols-4 gap-6">{STATS.map((stat) => <div key={stat.label} className="text-center"><p className="font-display text-4xl font-extrabold text-primary-dark">{stat.value}</p><p className="mt-1 text-sm text-ink-muted">{stat.label}</p></div>)}</div></div></section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-10 items-center"><div className="relative order-2 lg:order-1"><img src={WATER_IMG} alt="Су құйылған мөлдір стақан" className="rounded-3xl shadow-card w-full h-[300px] sm:h-[380px] object-cover" /></div><div className="order-1 lg:order-2"><span className="chip bg-primary-light text-primary-dark mb-3">Күнделікті әдеттер</span><h3 className="font-display text-2xl font-bold text-ink">Сандарды емес, өз өзгерісіңізді байқаңыз</h3><p className="mt-3 text-ink-muted leading-relaxed">Әр жазба апта мен ай ішіндегі көрсеткіштерге қосылады. Өзіңізге пайдалы әдеттерді тауып, алға жылжуыңызды асықпай бақылаңыз.</p><ul className="mt-5 space-y-3">{['Апта мен ай бойынша салыстыру', 'Нақты жазбаларыңызға негізделген үрдістер', 'Жаңа бастағанда түсінікті бос беттер'].map((text) => <li key={text} className="flex items-start gap-3 text-sm text-ink"><span className="mt-0.5 h-5 w-5 rounded-full bg-primary-light text-primary-dark flex items-center justify-center text-xs font-bold shrink-0">✓</span>{text}</li>)}</ul></div></section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16 grid lg:grid-cols-2 gap-10 items-center"><div><span className="chip bg-primary-light text-primary-dark mb-3">Тамақтану және білім</span><h3 className="font-display text-2xl font-bold text-ink">Өзіңізге пайдалысын біліңіз</h3><p className="mt-3 text-ink-muted leading-relaxed">Тағам құрамы туралы анықтаманы және ұйқы, су ішу, күйзеліс пен психологиялық саулық жайлы мақалаларды қараңыз.</p><div className="mt-5 flex items-center gap-2 text-sm text-primary-dark font-semibold"><Sparkles className="h-4 w-4" /> Жалпы сауалдарға арналған көмекші</div></div><img src={FOOD_IMG} alt="Көкөніс пен дәнді дақылдардан әзірленген пайдалы ас" className="rounded-3xl shadow-card w-full h-[300px] sm:h-[380px] object-cover" /></section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20"><div className="relative overflow-hidden rounded-3xl bg-primary-dark text-white p-10 sm:p-14 text-center"><div className="absolute inset-0 opacity-10 grid-bg" /><div className="relative"><h3 className="font-display text-3xl font-bold">Өзіңізге қамқорлықты бүгін бастаңыз</h3><p className="mt-3 text-white/80 max-w-xl mx-auto">Тіркеліп, ұйқыңызды, ішкен суыңызды немесе көңіл күйіңізді бір минутта белгілеңіз.</p><Link to="/signup" className="mt-7 inline-flex items-center gap-2 bg-white text-primary-dark font-semibold rounded-xl px-6 py-3.5 hover:bg-cream transition">Тегін тіркелу <ArrowRight className="h-4 w-4" /></Link></div></div></section>
  </div>;
}
