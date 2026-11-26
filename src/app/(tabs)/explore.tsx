
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://ummahapi.com/api/quran/surahs';

const arabicNames = [
  'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة',
  'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
  'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر',
  'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
  'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان',
  'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
  'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر',
  'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
  'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية',
  'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
  'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن',
  'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
  'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق',
  'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
  'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة',
  'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
  'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج',
  'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
  'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين',
  'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
  'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل',
  'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
  'المسد', 'الإخلاص', 'الفلق', 'الناس',
];

type Surah = {
  number: number;
  arabicName: string;
  englishName: string;
  numberOfAyahs: number | string;
};

export default function QuranScreen() {
  const router = useRouter();

  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadSurahs() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error('API error');
      }

      const result = await response.json();
      const list = result.data?.surahs;

      if (!Array.isArray(list) || list.length === 0) {
        throw new Error('Surahs not found');
      }

      const formattedSurahs = list.map((item: any, index: number) => {
        const number = Number(item.number ?? item.surahNumber ?? index + 1);

        return {
          number,
          arabicName: arabicNames[number - 1] || 'سورة',
          englishName:
            item.englishName ??
            item.english_name ??
            item.transliteration ??
            '',
          numberOfAyahs:
            item.numberOfAyahs ??
            item.number_of_ayahs ??
            item.ayahCount ??
            item.verses_count ??
            item.verses ??
            '—',
        };
      });

      setSurahs(formattedSurahs);
    } catch (err) {
      console.log('Surah loading error:', err);
      setError('تعذر تحميل السور. تحققي من الإنترنت وحاولي مجدداً.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSurahs();
  }, []);

  const filteredSurahs = surahs.filter((surah) => {
    const query = search.trim().toLowerCase();

    return (
      String(surah.number).includes(query) ||
      surah.arabicName.includes(query) ||
      surah.englishName.toLowerCase().includes(query)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>القرآن الكريم 📖</Text>
        <Text style={styles.subtitle}>
          تصفح سور كتاب الله واقرأ بتدبر
        </Text>
        <Text style={styles.count}>
          {surahs.length} سورة من القرآن الكريم
        </Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="ابحث عن سورة..."
        placeholderTextColor="#829087"
        value={search}
        onChangeText={setSearch}
        textAlign="right"
      />

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#075B46" />
          <Text style={styles.message}>
            جاري تحميل سور القرآن...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.message}>{error}</Text>
          <Pressable style={styles.retry} onPress={loadSurahs}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => String(item.number)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.message}>
              لم يتم العثور على سورة.
            </Text>
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.surahCard}
              onPress={() =>
                router.push({
                  pathname: '/surah/[number]',
                  params: {
                    number: String(item.number),
                    name: item.arabicName,
                  },
                })
              }
            >
              <View style={styles.numberBox}>
                <Text style={styles.number}>{item.number}</Text>
              </View>

              <View style={styles.surahInfo}>
                <Text style={styles.arabicName}>
                  سورة {item.arabicName}
                </Text>
                <Text style={styles.details}>
                  {item.englishName
                    ? item.englishName + ' • '
                    : ''}
                  {item.numberOfAyahs} آية
                </Text>
              </View>

              <Text style={styles.arrow}>‹</Text>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6EF',
  },
  header: {
    padding: 22,
    alignItems: 'center',
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#075B46',
  },
  subtitle: {
    fontSize: 14,
    color: '#829087',
    marginTop: 8,
  },
  count: {
    fontSize: 13,
    color: '#075B46',
    marginTop: 10,
  },
  search: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#EAE9DF',
    fontSize: 15,
  },
  list: {
    paddingHorizontal: 18,
    paddingBottom: 30,
  },
  surahCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 11,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  numberBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#E8F0E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    color: '#075B46',
    fontWeight: 'bold',
  },
  surahInfo: {
    flex: 1,
    marginRight: 13,
    alignItems: 'flex-end',
  },
  arabicName: {
    fontSize: 18,
    color: '#075B46',
    fontWeight: 'bold',
  },
  details: {
    color: '#829087',
    fontSize: 12,
    marginTop: 5,
  },
  arrow: {
    fontSize: 25,
    color: '#D5B36A',
    marginLeft: 8,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: '#075B46',
    fontSize: 15,
    marginTop: 15,
    textAlign: 'center',
  },
  retry: {
    backgroundColor: '#075B46',
    padding: 12,
    borderRadius: 10,
    marginTop: 15,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});
