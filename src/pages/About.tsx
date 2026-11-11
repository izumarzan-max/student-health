import { Link } from 'react-router-dom';
import { HeartPulse, ShieldCheck, Users, BookOpen, BarChart3 } from 'lucide-react';

export default function About() {
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
    <span className="chip bg-primary-light text-primary-dark mb-4">Жоба туралы</span>
    <h1 className="font-display text-4xl font-extrabold text-ink text-balance">Студенттердің күнделікті саулығына арналған көмекші</h1>
    <p className="mt-5 text-lg text-ink-muted leading-relaxed">«Студент саулығы» күнделікті әдеттеріңізді бақылап, уақыт өте келе өзіңізді қалай сезінетініңізді түсінуге көмектеседі. Бұл — саулықты қолдауға арналған платформа, медициналық қызмет емес.</p>
    <div className="mt-10 grid sm:grid-cols-2 gap-5">{[
      { icon: HeartPulse, t: 'Қарапайым күнделік', d: 'Ұйқы, су ішу, белсенділік пен көңіл күйді бірнеше секундта белгілеңіз.' },
      { icon: BarChart3, t: 'Нақты талдау', d: 'Жеке жазбаларыңыз негізінде апта мен ай көрсеткіштерін салыстырыңыз.' },
      { icon: BookOpen, t: 'Сенімді ақпарат', d: 'Ұйқы, су ішу, тамақтану және күйзеліс туралы мақалаларды оқыңыз.' },
      { icon: ShieldCheck, t: 'Жеке деректер қорғалған', d: 'Жазбаларыңыз қауіпсіз сақталып, тек өзіңізге көрсетіледі.' },
    ].map(({ icon: Icon, t, d }) => <div key={t} className="card p-6"><div className="h-11 w-11 rounded-xl bg-primary-light text-primary-dark flex items-center justify-center mb-4"><Icon className="h-5 w-5" /></div><h3 className="font-display font-bold text-ink">{t}</h3><p className="mt-1.5 text-sm text-ink-muted leading-relaxed">{d}</p></div>)}</div>
    <div className="card mt-10 p-6 sm:p-8"><h2 className="font-display text-xl font-bold text-ink">Маңызды ескерту</h2><p className="mt-2 text-sm text-ink-muted leading-relaxed">Платформа жалпы саулық туралы ақпарат пен жеке бақылау құралдарын ұсынады. Ол диагноз қоймайды, дәрі тағайындамайды және дәрігер кеңесін алмастырмайды. Денсаулығыңызға қатысты сұрақ болса, білікті медицина маманына жүгініңіз.</p></div>
    <div className="mt-10 text-center"><Link to="/signup" className="btn-primary">Қосылу <Users className="h-4 w-4" /></Link></div>
  </div>;
}
