// Recovered verbatim from the original APK bundle (page-89bd68034e447775.beautified.js).
// Each preset surfaces the Arabic phrase, the Kurdish + Arabic name and meaning,
// the default repetition count, and an optional Quranic source.

export type DhikrCategory = 'morning' | 'evening' | 'after-prayer' | 'anytime' | 'sleep';

export type DhikrPreset = {
  id: string;
  category: DhikrCategory;
  arabic: string;
  nameKu: string;
  nameAr: string;
  meaningKu: string;
  meaningAr: string;
  count: number;
  source?: { ku: string; ar: string };
};

export const dhikrPresets: DhikrPreset[] = [
  {
    id: 'subhan-allah', category: 'after-prayer',
    arabic: 'سُبْحَانَ اللّٰه',
    nameKu: 'تەسبیح', nameAr: 'التَّسبيح',
    meaningKu: 'پاکی و بێگەردی بۆ خوای گەورە، لە هەموو کەموکوڕی و هاوبەشێک',
    meaningAr: 'تنزيه الله سبحانه عن كل نقصٍ وعيبٍ وشريك',
    count: 33,
  },
  {
    id: 'alhamd', category: 'after-prayer',
    arabic: 'الْحَمْدُ لِلّٰه',
    nameKu: 'تەحمید', nameAr: 'التَّحميد',
    meaningKu: 'هەموو ستایش و سوپاس شایستەی خوای پەروەردگارە',
    meaningAr: 'الثناء على الله بصفات الكمال والجلال',
    count: 33,
  },
  {
    id: 'allahu-akbar', category: 'after-prayer',
    arabic: 'اللّٰهُ أَكْبَر',
    nameKu: 'تەکبیر', nameAr: 'التَّكبير',
    meaningKu: 'خوا گەورەتر و مەزنترە لە هەموو شتێک',
    meaningAr: 'الله أعظمُ وأكبرُ من كل شيء',
    count: 34,
  },
  {
    id: 'astaghfirullah', category: 'anytime',
    arabic: 'أَسْتَغْفِرُ اللّٰه',
    nameKu: 'ئیستیغفار', nameAr: 'الاستغفار',
    meaningKu: 'داوای لێخۆشبوون و تۆبە لە خوای پەروەردگار دەکەم',
    meaningAr: 'أطلب المغفرة والتوبة من الله ربِّي',
    count: 100,
  },
  {
    id: 'la-ilaha', category: 'morning',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰه',
    nameKu: 'تەهلیل', nameAr: 'التَّهليل',
    meaningKu: 'هیچ پەرستراوێکی بەحەق نییە جگە لە خوا، تەنها ئەو',
    meaningAr: 'لا معبودَ بحقٍّ إلا الله وحدَه',
    count: 100,
  },
  {
    id: 'hawqala', category: 'anytime',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰه',
    nameKu: 'حەوقەلە', nameAr: 'الحوقلة',
    meaningKu: 'هیچ گۆڕان و هێزێک نییە تەنها بە یارمەتی خوای گەورە نەبێت',
    meaningAr: 'لا تحوُّلَ من حالٍ إلى حالٍ ولا قوةَ إلا بالله العلي العظيم',
    count: 33,
  },
  {
    id: 'salli', category: 'anytime',
    arabic: 'اللّٰهُمَّ صَلِّ عَلٰى مُحَمَّد',
    nameKu: 'سەڵەوات', nameAr: 'الصَّلاة على النبي',
    meaningKu: 'ئەی خوایە، درود و سەڵامت بێت لە پێغەمبەر محەممەد (د.خ)',
    meaningAr: 'اللهم صلِّ وسلِّم على نبيك محمد ﷺ',
    count: 10,
    source: { ku: 'سورەتی ئەحزاب، ئایەتی ٥٦', ar: 'سورة الأحزاب: ٥٦' },
  },
  {
    id: 'rabbi-zidni', category: 'morning',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    nameKu: 'دوعای زانیاری', nameAr: 'دعاء طلب العلم',
    meaningKu: 'ئەی پەروەردگارم، زانیاری سوودبەخشم پێبدە و زیادی بکە',
    meaningAr: 'ربِّ زدْني علماً نافعاً وفهماً',
    count: 7,
    source: { ku: 'سورەتی تەها، ئایەتی ١١٤', ar: 'سورة طه: ١١٤' },
  },
  {
    id: 'hasbi-allah', category: 'evening',
    arabic: 'حَسْبِيَ اللّٰهُ لَا إِلٰهَ إِلَّا هُو',
    nameKu: 'حەسبەلە', nameAr: 'الحسبلة',
    meaningKu: 'خوام بەسە و پشتم بەو ئەبەستم، هیچ پەرستراوێکی بەحەق نییە جگە لەو',
    meaningAr: 'كفاني الله وعليه توكَّلت، لا معبودَ بحقٍّ إلا هو',
    count: 7,
    source: { ku: 'سورەتی تەوبە، ئایەتی ١٢٩', ar: 'سورة التوبة: ١٢٩' },
  },
];

export function dhikrById(id: string): DhikrPreset | undefined {
  return dhikrPresets.find((p) => p.id === id);
}

export function dhikrByCategory(category: DhikrCategory): DhikrPreset[] {
  return dhikrPresets.filter((p) => p.category === category);
}
