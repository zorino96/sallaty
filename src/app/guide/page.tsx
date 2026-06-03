'use client';

import { useRouter } from 'next/navigation';
import { Bell, BookOpen, ChevronLeft, Compass, Settings, Sparkles, Sunrise, X, type LucideIcon } from 'lucide-react';
import SkyContainer from '@/components/SkyContainer';
import StarEmblem from '@/components/StarEmblem';
import { useApp } from '@/lib/AppProvider';
import { storage } from '@/lib/storage';
import { AdhanAlarm } from '@/lib/adhanAlarm';

type Step = {
  icon: LucideIcon;
  accent: 'gold' | 'lapis' | 'amber' | 'jade' | 'violet' | 'garnet';
  ku: { t: string; b: string };
  ar: { t: string; b: string };
};

// Bilingual content kept inline (like the other content pages) to avoid
// bloating the shared dictionary.
const STEPS: Step[] = [
  {
    icon: Sunrise, accent: 'lapis',
    ku: { t: 'کاتەکانی نوێژ', b: 'کارتی سەرەوە نزیکترین نوێژ و ماوەی ماوەی پیشان دەدات. خۆر/مانگ لەسەر کەوانەکە لە شوێنی ڕاستەقینەی ئێستادایە، ڕەنگی ئاسمانیش بەپێی کاتی ڕۆژ دەگۆڕێت. کاتەکان لە سەرچاوەی فەرمیی ئامۆژگارییەوە بۆ شارەکەت وەردەگیرێن.' },
    ar: { t: 'أوقات الصلاة', b: 'تعرض البطاقة العلوية الصلاة القادمة والوقت المتبقي. تتحرك الشمس/القمر على القوس حسب الوقت الحقيقي، ويتغيّر لون السماء حسب وقت اليوم. تؤخذ الأوقات من مصدر آمۆژگاری الرسمي حسب مدينتك.' },
  },
  {
    icon: Bell, accent: 'gold',
    ku: { t: 'ئاگادارکردنەوە و بانگ', b: 'ئاگادارکردنەوە چالاک بکە تا لە کاتی هەر نوێژێکدا بانگت بۆ بدرێت بە دەنگەوە — تەنانەت ئەگەر شاشەکە قفڵ و کوژاوەش بێت.\n\n⚠️ گرنگ: لە هەندێ مۆبایلدا (شیاومی، سامسۆنگ، ئۆپۆ...) پێویستە لە ڕێکخستنی مۆبایلەکەت «Battery optimization» بۆ سەڵاتی بکوژێنیتەوە و «Autostart» چالاک بکەیت، ئەگینا سیستەمەکە ئەپەکە دەکوژێنێتەوە و بانگ نادات.' },
    ar: { t: 'الإشعارات والأذان', b: 'فعّل الإشعارات ليُرفع الأذان صوتياً عند كل صلاة — حتى لو كانت الشاشة مقفلة ومطفأة.\n\n⚠️ مهم: في بعض الهواتف (شاومي، سامسونغ، أوبو...) يجب من إعدادات هاتفك إيقاف «تحسين البطارية» لتطبيق سَلاتي وتفعيل «التشغيل التلقائي»، وإلا فقد يوقفه النظام فلا يؤذّن.' },
  },
  {
    icon: BookOpen, accent: 'jade',
    ku: { t: 'قورئان', b: 'هەموو ١١٤ سورەت بە عەرەبی و وەرگێڕانی کوردی. دەتوانیت لەناو ئایەتەکاندا بگەڕێیت، ئایەت نیشان بکەیت (bookmark)، و بەردەوام بیت لە کۆتا شوێنی خوێندنەوەت.' },
    ar: { t: 'القرآن', b: 'كل الـ١١٤ سورة بالعربية مع الترجمة الكردية. يمكنك البحث داخل الآيات، وحفظ الآيات، والمتابعة من آخر موضع قرأته.' },
  },
  {
    icon: Compass, accent: 'violet',
    ku: { t: 'قیبلە و مزگەوتەکان', b: 'ئاراستەی قیبلە بە پێچەی مۆبایلەکەت بدۆزەوە، و نزیکترین مزگەوتەکان لەسەر گووگڵ ماپ ببینە.' },
    ar: { t: 'القبلة والمساجد', b: 'حدّد اتجاه القبلة ببوصلة الهاتف، واعثر على أقرب المساجد عبر خرائط جوجل.' },
  },
  {
    icon: Sparkles, accent: 'amber',
    ku: { t: 'زیکر و ئەزکار و ڕێبازەکان', b: 'ژمێرەری زیکر، کۆی زیکرەکانی بۆنەکان (خەو، دەستنوێژ، سەفەر...)، و تۆمارکردنی نوێژی بە جەماعەت بە خشتەی مانگانە.' },
    ar: { t: 'الذكر والأذكار والعادات', b: 'عدّاد الذكر، ومجموعة أذكار المناسبات (النوم، الوضوء، السفر...)، وتسجيل صلاة الجماعة بمخطط شهري.' },
  },
  {
    icon: Settings, accent: 'garnet',
    ku: { t: 'ڕێکخستن', b: 'زمان (کوردی/عەرەبی)، ڕووکاری ڕووناک/تاریک، و دەنگی بانگ هەڵبژێرە. ئەم ڕێبەرە هەر کاتێک لە ڕێکخستنەوە دەتوانیت دووبارە بیکەیتەوە.' },
    ar: { t: 'الإعدادات', b: 'اختر اللغة (الكردية/العربية)، والمظهر الفاتح/الداكن، وصوت الأذان. يمكنك فتح هذا الدليل مجدداً من الإعدادات.' },
  },
];

const MEDALLION: Record<Step['accent'], string> = {
  gold:   'bg-gradient-to-b from-gold-300/45 to-gold-600/20 text-gold-700 ring-1 ring-gold-500/30 dark:text-gold-300',
  lapis:  'bg-lapis-500/15 text-lapis-600 ring-1 ring-lapis-500/30 dark:text-lapis-300',
  amber:  'bg-jewel-amber/15 text-jewel-amber ring-1 ring-jewel-amber/30',
  jade:   'bg-jewel-jade/15 text-jewel-jade ring-1 ring-jewel-jade/30',
  violet: 'bg-jewel-violet/15 text-jewel-violet ring-1 ring-jewel-violet/30',
  garnet: 'bg-jewel-garnet/15 text-jewel-garnet ring-1 ring-jewel-garnet/30',
};

export default function GuidePage() {
  const { t, lang } = useApp();
  const isAr = lang === 'ar';
  const router = useRouter();

  const finish = (): void => {
    storage.set('guideSeen', true);
    router.replace('/');
  };

  return (
    <main className="phone-frame flex min-h-[100dvh] flex-col" style={{ paddingTop: 'max(10px, env(safe-area-inset-top))' }}>
      {/* skip */}
      <div className="flex justify-end px-4 pt-2">
        <button
          onClick={finish}
          className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] text-ink-800/55 transition active:scale-95 dark:text-ivory-100/55"
        >
          {t('skip')} <X size={13} />
        </button>
      </div>

      {/* hero */}
      <section className="px-5">
        <SkyContainer forKey="isha" className="rounded-[26px] text-ivory-100 shadow-glass">
          <div className="pointer-events-none absolute inset-[6px] rounded-[20px] ring-1 ring-[rgba(251,239,198,0.25)]" />
          <div className="relative flex flex-col items-center px-6 py-7 text-center">
            <StarEmblem size={56} color="#FBEFC6" variant="star" glow />
            <div className="gild gild-shimmer mt-3 font-rabar text-[24px] font-bold">{t('guideTitle')}</div>
            <div className="mt-1 text-[12px] text-ivory-100/80">{t('guideSub')}</div>
          </div>
        </SkyContainer>
      </section>

      {/* steps */}
      <section className="space-y-2.5 px-5 pt-4 pb-4">
        {STEPS.map((s, i) => {
          const c = isAr ? s.ar : s.ku;
          const Icon = s.icon;
          return (
            <div key={i} className="surface relative overflow-hidden rounded-[18px] rounded-t-[24px] p-4">
              <div className="flex items-start gap-3">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${MEDALLION[s.accent]}`}>
                  <Icon size={19} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="clk text-[12px] font-bold text-gold-600 dark:text-gold-300">{isAr ? ['١','٢','٣','٤','٥','٦'][i] : i + 1}</span>
                    <span className="font-rabar text-[15px] font-bold leading-tight">{c.t}</span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-[13px] leading-7 text-ink-800/70 dark:text-ivory-100/70">{c.b}</p>
                  {s.accent === 'gold' && (
                    <button
                      onClick={async () => {
                        try { await AdhanAlarm.requestBatteryExemption(); } catch { /* ignore */ }
                        try { await AdhanAlarm.openExactAlarmSettings(); } catch { /* ignore */ }
                      }}
                      className="mt-3 rounded-full bg-gradient-to-b from-gold-300 to-gold-600 px-4 py-2 text-[12px] font-bold text-ink-900 shadow-gold transition active:scale-95"
                    >
                      {isAr ? 'تفعيل أذان موثوق' : 'چالاککردنی بانگی بەردەوام'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex-1" />

      {/* start */}
      <div className="sticky bottom-0 px-5 pb-5 pt-2" style={{ paddingBottom: 'max(16px, env(safe-area-inset-bottom))' }}>
        <button
          onClick={finish}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-gold-300 to-gold-600 px-5 py-4 text-ink-900 shadow-gold transition active:scale-95"
        >
          <span className="font-bold">{t('guideStart')}</span>
          <ChevronLeft size={16} className="rtl:rotate-180" />
        </button>
      </div>
    </main>
  );
}
