
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://ummahapi.com/api/asma-ul-husna';

const COLORS = {
  green: '#075B46',
  darkGreen: '#064536',
  gold: '#D5B36A',
  cream: '#F7F6EF',
  white: '#FFFFFF',
  text: '#203B32',
  muted: '#829087',
};

type NameItem = {
  number: number;
  name: string;
  transliteration: string;
  english: string;
  meaning: string;
  meaningArabic: string;
};

// شرح عربي مختصر لأسماء الله الحسنى
const arabicMeanings: Record<number, string> = {
  1: 'الواسع الرحمة الذي شملت رحمته جميع خلقه.',
  2: 'الذي يرحم عباده رحمة خاصة.',
  3: 'المالك لكل شيء والمتصرف في خلقه.',
  4: 'المنزه عن كل نقص وعيب.',
  5: 'السالم من كل نقص، ومانح السلام والأمان.',
  6: 'الذي يصدق رسله ويمنح عباده الأمن.',
  7: 'الرقيب والشاهد على كل شيء.',
  8: 'الغالب الذي لا يُغلب، وله العزة كلها.',
  9: 'الذي تنفذ مشيئته ولا يخرج شيء عن سلطانه.',
  10: 'المتعالي عن صفات المخلوقين.',
  11: 'الذي أوجد الأشياء من العدم.',
  12: 'الذي خلق الخلق وأبرزهم إلى الوجود.',
  13: 'الذي أعطى كل مخلوق صورته وشكله.',
  14: 'الذي يستر الذنوب ويغفرها مرارًا.',
  15: 'الذي قهر جميع خلقه بقدرته.',
  16: 'كثير العطاء، الذي يهب النعم دون مقابل.',
  17: 'المتكفل بأرزاق جميع المخلوقات.',
  18: 'الذي يفتح أبواب الخير والرحمة لعباده.',
  19: 'الذي أحاط علمه بكل شيء.',
  20: 'الذي يقدر الأرزاق والأشياء بحكمته.',
  21: 'الذي يوسع الرزق والرحمة لمن يشاء.',
  22: 'الذي يخفض من يشاء بحكمته وعدله.',
  23: 'الذي يرفع من يشاء من عباده.',
  24: 'الذي يمنح العزة لمن يشاء.',
  25: 'الذي يذل من يشاء بعدله وحكمته.',
  26: 'الذي يسمع كل الأصوات والدعوات.',
  27: 'الذي يرى كل شيء مهما دق وخفي.',
  28: 'الذي يحكم بين خلقه بالحق.',
  29: 'الذي لا يظلم أحدًا ويحكم بالعدل.',
  30: 'الرفيق بعباده، الذي يوصل إليهم الخير بلطف.',
  31: 'العالم بدقائق الأمور وخفاياها.',
  32: 'الذي لا يعجل بالعقوبة رغم قدرته.',
  33: 'الذي له العظمة والكمال المطلق.',
  34: 'الذي يغفر الذنوب ويستر العيوب.',
  35: 'الذي يجازي عباده على أعمالهم الصالحة بالفضل.',
  36: 'الذي له العلو المطلق في ذاته وقدره وقهره.',
  37: 'العظيم الذي لا أعظم منه.',
  38: 'الذي يحفظ كل شيء ولا يغيب عنه شيء.',
  39: 'الذي يوصل إلى خلقه أقواتهم وما يحتاجون إليه.',
  40: 'الكافي لعباده والمحاسب لهم على أعمالهم.',
  41: 'العظيم ذو الجلال والهيبة.',
  42: 'كثير الخير والعطاء، واسع الكرم.',
  43: 'المطلع على أعمال عباده وأحوالهم.',
  44: 'الذي يجيب دعاء من دعاه.',
  45: 'الواسع في علمه ورحمته وفضله.',
  46: 'الذي يضع الأمور في مواضعها بحكمة.',
  47: 'المحب لعباده الصالحين والمحبوب منهم.',
  48: 'العظيم ذو المجد والشرف والكمال.',
  49: 'الذي يبعث الخلق بعد الموت.',
  50: 'الشاهد على كل شيء ولا يخفى عليه شيء.',
  51: 'الموجود حقًا، وقوله ووعده حق.',
  52: 'الذي يعتمد عليه العباد في أمورهم.',
  53: 'صاحب القوة الكاملة التي لا يعجزها شيء.',
  54: 'الشديد القوة الذي لا يلحقه ضعف.',
  55: 'ناصر عباده المؤمنين ومتولي أمورهم.',
  56: 'المستحق لجميع المحامد والثناء.',
  57: 'الذي أحصى كل شيء علمًا وعددًا.',
  58: 'الذي بدأ خلق الأشياء من العدم.',
  59: 'الذي يعيد الخلق بعد موتهم.',
  60: 'الذي يمنح الحياة لمن يشاء.',
  61: 'الذي يقدر الموت على خلقه.',
  62: 'الذي له الحياة الكاملة التي لا تزول.',
  63: 'القائم بنفسه والمدبر لشؤون خلقه.',
  64: 'الذي لا يفقد شيئًا ولا يعجزه طلب.',
  65: 'صاحب الشرف والمجد والكرم.',
  66: 'المتفرد بالألوهية والكمال.',
  67: 'السيد الكامل الذي تقصده الخلائق في حاجاتها.',
  68: 'الذي يقدر على كل شيء.',
  69: 'كامل القدرة، يفعل ما يشاء بلا عجز.',
  70: 'الذي يقدم من يشاء بفضله وحكمته.',
  71: 'الذي يؤخر من يشاء بحكمته.',
  72: 'الذي ليس قبله شيء.',
  73: 'الذي ليس بعده شيء.',
  74: 'العالي فوق خلقه، الظاهر بآياته.',
  75: 'الذي لا تدركه الأبصار ولا تحيط به العقول.',
  76: 'المتولي لجميع أمور خلقه.',
  77: 'المتعالي عن كل نقص.',
  78: 'كثير الإحسان والخير لعباده.',
  79: 'الذي يقبل توبة عباده ويغفر لهم.',
  80: 'الذي يعاقب من يستحق العقوبة بعدله.',
  81: 'الذي يمحو الذنوب ويتجاوز عن السيئات.',
  82: 'شديد الرحمة والرأفة بعباده.',
  83: 'المالك لجميع الملك والمتصرف فيه.',
  84: 'صاحب العظمة والجلال والكرم.',
  85: 'الذي يعدل بين خلقه ولا يظلم أحدًا.',
  86: 'الذي يجمع الخلائق ليوم الحساب.',
  87: 'الغني عن جميع خلقه، وكل الخلق محتاجون إليه.',
  88: 'الذي يغني عباده بفضله وعطائه.',
  89: 'الذي يمنع ما يشاء بحكمته.',
  90: 'الذي يقدر الضر بحكمته وعدله.',
  91: 'الذي يمنح النفع والخير لمن يشاء.',
  92: 'منوّر السماوات والأرض وهادي أهلها.',
  93: 'الذي يهدي عباده إلى طريق الحق.',
  94: 'الذي أبدع خلق السماوات والأرض بلا مثال سابق.',
  95: 'الدائم الذي لا يفنى ولا يزول.',
  96: 'الباقي بعد فناء الخلق، والوارث لكل شيء.',
  97: 'الذي يهدي إلى الصواب والرشد.',
  98: 'الذي لا يعجل بالعقوبة ويمهل عباده.',
  99: 'الاسم الجامع لجميع صفات الكمال والألوهية.',
};

export default function AsmaScreen() {
  const router = useRouter();

  const [names, setNames] = useState<NameItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedName, setSelectedName] = useState<number | null>(null);

  useEffect(() => {
    loadNames();
  }, []);

  async function loadNames() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('API Error: ' + response.status);
      }

      const result = await response.json();
      const list = result?.data?.names;

      if (!Array.isArray(list)) {
        console.log('ASMA API RESPONSE:', JSON.stringify(result));
        throw new Error('Format des données incorrect');
      }

      const formatted: NameItem[] = list.map((item: any) => ({
        number: Number(item.number),
        name: item.arabic || '',
        transliteration: item.transliteration || '',
        english: item.english || '',
        meaning: item.meaning || '',
        meaningArabic: arabicMeanings[Number(item.number)] || 'لا يتوفر شرح عربي لهذا الاسم.',
      }));

      setNames(formatted);
    } catch (err) {
      console.log('Asma API Error:', err);
      setError('تعذر تحميل أسماء الله الحسنى. تحققي من الاتصال بالإنترنت.');
    } finally {
      setLoading(false);
    }
  }

  const filteredNames = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return names;

    return names.filter((item) =>
      item.name.includes(value) ||
      item.transliteration.toLowerCase().includes(value) ||
      item.english.toLowerCase().includes(value) ||
      item.meaning.toLowerCase().includes(value) ||
      item.meaningArabic.includes(value)
    );
  }, [names, search]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>رجوع ←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>أسماء الله الحسنى</Text>

        <Text style={styles.headerSubtitle}>
          وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا
        </Text>
      </View>

      <View style={styles.introCard}>
        <Text style={styles.introIcon}>✨</Text>
        <Text style={styles.introTitle}>أسماء الله الحسنى</Text>

        <Text style={styles.introText}>
          تعرّف على أسماء الله الحسنى ومعانيها بالعربية والإنجليزية.
        </Text>

        <Text style={styles.counter}>{names.length} اسمًا</Text>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>⌕</Text>

        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن اسم أو معنى..."
          placeholderTextColor={COLORS.muted}
          value={search}
          onChangeText={setSearch}
          textAlign="right"
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.green} />
          <Text style={styles.loadingText}>
            جاري تحميل أسماء الله الحسنى...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable style={styles.retryButton} onPress={loadNames}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          <Text style={styles.resultsText}>
            {filteredNames.length} نتيجة
          </Text>

          {filteredNames.map((item) => (
            <Pressable
              key={item.number}
              style={[
                styles.nameCard,
                selectedName === item.number && styles.selectedCard,
              ]}
              onPress={() =>
                setSelectedName(
                  selectedName === item.number ? null : item.number
                )
              }
            >
              <View style={styles.numberCircle}>
                <Text style={styles.numberText}>{item.number}</Text>
              </View>

              <View style={styles.nameInfo}>
                <Text style={styles.arabicName}>{item.name}</Text>

                <Text style={styles.transliteration}>
                  {item.transliteration}
                </Text>

                {selectedName === item.number && (
                  <View style={styles.meaningBox}>
                    <Text style={styles.englishName}>
                      {item.english}
                    </Text>

                    <Text style={styles.meaningTitle}>
                      المعنى بالعربية
                    </Text>

                    <Text style={styles.meaningText}>
                      {item.meaningArabic}
                    </Text>

                    <View style={styles.meaningDivider} />

                    <Text style={styles.meaningTitle}>
                      Meaning in English
                    </Text>

                    <Text style={styles.englishMeaning}>
                      {item.meaning || 'No English explanation available.'}
                    </Text>
                  </View>
                )}
              </View>

              <Text style={styles.arrow}>
                {selectedName === item.number ? '⌃' : '⌄'}
              </Text>
            </Pressable>
          ))}

          {filteredNames.length === 0 && (
            <Text style={styles.emptyText}>
              لم يتم العثور على أي اسم.
            </Text>
          )}

          <Text style={styles.footer}>
            سبحان الله وبحمده 🤍
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backText: {
    color: COLORS.white,
    fontSize: 14,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 8,
  },
  headerSubtitle: {
    color: '#E5D4A8',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
  },
  introCard: {
    backgroundColor: COLORS.white,
    margin: 18,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  introIcon: {
    fontSize: 35,
  },
  introTitle: {
    color: COLORS.green,
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  introText: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 23,
    marginTop: 8,
  },
  counter: {
    color: COLORS.gold,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 18,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  searchIcon: {
    fontSize: 25,
    color: COLORS.green,
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: COLORS.text,
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 25,
  },
  loadingText: {
    color: COLORS.muted,
    marginTop: 15,
  },
  errorText: {
    color: '#B3261E',
    textAlign: 'center',
    fontSize: 15,
  },
  retryButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 15,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  list: {
    padding: 18,
    paddingBottom: 35,
  },
  resultsText: {
    color: COLORS.muted,
    textAlign: 'right',
    marginBottom: 12,
    fontSize: 13,
  },
  nameCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 16,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  selectedCard: {
    borderColor: COLORS.gold,
    borderWidth: 2,
  },
  numberCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8F0E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberText: {
    color: COLORS.green,
    fontWeight: 'bold',
  },
  nameInfo: {
    flex: 1,
    marginHorizontal: 13,
    alignItems: 'flex-end',
  },
  arabicName: {
    color: COLORS.darkGreen,
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  transliteration: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
    textAlign: 'right',
  },
  arrow: {
    color: COLORS.gold,
    fontSize: 23,
  },
  meaningBox: {
    backgroundColor: '#F7F6EF',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    width: '100%',
  },
  englishName: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 12,
  },
  meaningTitle: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 6,
  },
  meaningText: {
    color: COLORS.text,
    fontSize: 14,
    textAlign: 'right',
    lineHeight: 25,
  },
  meaningDivider: {
    height: 1,
    backgroundColor: '#E4E1D5',
    marginVertical: 12,
  },
  englishMeaning: {
    color: COLORS.text,
    fontSize: 13,
    textAlign: 'left',
    lineHeight: 22,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 30,
  },
  footer: {
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 25,
    fontSize: 13,
  },
});
