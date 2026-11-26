
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

const API = 'https://ummahapi.com/api/duas';

const categoryNames: Record<string, string> = {
  morning: 'أذكار الصباح',
  evening: 'أذكار المساء',
  wudu: 'الوضوء والطهارة',
  prayer: 'أذكار الصلاة',
  after_prayer: 'أذكار بعد الصلاة',
  sleep: 'أذكار النوم',
  food: 'الطعام والشراب',
  travel: 'أذكار السفر',
  home: 'أذكار المنزل',
  masjid: 'أذكار المسجد',
  distress: 'أدعية الكرب والهم',
  forgiveness: 'الاستغفار',
  illness: 'أدعية المرض والشفاء',
  weather: 'أدعية الطقس',
  knowledge: 'أدعية العلم',
  parents: 'أدعية الوالدين',
  guidance: 'أدعية الهداية',
  gratitude: 'الشكر والحمد',
  protection: 'أدعية الحماية',
  dhikr: 'الذكر',
  marriage: 'الزواج والأسرة',
  hajj: 'الحج والعمرة',
  grief: 'أدعية الحزن',
  children: 'أدعية الأطفال',
  business: 'الرزق والعمل',
  night_prayer: 'قيام الليل',
  quran_recitation: 'أدعية قراءة القرآن',
};

type Category = {
  id: string;
  name: string;
  count?: number;
};

type Dua = {
  id: number;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  reference: string;
  repeat: number;
};

function extractArray(data: any, keys: string[]): any[] {
  for (const key of keys) {
    if (Array.isArray(data?.data?.[key])) return data.data[key];
    if (Array.isArray(data?.[key])) return data[key];
  }

  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function formatDua(item: any, index: number): Dua {
  return {
    id: Number(item.id ?? index + 1),
    title: item.title ?? item.name ?? `الدعاء ${index + 1}`,
    arabic:
      item.arabic ??
      item.text_arabic ??
      item.dua_arabic ??
      '',
    transliteration:
      item.transliteration ??
      item.transliteration_en ??
      '',
    translation:
      item.translation ??
      item.meaning ??
      item.text ??
      '',
    reference:
      item.reference ??
      item.source ??
      item.hadith ??
      '',
    repeat: Number(item.repeat ?? item.count ?? 1),
  };
}

export default function AdhkarScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [duas, setDuas] = useState<Dua[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('morning');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadCategories() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API}/categories`);

      if (!response.ok) {
        throw new Error('Categories API error');
      }

      const result = await response.json();
      console.log('ADHKAR CATEGORIES:', result);

      const list = extractArray(result, ['categories']);

      const formatted = list.map((item: any) => ({
        id: String(item.id ?? item.key),
        name:
          categoryNames[String(item.id ?? item.key)] ??
          item.name ??
          'أذكار متنوعة',
        count: item.count,
      }));

      setCategories(formatted);

      if (formatted.length > 0) {
        await loadCategory(formatted[0].id);
      } else {
        throw new Error('No categories found');
      }
    } catch (e) {
      console.log('CATEGORIES ERROR:', e);
      setError('ما قدرناش نجيبو قائمة الأذكار.');
      setLoading(false);
    }
  }

  async function loadCategory(categoryId: string) {
    try {
      setLoading(true);
      setError('');
      setSelectedCategory(categoryId);
      setDuas([]);

      const response = await fetch(
        `${API}/category/${encodeURIComponent(categoryId)}`,
      );

      if (!response.ok) {
        throw new Error(`Duas API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('DUAS RESPONSE:', result);

      const list = extractArray(result, ['duas', 'supplications']);

      const formatted = list.map(formatDua);

      setDuas(formatted);

      if (formatted.length === 0) {
        setError('ما لقيناش أذكار في هذا القسم.');
      }
    } catch (e) {
      console.log('DUAS ERROR:', e);
      setError('ما قدرناش نجيبو الأذكار. عاودي المحاولة.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>الأذكار والأدعية</Text>
        <Text style={styles.subtitle}>
          اذكري الله في كل وقت وحين
        </Text>

        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>۞</Text>
          <Text style={styles.bannerText}>
            أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ
          </Text>
          <Text style={styles.bannerReference}>
            سورة الرعد - الآية 28
          </Text>
        </View>

        <Text style={styles.sectionTitle}>أقسام الأذكار</Text>

        <View style={styles.categories}>
          {categories.map((category) => (
            <Pressable
              key={category.id}
              onPress={() => loadCategory(category.id)}
              style={[
                styles.category,
                selectedCategory === category.id &&
                  styles.categoryActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.id &&
                    styles.categoryTextActive,
                ]}
              >
                {category.name}
              </Text>

              {category.count !== undefined && (
                <Text
                  style={[
                    styles.categoryCount,
                    selectedCategory === category.id &&
                      styles.categoryTextActive,
                  ]}
                >
                  {category.count} أذكار
                </Text>
              )}
            </Pressable>
          ))}
        </View>

        <View style={styles.headingRow}>
          <Text style={styles.listTitle}>
            {categoryNames[selectedCategory] ?? 'الأذكار'}
          </Text>
          <Text style={styles.total}>
            {duas.length} أذكار
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#075B46"
            style={{ marginTop: 30 }}
          />
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retry}
              onPress={() => loadCategory(selectedCategory)}
            >
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        ) : (
          duas.map((dua) => (
            <View key={dua.id} style={styles.duaCard}>
              <Text style={styles.duaTitle}>{dua.title}</Text>

              <Text style={styles.arabic}>
                {dua.arabic || 'النص العربي غير متوفر'}
              </Text>

              {dua.transliteration ? (
                <Text style={styles.transliteration}>
                  {dua.transliteration}
                </Text>
              ) : null}

              {dua.translation ? (
                <Text style={styles.translation}>
                  {dua.translation}
                </Text>
              ) : null}

              {dua.reference ? (
                <Text style={styles.reference}>
                  المصدر: {dua.reference}
                </Text>
              ) : null}

              <View style={styles.repeatRow}>
                <Text style={styles.repeatText}>
                  عدد التكرار: {dua.repeat}
                </Text>
              </View>
            </View>
          ))
        )}

        <Text style={styles.footer}>رفيق القرآن ☪</Text>
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
  banner: {
    backgroundColor: '#075B46',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 25,
  },
  bannerIcon: {
    color: '#D9BD78',
    fontSize: 28,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 42,
    textAlign: 'center',
    marginTop: 8,
  },
  bannerReference: {
    color: '#E8D8AA',
    marginTop: 8,
  },
  sectionTitle: {
    color: '#075B46',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 14,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    marginBottom: 25,
  },
  category: {
    backgroundColor: '#FFFFFF',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E7E0D2',
    padding: 12,
    minWidth: '47%',
    alignItems: 'center',
  },
  categoryActive: {
    backgroundColor: '#075B46',
    borderColor: '#075B46',
  },
  categoryText: {
    color: '#34574B',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  categoryCount: {
    color: '#999',
    fontSize: 12,
    marginTop: 5,
  },
  headingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listTitle: {
    color: '#075B46',
    fontSize: 19,
    fontWeight: 'bold',
  },
  total: {
    color: '#947B45',
    fontSize: 13,
  },
  duaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9E1D2',
  },
  duaTitle: {
    color: '#947B45',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 15,
  },
  arabic: {
    color: '#173D32',
    fontSize: 23,
    lineHeight: 48,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  transliteration: {
    color: '#777',
    fontSize: 14,
    lineHeight: 24,
    marginTop: 14,
    textAlign: 'left',
  },
  translation: {
    color: '#444',
    fontSize: 15,
    lineHeight: 27,
    marginTop: 12,
    textAlign: 'right',
  },
  reference: {
    color: '#947B45',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 13,
  },
  repeatRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEE9DE',
    marginTop: 15,
    paddingTop: 12,
  },
  repeatText: {
    color: '#075B46',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  errorCard: {
    backgroundColor: '#FFF0EE',
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  errorText: {
    color: '#A52A2A',
    textAlign: 'center',
  },
  retry: {
    backgroundColor: '#075B46',
    padding: 12,
    borderRadius: 10,
    marginTop: 14,
  },
  retryText: {
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
