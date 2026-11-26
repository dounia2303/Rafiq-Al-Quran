
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  green: '#075B46',
  darkGreen: '#064536',
  cream: '#F8F5EC',
  gold: '#C49A45',
  white: '#FFFFFF',
  text: '#26352F',
  muted: '#7B857F',
  border: '#E8E1D2',
};

type Verse = {
  arabic: string;
  reference: string;
  translation: string;
};

function getText(obj: any, keys: string[]): string {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return '';
}

function getReference(obj: any): string {
  const surahName = getText(obj, [
    'surah_name',
    'surahName',
    'name',
  ]);

  const surahNumber =
    obj?.surah_number ?? obj?.surah ?? obj?.surah_id;

  const ayahNumber =
    obj?.ayah_number ?? obj?.ayah ?? obj?.verse_number;

  const surah =
    surahName || (surahNumber ? `السورة ${surahNumber}` : '');

  if (surah && ayahNumber) {
    return `${surah} - الآية ${ayahNumber}`;
  }

  return surah || (ayahNumber ? `الآية ${ayahNumber}` : 'آية من القرآن الكريم');
}

function extractVerses(data: any): Verse[] {
  const found: Verse[] = [];
  const visited = new Set<any>();

  function walk(value: any) {
    if (!value || typeof value !== 'object' || visited.has(value)) return;

    visited.add(value);

    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }

    const arabic = getText(value, [
      'text_uthmani',
      'arabic',
      'text_arabic',
      'text',
      'verse_text',
      'ayah_text',
    ]);

    if (arabic) {
      found.push({
        arabic,
        reference: getReference(value),
        translation: getText(value, [
          'translation',
          'english',
          'text_translation',
          'translation_en',
        ]),
      });
    }

    Object.values(value).forEach(walk);
  }

  walk(data);

  const unique = new Map<string, Verse>();

  found.forEach((verse) => {
    const key = `${verse.reference}-${verse.arabic}`;
    unique.set(key, verse);
  });

  return Array.from(unique.values());
}

export default function MutashabihatScreen() {
  const router = useRouter();

  const [surahNumber, setSurahNumber] = useState('1');
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'random' | 'surah'>('random');

  async function loadRandom() {
    setLoading(true);
    setError('');
    setVerses([]);
    setMode('random');

    try {
      const response = await fetch(
        'https://ummahapi.com/api/quran/mutashabihat/random'
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error('تعذر تحميل الآيات المتشابهة');
      }

      const extracted = extractVerses(result.data ?? result);

      if (extracted.length === 0) {
        throw new Error('لم يتم العثور على آيات في الاستجابة');
      }

      setVerses(extracted);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'حدث خطأ، حاول مرة أخرى'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadSurah() {
    const number = Number(surahNumber);

    if (!Number.isInteger(number) || number < 1 || number > 114) {
      setError('أدخلي رقم سورة صحيح من 1 إلى 114');
      return;
    }

    setLoading(true);
    setError('');
    setVerses([]);
    setMode('surah');

    try {
      const response = await fetch(
        `https://ummahapi.com/api/quran/mutashabihat/${number}?page=1&limit=50`
      );

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error('تعذر تحميل متشابهات هذه السورة');
      }

      const extracted = extractVerses(result.data ?? result);

      if (extracted.length === 0) {
        throw new Error('لا توجد آيات متشابهة لهذه السورة');
      }

      setVerses(extracted);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'حدث خطأ، حاول مرة أخرى'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>رجوع ←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>الآيات المتشابهة</Text>
        <Text style={styles.headerIcon}>۞</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <Text style={styles.introIcon}>📖</Text>
          <Text style={styles.title}>متشابهات القرآن الكريم</Text>
          <Text style={styles.subtitle}>
            اكتشف الآيات المتشابهة وتدرّب على التمييز بينها لتساعدك في الحفظ والمراجعة
          </Text>
        </View>

        <Pressable style={styles.randomButton} onPress={loadRandom}>
          <Text style={styles.randomButtonText}>
            ✨ اكتشف آية متشابهة عشوائياً
          </Text>
        </Pressable>

        <View style={styles.searchCard}>
          <Text style={styles.sectionTitle}>البحث حسب السورة</Text>
          <Text style={styles.hint}>أدخلي رقم السورة من 1 إلى 114</Text>

          <TextInput
            value={surahNumber}
            onChangeText={setSurahNumber}
            keyboardType="number-pad"
            placeholder="رقم السورة"
            placeholderTextColor={COLORS.muted}
            style={styles.input}
            textAlign="center"
          />

          <Pressable style={styles.searchButton} onPress={loadSurah}>
            <Text style={styles.searchButtonText}>
              عرض الآيات المتشابهة
            </Text>
          </Pressable>
        </View>

        {loading && (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.green} />
            <Text style={styles.loadingText}>جاري تحميل الآيات...</Text>
          </View>
        )}

        {!!error && !loading && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={mode === 'random' ? loadRandom : loadSurah}>
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        )}

        {verses.length > 0 && !loading && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>
              {mode === 'random' ? '✨ آيات متشابهة' : 'نتائج البحث'}
            </Text>

            <Text style={styles.resultsCount}>
              تم العثور على {verses.length} آية
            </Text>

            {verses.map((verse, index) => (
              <View
                key={`${verse.reference}-${index}`}
                style={styles.verseCard}
              >
                <View style={styles.verseTop}>
                  <Text style={styles.verseNumber}>
                    الآية {index + 1}
                  </Text>

                  <Text style={styles.reference}>
                    {verse.reference}
                  </Text>
                </View>

                <Text style={styles.arabic}>{verse.arabic}</Text>

                {!!verse.translation && (
                  <Text style={styles.translation}>
                    {verse.translation}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>
          مصدر البيانات: Ummah API
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 5,
  },
  backText: {
    color: COLORS.green,
    fontSize: 15,
    fontWeight: '600',
  },
  headerTitle: {
    color: COLORS.darkGreen,
    fontSize: 19,
    fontWeight: 'bold',
  },
  headerIcon: {
    color: COLORS.gold,
    fontSize: 25,
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  intro: {
    alignItems: 'center',
    paddingVertical: 22,
  },
  introIcon: {
    fontSize: 38,
    marginBottom: 10,
  },
  title: {
    color: COLORS.darkGreen,
    fontSize: 23,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 10,
    maxWidth: 330,
  },
  randomButton: {
    backgroundColor: COLORS.green,
    padding: 17,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 18,
  },
  randomButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchCard: {
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    color: COLORS.darkGreen,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  hint: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 7,
  },
  input: {
    backgroundColor: COLORS.cream,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginTop: 14,
    color: COLORS.text,
    fontSize: 18,
  },
  searchButton: {
    backgroundColor: COLORS.gold,
    borderRadius: 11,
    padding: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  searchButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  loading: {
    alignItems: 'center',
    padding: 30,
  },
  loadingText: {
    color: COLORS.green,
    marginTop: 12,
    fontSize: 14,
  },
  errorCard: {
    backgroundColor: '#FFF0ED',
    padding: 17,
    borderRadius: 13,
    marginTop: 18,
    alignItems: 'center',
  },
  errorText: {
    color: '#A33B30',
    textAlign: 'center',
    fontSize: 14,
  },
  retryText: {
    color: COLORS.green,
    fontWeight: 'bold',
    marginTop: 12,
  },
  results: {
    marginTop: 24,
  },
  resultsTitle: {
    color: COLORS.darkGreen,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  resultsCount: {
    color: COLORS.muted,
    fontSize: 13,
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 12,
  },
  verseCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 17,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  verseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  verseNumber: {
    color: COLORS.gold,
    fontSize: 13,
    fontWeight: 'bold',
  },
  reference: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: '600',
  },
  arabic: {
    color: COLORS.darkGreen,
    fontSize: 23,
    lineHeight: 43,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  translation: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 23,
    textAlign: 'left',
    marginTop: 12,
  },
  footer: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 25,
  },
});
