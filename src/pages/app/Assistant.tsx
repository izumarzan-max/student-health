import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, User as UserIcon, Bot, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useSleepRecords, useWaterRecords, useActivityRecords, useMoodRecords } from '@/hooks/useRecords';
import { Card } from '@/components/ui';
import { weekRange, bucketByDay, fillSleep, fillWater, fillActivity, fillMood, avg, sumDefined } from '@/lib/analytics';
import { minutesToHM } from '@/lib/utils';
import type { ChatMessage } from '@/types';

const SUGGESTED = [
  'Студентке қанша сағат ұйқы қажет?',
  'Күні бойы көбірек су ішуді қалай әдетке айналдырамын?',
  'Студентке арналған қолжетімді пайдалы ас қандай?',
  'Емтихан кезіндегі күйзелісті қалай басқарамын?',
  'Апталық қорытындымды көрсет',
];

export default function Assistant() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // current week stats for the assistant to reference
  const week = weekRange(0);
  const { records: sleepAll } = useSleepRecords(week);
  const { records: waterAll } = useWaterRecords(week);
  const { records: activityAll } = useActivityRecords(week);
  const { records: moodAll } = useMoodRecords(week);

  const buckets = bucketByDay(week);
  const sleepAvg = avg(fillSleep(buckets, sleepAll).map((d) => d.sleep));
  const waterAvg = avg(fillWater(buckets, waterAll).map((d) => d.water));
  const activityTotal = sumDefined(fillActivity(buckets, activityAll).map((d) => d.activity));
  const moodAvg = avg(fillMood(buckets, moodAll).map((d) => d.mood));

  useEffect(() => {
    if (!user) return;
    supabase.from('ai_chat_history').select('*').eq('user_id', user.id).order('created_at', { ascending: true }).then(({ data }) => {
      setMessages((data as ChatMessage[]) || []);
      setLoaded(true);
    });
  }, [user]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const persist = async (role: 'user' | 'assistant', content: string) => {
    if (!user) return;
    await supabase.from('ai_chat_history').insert({ user_id: user.id, role, content });
  };

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: ChatMessage = { id: 'tmp-' + Date.now(), user_id: user!.id, role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    await persist('user', text);

    // Demo mode — local knowledge responder
    await new Promise((r) => setTimeout(r, 600));
    const reply = generateReply(text, { sleepAvg, waterAvg, activityTotal, moodAvg });

    const assistantMsg: ChatMessage = { id: 'tmp-' + Date.now() + 'a', user_id: user!.id, role: 'assistant', content: reply, created_at: new Date().toISOString() };
    setMessages((m) => [...m, assistantMsg]);
    await persist('assistant', reply);
    setLoading(false);
  };

  const clearChat = async () => {
    if (!user) return;
    await supabase.from('ai_chat_history').delete().eq('user_id', user.id);
    setMessages([]);
    toast('Әңгіме тарихы тазартылды.', 'info');
  };

  return (
    <div className="space-y-4 animate-fadeIn flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      <div className="flex flex-wrap items-end justify-between gap-3 shrink-0">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Денсаулық көмекшісі</h1>
          <p className="text-sm text-ink-muted mt-1">Ұйқы, су ішу, тамақтану және апталық көрсеткіштер туралы жалпы сұрақ қойыңыз.</p>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className="btn-ghost text-sm"><Trash2 className="h-4 w-4" /> Әңгімені тазарту</button>
        )}
      </div>

      {/* Demo mode banner */}
      <div className="shrink-0 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 flex items-center gap-2 text-sm text-amber-800">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span><strong>Демо режимі:</strong> Көмекші дайын ақпарат қорына сүйенеді. Сыртқы жасанды интеллект қызметі қосылмаған. Ол диагноз қоймайды және ем тағайындамайды.</span>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {!loaded ? (
            <p className="text-center text-ink-muted py-10">Жүктелуде…</p>
          ) : messages.length === 0 ? (
            <div className="text-center py-10">
              <div className="h-14 w-14 rounded-2xl bg-primary-light text-primary-dark flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-7 w-7" />
              </div>
              <p className="font-display font-bold text-ink">Денсаулық туралы сұрағыңызды қойыңыз</p>
              <p className="text-sm text-ink-muted mt-1">Төмендегі сұрақтардың бірін таңдап көріңіз.</p>
            </div>
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary-light text-primary-dark flex items-center justify-center shrink-0"><Bot className="h-4 w-4" /></div>
              <div className="bg-cream/50 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulseSoft" />
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulseSoft" style={{ animationDelay: '0.2s' }} />
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulseSoft" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {messages.length === 0 && (
          <div className="px-4 sm:px-6 pb-3 flex flex-wrap gap-2">
            {SUGGESTED.map((s) => (
              <button key={s} onClick={() => send(s)} className="chip bg-primary-light text-primary-dark hover:bg-primary/30 transition">{s}</button>
            ))}
          </div>
        )}

        <div className="border-t border-line p-3 sm:p-4 shrink-0">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="Сұрағыңызды жазыңыз…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isUser ? 'bg-primary-dark text-white' : 'bg-primary-light text-primary-dark'}`}>
        {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${isUser ? 'bg-primary-dark text-white rounded-tr-sm' : 'bg-cream/50 text-ink rounded-tl-sm'}`}>
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

function generateReply(question: string, stats: { sleepAvg: number | null; waterAvg: number | null; activityTotal: number; moodAvg: number | null }): string {
  const q = question.toLocaleLowerCase('kk-KZ');

  if (q.includes('апталық қорытынды') || q.includes('осы апта') || q.includes('көрсет') || q.includes('weekly summary') || q.includes('my week') || q.includes('my stats') || q.includes('show me')) {
    return [
      'Осы аптадағы қорытындыңыз:',
      '',
      `• Орташа ұйқы: ${stats.sleepAvg !== null ? minutesToHM(Math.round(stats.sleepAvg)) : 'әзірге жазба жоқ'}`,
      `• Орташа су мөлшері: ${stats.waterAvg !== null ? `${Math.round(stats.waterAvg)} мл/күн` : 'әзірге жазба жоқ'}`,
      `• Жалпы белсенділік: ${stats.activityTotal > 0 ? `${stats.activityTotal} мин` : 'әзірге жазба жоқ'}`,
      `• Орташа көңіл күй: ${stats.moodAvg !== null ? `${stats.moodAvg.toFixed(1)}/5` : 'әзірге жазба жоқ'}`,
      '',
      'Жазбаны жалғастырсаңыз, қорытынды уақыт өте толығады.',
    ].join('\n');
  }
  if (q.includes('ұйқы') || q.includes('sleep')) {
    return 'Ересектерге тәулігіне 7–9 сағат ұйқы қажет. Тұрақты ұйқы есте сақтауға, зейін қоюға және көңіл күйге көмектеседі.\n\nПайдалы кеңестер:\n• Демалыс күндері де бір уақытта жатып, бір уақытта тұрыңыз.\n• Ұйқыға дейін 30–60 минут экраннан алшақтаңыз.\n• Түстен кейін кофеинді шектеңіз.\n• Бөлмені салқын, қараңғы әрі тыныш ұстаңыз.\n\nЕскерту: Мен ұйқы бұзылысын анықтамаймын. Ұйықтау қиындықтары жиі қайталанса, медицина маманымен сөйлесіңіз.';
  }
  if (q.includes('су') || q.includes('water') || q.includes('hydrat')) {
    return 'Жалпы бағдар бойынша күніне барлық сусын мен тағамнан 2–3 литрдей сұйықтық алуға болады. Қажеттілік қозғалыс пен ауа райына қарай өзгереді.\n\nЖеңіл әдеттер:\n• Таңертең бір стақан су ішіңіз.\n• Қайта пайдаланылатын құты алып жүріңіз.\n• Әр тамақпен бірге су ішіңіз.\n• Жаттығуға дейін және кейін су ішіңіз.\n\nЗәрдің ашық сары болуы сұйықтық жеткілікті екенін білдіруі мүмкін.';
  }
  if (q.includes('ас') || q.includes('тағам') || q.includes('тамақ') || q.includes('meal') || q.includes('nutrition') || q.includes('food') || q.includes('eat') || q.includes('diet')) {
    return 'Теңгерімді ас қуатты бірқалыпты сақтап, ұзаққа тоқ ұстайды. Табақ үлгісін қолданып көріңіз:\n\n• Табақтың жартысы: көкөніс пен жеміс\n• Төрттен бірі: ақуыз (жұмыртқа, бұршақ, тауық еті, йогурт)\n• Төрттен бірі: тұтас дәнді өнімдер (сұлы, қоңыр күріш, тұтас дәнді нан)\n• Аз мөлшерде пайдалы май қосыңыз\n\nҚолжетімді ас идеялары: банан қосылған сұлы, нан қосылған жасымық сорпасы, алма мен бадам қосылған йогурт, саумалдық қосылған жұмыртқа.\n\nБұл — жалпы ақпарат, жеке тамақтану кеңесі емес.';
  }
  if (q.includes('күйзеліс') || q.includes('емтихан') || q.includes('stress') || q.includes('exam')) {
    return 'Күйзелістің аз мөлшері қалыпты. Маңыздысы — оны басқаруға болатын деңгейде ұстау.\n\nЖылдам тәсілдер:\n• Қорапша тынысы: 4 секунд дем алыңыз, 4 секунд ұстап, 4 секунд дем шығарыңыз, 4 секунд кідіріңіз. Төрт рет қайталаңыз.\n• Үлкен тапсырманы кезеңдерге бөліңіз: 25 минут жұмыс, 5 минут демалыс.\n• Ұйқы алдында мазалаған ойларды қағазға түсіріңіз.\n\nҰзақ мерзімде ұйқы мен тамақтануды сақтап, жақындарыңызбен араласып, күн сайын қозғалыңыз. Күйзеліс бірнеше апта бойы күнделікті өмірге кедергі келтірсе, университет психологына жүгініңіз.';
  }
  if (q.includes('көңіл күй') || q.includes('психологиялық') || q.includes('мұң') || q.includes('мазасыз') || q.includes('mood') || q.includes('mental') || q.includes('sad') || q.includes('anxious')) {
    return 'Психологиялық саулыққа күнделікті әдеттер әсер етеді: ұйқы, тамақтану, су ішу, қозғалыс және адамдармен байланыс.\n\nКөңіл күйді бірнеше апта белгілеу сізге не көмектесетінін байқауға мүмкіндік береді. Оның өзгеруі қалыпты.\n\nЕкі аптадан ұзақ көңіл күйіңіз түсіп, мазасыздық басылмаса немесе өзіңізге зиян келтіру ойы болса, психологқа не жергілікті жедел көмек қызметіне хабарласыңыз. Мен диагноз қоймаймын және кәсіби көмекті алмастырмаймын.';
  }
  if (q.includes('белсенділік') || q.includes('жаттығу') || q.includes('қозғалыс') || q.includes('activity') || q.includes('exercise') || q.includes('workout')) {
    return 'Аптасына шамамен 150 минут орташа белсенділікке ұмтылыңыз: жаяу жүру, велосипед тебу және би де есепке кіреді. Тұрақтылық қарқыннан маңызды.\n\nКүн тәртібіне қосу жолдары:\n• Сабақ арасында жаяу жүріңіз.\n• 10 минуттық үзілісте созылыңыз.\n• Аптасына бір рет әуесқой спортпен айналысыңыз.\n\nДемалыс күндері де ілгерілеудің бір бөлігі. Ауырсыну не қатты шаршау сезілсе, күш салуды азайтыңыз.';
  }
  if (q.includes('сәлем') || q.includes('қайырлы') || q.includes('hello') || q.includes('hi') || q.includes('hey')) {
    return 'Сәлеметсіз бе! Менің демо нұсқам ұйқы, су ішу, тамақтану, белсенділік пен күйзеліс туралы жалпы сұрақтарға жауап беріп, апталық жазбаларыңызды қорытындылай алады. Қандай сұрағыңыз бар?';
  }
  return 'Мен дайын ақпарат қорына негізделген демо көмекшімін. Ұйқы, су ішу, тамақтану, белсенділік, күйзеліс және апталық көрсеткіштер туралы жалпы сұрақтарға көмектесемін. Ұйқы немесе апта қорытындысы туралы сұрап көріңіз.\n\nЕскерту: Мен диагноз қоймаймын және дәрі тағайындамаймын.';
}
