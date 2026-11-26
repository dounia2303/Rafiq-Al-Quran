
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'https://ummahapi.com/api';

const surahNames = [
  'الفاتحة','البقرة','آل عمران','النساء','المائدة','الأنعام',
  'الأعراف','الأنفال','التوبة','يونس','هود','يوسف','الرعد',
  'إبراهيم','الحجر','النحل','الإسراء','الكهف','مريم','طه',
  'الأنبياء','الحج','المؤمنون','النور','الفرقان','الشعراء',
  'النمل','القصص','العنكبوت','الروم','لقمان','السجدة',
  'الأحزاب','سبأ','فاطر','يس','الصافات','ص','الزمر','غافر',
  'فصلت','الشورى','الزخرف','الدخان','الجاثية','الأحقاف',
  'محمد','الفتح','الحجرات','ق','الذاريات','الطور','النجم',
  'القمر','الرحمن','الواقعة','الحديد','المجادلة','الحشر',
  'الممتحنة','الصف','الجمعة','المنافقون','التغابن','الطلاق',
  'التحريم','الملك','القلم','الحاقة','المعارج','نوح','الجن',
  'المزمل','المدثر','القيامة','الإنسان','المرسلات','النبأ',
  'النازعات','عبس','التكوير','الانفطار','المطففين',
  'الانشقاق','البروج','الطارق','الأعلى','الغاشية','الفجر',
  'البلد','الشمس','الليل','الضحى','الشرح','التين','العلق',
  'القدر','البينة','الزلزلة','العاديات','القارعة',
  'التكاثر','العصر','الهمزة','الفيل','قريش','الماعون',
  'الكوثر','الكافرون','النصر','المسد','الإخلاص','الفلق','الناس',
];

const tafsirOptions = [
  { key: 'muyassar', name: 'التفسير الميسر', language: 'العربية' },
  { key: 'ibn_kathir_ar', name: 'تفسير ابن كثير', language: 'العربية' },
  { key: 'ibn_kathir', name: 'Ibn Kathir', language: 'English' },
  { key: 'maarif', name: "Ma'arif al-Qur'an", language: 'English' },
];

type Ayah = {
  number: number;
  arabic: string;
  tafsir: string;
};

function getList(data: any): any[] {
  const candidates = [
    data?.data?.ayahs,
    data?.data?.verses,
    data?.data?.tafsir,
    data?.ayahs,
    data?.verses,
    data?.data,
  ];

  for (const item of candidates) {
    if (Array.isArray(item)) return item;
  }

  return [];
}

function getTafsirText(item: any): string {
  if (typeof item === 'string') return item;

  if (!item || typeof item !== 'object') return '';

  const possible =
    item.tafsir ??
    item.text ??
    item.explanation ??
    item.commentary ??
    item.translation ??
    item.content ??
    item.text_arabic ??
    item.text_english;

  if (typeof possible === 'string') return possible;

  if (possible && typeof possible === 'object') {
    return getTafsirText(possible);
  }

  return '';
}

export default function TafsirScreen() {
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedTafsir, setSelectedTafsir] = useState('muyassar');
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedAyah, setSelectedAyah] = useState(1);

  async function loadTafsir(surahNumber: number, tafsirKey: string) {
    try {
      setLoading(true);
      setError('');
      setAyahs([]);
      setSelectedAyah(1);

      const [quranResponse, tafsirResponse] = await Promise.all([
        fetch(`${BASE_URL}/quran/surah/${surahNumber}`),
        fetch(`${BASE_URL}/tafsir/${tafsirKey}/surah/${surahNumber}`),
      ]);

      if (!quranResponse.ok || !tafsirResponse.ok) {
        throw new Error('API error');
      }

      const quranData = await quranResponse.json();
      const tafsirData = await tafsirResponse.json();

      console.log('TAFSIR RESPONSE:', tafsirData);
      console.log('QURAN RESPONSE:', quranData);

      const quranList = getList(quranData);
      const tafsirList = getList(tafsirData);

      const formatted: Ayah[] = quranList.map((item: any, index: number) => {
        const number = Number(item.ayah ?? item.number ?? item.number_in_surah ?? index + 1);

        const tafsirItem = tafsirList.find((t: any) =>
          Number(t.ayah ?? t.number ?? t.number_in_surah) === number
        ) ?? tafsirList[index];

        return {
          number,
          arabic:
            item.arabic ??
            item.text ??
            item.text_uthmani ??
            item.text_arabic ??
            '',
          tafsir: getTafsirText(tafsirItem),
        };
      });

      if (formatted.length === 0) {
        throw new Error('No verses found');
      }

      setAyahs(formatted);

      if (!formatted.some((ayah) => ayah.tafsir.trim() !== '')) {
        console.log('TAFSIR TEXT NOT FOUND:', tafsirData);
        setError('وصلتنا الآيات، لكن التفسير ما بانش. شوفي Console.');
      }
    } catch (e) {
      console.log('TAFSIR ERROR:', e);
      setError('ما قدرناش نجيبو التفسير. عاودي المحاولة.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTafsir(selectedSurah, selectedTafsir);
  }, []);

  const currentAyah = ayahs.find((a) => a.number === selectedAyah);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>تفسير القرآن الكريم</Text>
        <Text style={styles.subtitle}>
          افهمي معاني آيات القرآن الكريم
        </Text>

        <View style={styles.headerCard}>
          <Text style={styles.headerIcon}>۞</Text>
          <Text style={styles.headerText}>
            وَقُل رَّبِّ زِدْنِي عِلْمًا
          </Text>
          <Text style={styles.headerReference}>سورة طه - الآية 114</Text>
        </View>

        <Text style={styles.sectionTitle}>اختاري السورة</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontal}
        >
          {surahNames.map((name, index) => (
            <Pressable
              key={index}
              onPress={() => {
                setSelectedSurah(index + 1);
                loadTafsir(index + 1, selectedTafsir);
              }}
              style={[
                styles.choice,
                selectedSurah === index + 1 && styles.choiceActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  selectedSurah === index + 1 && styles.choiceTextActive,
                ]}
              >
                {index + 1}. {name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>اختاري نوع التفسير</Text>

        <View style={styles.tafsirOptions}>
          {tafsirOptions.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => {
                setSelectedTafsir(option.key);
                loadTafsir(selectedSurah, option.key);
              }}
              style={[
                styles.tafsirChoice,
                selectedTafsir === option.key && styles.choiceActive,
              ]}
            >
              <Text
                style={[
                  styles.choiceText,
                  selectedTafsir === option.key && styles.choiceTextActive,
                ]}
              >
                {option.name}
              </Text>
              <Text
                style={[
                  styles.language,
                  selectedTafsir === option.key && styles.languageActive,
                ]}
              >
                {option.language}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.surahHeader}>
          <Text style={styles.surahName}>
            سورة {surahNames[selectedSurah - 1]}
          </Text>
          <Text style={styles.surahNumber}>
            رقم {selectedSurah}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#075B46" />
            <Text style={styles.loadingText}>جاري تحميل التفسير...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={() => loadTafsir(selectedSurah, selectedTafsir)}
            >
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Text style={styles.sectionTitle}>اختاري الآية</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontal}
            >
              {ayahs.map((ayah) => (
                <Pressable
                  key={ayah.number}
                  onPress={() => setSelectedAyah(ayah.number)}
                  style={[
                    styles.ayahButton,
                    selectedAyah === ayah.number && styles.ayahButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.ayahButtonText,
                      selectedAyah === ayah.number &&
                        styles.ayahButtonTextActive,
                    ]}
                  >
                    {ayah.number}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {currentAyah && (
              <View style={styles.contentCard}>
                <Text style={styles.ayahLabel}>
                  الآية {currentAyah.number}
                </Text>

                <Text style={styles.arabic}>
                  {currentAyah.arabic}
                </Text>

                <View style={styles.divider} />

                <Text style={styles.tafsirTitle}>
                  تفسير الآية
                </Text>

                {currentAyah.tafsir ? (
                  <Text style={styles.tafsirText}>
                    {currentAyah.tafsir}
                  </Text>
                ) : (
                  <Text style={styles.noTafsir}>
                    التفسير غير متوفر لهذه الآية.
                  </Text>
                )}

                <View style={styles.navigation}>
                  <Pressable
                    disabled={selectedAyah <= 1}
                    onPress={() => setSelectedAyah(selectedAyah - 1)}
                    style={[
                      styles.navButton,
                      selectedAyah <= 1 && styles.disabledButton,
                    ]}
                  >
                    <Text style={styles.navText}>الآية السابقة</Text>
                  </Pressable>

                  <Pressable
                    disabled={selectedAyah >= ayahs.length}
                    onPress={() => setSelectedAyah(selectedAyah + 1)}
                    style={[
                      styles.navButton,
                      selectedAyah >= ayahs.length && styles.disabledButton,
                    ]}
                  >
                    <Text style={styles.navText}>الآية التالية</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        )}

        <Text style={styles.footer}>
          رفيق القرآن ☪
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F8F5EC',
  },
  container: {
    padding: 18,
    paddingBottom: 45,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#075B46',
    textAlign: 'center',
    marginTop: 15,
  },
  subtitle: {
    textAlign: 'center',
    color: '#777',
    marginTop: 8,
    marginBottom: 22,
  },
  headerCard: {
    backgroundColor: '#075B46',
    borderRadius: 20,
    padding: 23,
    alignItems: 'center',
    marginBottom: 25,
  },
  headerIcon: {
    color: '#D9BD78',
    fontSize: 30,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 24,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 45,
  },
  headerReference: {
    color: '#E8D8AA',
    marginTop: 8,
  },
  sectionTitle: {
    color: '#075B46',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 12,
    marginTop: 10,
  },
  horizontal: {
    marginBottom: 18,
  },
  choice: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E0D2',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 15,
    marginRight: 8,
  },
  choiceActive: {
    backgroundColor: '#075B46',
    borderColor: '#075B46',
  },
  choiceText: {
    color: '#34574B',
    fontSize: 14,
    fontWeight: '600',
  },
  choiceTextActive: {
    color: '#FFFFFF',
  },
  tafsirOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 22,
  },
  tafsirChoice: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E7E0D2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    minWidth: '47%',
    alignItems: 'center',
  },
  language: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
  languageActive: {
    color: '#E8D8AA',
  },
  surahHeader: {
    backgroundColor: '#E9F0E9',
    borderRadius: 14,
    padding: 17,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  surahName: {
    color: '#075B46',
    fontSize: 20,
    fontWeight: 'bold',
  },
  surahNumber: {
    color: '#947B45',
    fontSize: 14,
  },
  loading: {
    padding: 35,
    alignItems: 'center',
  },
  loadingText: {
    color: '#075B46',
    marginTop: 12,
  },
  errorCard: {
    backgroundColor: '#FFF0EE',
    padding: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  errorText: {
    color: '#A52A2A',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#075B46',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  ayahButton: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E0D2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  ayahButtonActive: {
    backgroundColor: '#075B46',
    borderColor: '#075B46',
  },
  ayahButtonText: {
    color: '#075B46',
    fontWeight: 'bold',
  },
  ayahButtonTextActive: {
    color: '#FFFFFF',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E9E1D2',
    marginTop: 5,
  },
  ayahLabel: {
    color: '#B08D48',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'right',
  },
  arabic: {
    color: '#173D32',
    fontSize: 25,
    lineHeight: 52,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginTop: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#E9E1D2',
    marginVertical: 20,
  },
  tafsirTitle: {
    color: '#075B46',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 13,
  },
  tafsirText: {
    color: '#444',
    fontSize: 17,
    lineHeight: 32,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  noTafsir: {
    color: '#999',
    textAlign: 'right',
    fontSize: 15,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    gap: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#075B46',
    padding: 13,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#AABBB3',
  },
  navText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  footer: {
    textAlign: 'center',
    color: '#947B45',
    marginTop: 30,
    fontWeight: 'bold',
  },
});
