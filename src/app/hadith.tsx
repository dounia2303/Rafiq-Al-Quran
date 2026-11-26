
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

const API = 'https://ummahapi.com/api/hadith';

const COLORS = {
  green: '#075B46',
  darkGreen: '#064536',
  gold: '#D5B36A',
  cream: '#F7F6EF',
  white: '#FFFFFF',
  text: '#203B32',
  muted: '#829087',
};

type Collection = {
  key: string;
  name: string;
  arabic_name: string;
  author: string;
  reliability: string;
  total_hadiths: number;
};

type Hadith = {
  [key: string]: any;
};

function getText(hadith: Hadith, keys: string[]) {
  for (const key of keys) {
    const value = hadith?.[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return '';
}

export default function HadithScreen() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] =
    useState<Collection | null>(null);

  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingHadith, setLoadingHadith] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCollections();
  }, []);

  async function loadCollections() {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API}/collections`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('تعذر تحميل كتب الحديث');
      }

      setCollections(result.data.collections || []);
    } catch (err) {
      console.log('Hadith collections error:', err);
      setError('ما قدرناش نحملو كتب الحديث. تحققي من الإنترنت.');
    } finally {
      setLoading(false);
    }
  }

  async function loadCollection(collection: Collection) {
    try {
      setSelectedCollection(collection);
      setLoadingHadith(true);
      setError('');
      setHadiths([]);

      const response = await fetch(
        `${API}/${collection.key}?page=1&limit=10`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('تعذر تحميل الأحاديث');
      }

      const data = result.data;

      const list =
        data?.hadiths ||
        data?.results ||
        data?.items ||
        data?.collection?.hadiths ||
        [];

      setHadiths(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log('Hadith loading error:', err);
      setError('وقع مشكل أثناء تحميل الأحاديث.');
    } finally {
      setLoadingHadith(false);
    }
  }

  async function loadRandomHadith() {
    try {
      setSelectedCollection(null);
      setLoadingHadith(true);
      setError('');
      setHadiths([]);

      const response = await fetch(`${API}/random`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error('تعذر تحميل الحديث العشوائي');
      }

      const hadith = result.data?.hadith || result.data;

      if (hadith && typeof hadith === 'object') {
        setHadiths([hadith]);
      } else {
        setHadiths([]);
      }
    } catch (err) {
      console.log('Random hadith error:', err);
      setError('ما قدرناش نجيبو حديث عشوائي.');
    } finally {
      setLoadingHadith(false);
    }
  }

  function renderHadith(hadith: Hadith, index: number) {
    const arabic = getText(hadith, [
      'hadith_arabic',
      'arabic',
      'text_arabic',
      'arabic_text',
    ]);

    const english = getText(hadith, [
      'hadith_english',
      'english',
      'text',
      'english_text',
      'translation',
    ]);

    const narrator = getText(hadith, [
      'narrator',
      'narrator_arabic',
      'english_narrator',
      'rawi',
    ]);

    const grade = getText(hadith, [
      'grade',
      'grading',
      'authenticity',
    ]);

    const book = getText(hadith, [
      'book',
      'chapter',
      'collection_name',
    ]);

    const number =
      hadith.hadith_number ||
      hadith.number ||
      hadith.hadith_id ||
      index + 1;

    return (
      <View key={String(number) + '-' + index} style={styles.hadithCard}>
        <Text style={styles.hadithNumber}>الحديث رقم {number}</Text>

        {arabic ? (
          <Text style={styles.arabicText}>{arabic}</Text>
        ) : (
          <Text style={styles.noText}>
            النص العربي غير متوفر لهذا الحديث
          </Text>
        )}

        {english ? (
          <Text style={styles.translation}>{english}</Text>
        ) : null}

        <View style={styles.infoDivider} />

        {narrator ? (
          <Text style={styles.infoText}>الراوي: {narrator}</Text>
        ) : null}

        {book ? (
          <Text style={styles.infoText}>الكتاب: {book}</Text>
        ) : null}

        {grade ? (
          <Text style={styles.infoText}>الدرجة: {grade}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <Text style={styles.title}>الحديث الشريف</Text>
          <Text style={styles.subtitle}>
            من هدي النبي ﷺ نتعلم ونقتدي 🌿
          </Text>

          <Pressable
            style={styles.randomButton}
            onPress={loadRandomHadith}
          >
            <Text style={styles.randomButtonText}>
              ✨ حديث عشوائي
            </Text>
          </Pressable>

          <Text style={styles.sectionTitle}>كتب الحديث</Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.green}
              style={styles.loader}
            />
          ) : (
            <View style={styles.collections}>
              {collections.map((collection) => (
                <Pressable
                  key={collection.key}
                  style={[
                    styles.collectionCard,
                    selectedCollection?.key === collection.key &&
                      styles.selectedCard,
                  ]}
                  onPress={() => loadCollection(collection)}
                >
                  <Text style={styles.collectionArabic}>
                    {collection.arabic_name}
                  </Text>

                  <Text style={styles.collectionName}>
                    {collection.name}
                  </Text>

                  <Text style={styles.collectionDetails}>
                    {collection.total_hadiths} حديث
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {selectedCollection && (
            <Text style={styles.sectionTitle}>
              {selectedCollection.arabic_name}
            </Text>
          )}

          {loadingHadith ? (
            <ActivityIndicator
              size="large"
              color={COLORS.green}
              style={styles.loader}
            />
          ) : null}

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          {!loadingHadith && hadiths.length > 0
            ? hadiths.map((hadith, index) =>
                renderHadith(hadith, index)
              )
            : null}

          {!loading &&
            !loadingHadith &&
            !error &&
            hadiths.length === 0 &&
            selectedCollection && (
              <Text style={styles.noText}>
                ما لقيناش أحاديث لعرضها.
              </Text>
            )}

          <Text style={styles.footer}>
            اللهم صل وسلم على نبينا محمد ﷺ
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  container: {
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.green,
    textAlign: 'center',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  randomButton: {
    backgroundColor: COLORS.green,
    padding: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 28,
  },
  randomButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
    textAlign: 'right',
    marginBottom: 15,
  },
  collections: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 25,
  },
  collectionCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 15,
    borderWidth: 1,
    borderColor: '#EAE9DF',
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: COLORS.gold,
    borderWidth: 2,
    backgroundColor: '#F2F3E9',
  },
  collectionArabic: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.green,
    textAlign: 'center',
  },
  collectionName: {
    fontSize: 12,
    color: COLORS.text,
    marginTop: 8,
    textAlign: 'center',
  },
  collectionDetails: {
    fontSize: 11,
    color: COLORS.muted,
    marginTop: 5,
  },
  hadithCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  hadithNumber: {
    color: COLORS.gold,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 18,
  },
  arabicText: {
    color: COLORS.darkGreen,
    fontSize: 22,
    lineHeight: 43,
    textAlign: 'right',
    fontWeight: '500',
  },
  translation: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 25,
    textAlign: 'left',
    marginTop: 18,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#EAE9DF',
    marginVertical: 15,
  },
  infoText: {
    color: COLORS.muted,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  noText: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 20,
  },
  error: {
    color: '#B3261E',
    textAlign: 'center',
    marginVertical: 15,
  },
  loader: {
    marginVertical: 25,
  },
  footer: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 25,
  },
});
