
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
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

const API_URL = 'https://ummahapi.com/api/quran/surahs';
const STATS_KEY = 'quranMemorizeStats';

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
  name: string;
};

type Ayah = {
  arabic: string;
  ayah: number;
};

type Mode = 'review' | 'test';

const normalizeArabic = (word: string) => {
  return word
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/[۞،؛؟!.,:()[\]{}"'ـ]/g, '')
    .trim();
};

const getWords = (text: string) => {
  return text.trim().split(/\s+/).filter(Boolean);
};

export default function MemorizeScreen() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);

  const [mode, setMode] = useState<Mode>('review');
  const [hidden, setHidden] = useState(false);

  const [loadingSurahs, setLoadingSurahs] = useState(true);
  const [loadingAyahs, setLoadingAyahs] = useState(true);
  const [error, setError] = useState('');

  const [startAyah, setStartAyah] = useState('1');
  const [endAyah, setEndAyah] = useState('');
  const [question, setQuestion] = useState<Ayah | null>(null);
  const [answer, setAnswer] = useState('');
  const [checked, setChecked] = useState(false);

  const [attempts, setAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  // تحميل إحصائيات الحفظ المحفوظة
  useEffect(() => {
    async function loadStats() {
      try {
        const saved = await AsyncStorage.getItem(STATS_KEY);

        if (saved) {
          const stats = JSON.parse(saved);

          setAttempts(stats.attempts ?? 0);
          setCorrectAnswers(stats.correctAnswers ?? 0);
        }
      } catch (error) {
        console.log('Loading memorize stats error:', error);
      }
    }

    loadStats();
  }, []);

  // تحميل السور
  useEffect(() => {
    async function loadSurahs() {
      try {
        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error('API error');
        }

        const result = await response.json();
        const list = result.data?.surahs;

        if (!Array.isArray(list)) {
          throw new Error('No surahs');
        }

        setSurahs(
          list.map((item: any, index: number) => {
            const number = Number(item.number ?? index + 1);

            return {
              number,
              name: arabicNames[number - 1] || 'سورة',
            };
          }),
        );
      } catch {
        setError('تعذر تحميل السور. تحققي من الإنترنت.');
      } finally {
        setLoadingSurahs(false);
      }
    }

    loadSurahs();
  }, []);

  // تحميل آيات السورة المختارة
  useEffect(() => {
    let active = true;

    async function loadAyahs() {
      try {
        setLoadingAyahs(true);
        setError('');
        setAyahs([]);
        setHidden(false);
        setQuestion(null);
        setAnswer('');
        setChecked(false);
        setStartAyah('1');
        setEndAyah('');

        const response = await fetch(
          `https://ummahapi.com/api/quran/surah/${selectedSurah}`,
        );

        if (!response.ok) {
          throw new Error('API error');
        }

        const result = await response.json();
        const verses = result.data?.verses;

        if (!Array.isArray(verses)) {
          throw new Error('No verses');
        }

        const formattedAyahs: Ayah[] = verses.map(
          (item: any, index: number) => ({
            arabic:
              item.arabic ??
              item.text_uthmani ??
              item.text ??
              '',
            ayah: Number(item.ayah ?? item.number ?? index + 1),
          }),
        );

        if (active) {
          setAyahs(formattedAyahs);
          setEndAyah(String(formattedAyahs.length));
        }
      } catch {
        if (active) {
          setError('تعذر تحميل الآيات. حاولي مجدداً.');
        }
      } finally {
        if (active) {
          setLoadingAyahs(false);
        }
      }
    }

    loadAyahs();

    return () => {
      active = false;
    };
  }, [selectedSurah]);

  // تغيير السورة
  const changeSurah = (number: number) => {
    setSelectedSurah(number);
    setMode('review');
    // لا نصفر الإحصائيات عند تغيير السورة
  };

  // الآيات المحددة للاختبار
  const getSelectedAyahs = () => {
    const start = Math.max(1, Number(startAyah) || 1);
    const end = Math.max(start, Number(endAyah) || ayahs.length);

    return ayahs.filter(
      item => item.ayah >= start && item.ayah <= end,
    );
  };

  // اختيار آية عشوائية
  const startTest = () => {
    const selected = getSelectedAyahs();

    if (selected.length === 0) {
      setError('اختاري مجالاً صحيحاً للآيات.');
      return;
    }

    const randomIndex = Math.floor(Math.random() * selected.length);

    setQuestion(selected[randomIndex]);
    setAnswer('');
    setChecked(false);
    setError('');
  };

  // مقارنة الإجابة وحفظ الإحصائيات
  const checkAnswer = async () => {
    if (!question || checked || !answer.trim()) {
      return;
    }

    const expectedWords = getWords(question.arabic);
    const answerWords = getWords(answer);

    const isCorrect =
      expectedWords.length === answerWords.length &&
      expectedWords.every(
        (word, index) =>
          normalizeArabic(word) ===
          normalizeArabic(answerWords[index] || ''),
      );

    const newAttempts = attempts + 1;
    const newCorrectAnswers =
      correctAnswers + (isCorrect ? 1 : 0);

    setAttempts(newAttempts);
    setCorrectAnswers(newCorrectAnswers);
    setChecked(true);

    try {
      await AsyncStorage.setItem(
        STATS_KEY,
        JSON.stringify({
          attempts: newAttempts,
          correctAnswers: newCorrectAnswers,
        }),
      );
    } catch (error) {
      console.log('Saving memorize stats error:', error);
    }
  };

  // عرض نتيجة التصحيح
  const renderCorrection = () => {
    if (!question) return null;

    const expectedWords = getWords(question.arabic);
    const answerWords = getWords(answer);

    const isCorrect =
      expectedWords.length === answerWords.length &&
      expectedWords.every(
        (word, index) =>
          normalizeArabic(word) ===
          normalizeArabic(answerWords[index] || ''),
      );

    return (
      <View style={styles.correctionCard}>
        <Text style={styles.correctionTitle}>
          {isCorrect
            ? 'ممتاز! إجابة صحيحة 🎉'
            : 'راجعي الأخطاء وحاولي مرة أخرى'}
        </Text>

        <Text style={styles.wordsLine}>
          {expectedWords.map((word, index) => {
            const isWordCorrect =
              normalizeArabic(word) ===
              normalizeArabic(answerWords[index] || '');

            return (
              <Text
                key={index}
                style={{
                  color: isWordCorrect ? '#16834B' : '#D32F2F',
                  fontWeight: 'bold',
                }}
              >
                {word}{' '}
              </Text>
            );
          })}
        </Text>

        {answerWords.length > expectedWords.length && (
          <Text style={styles.extraWords}>
            كلمات إضافية: {answerWords.slice(expectedWords.length).join(' ')}
          </Text>
        )}

        <Text style={styles.correctAnswerLabel}>
          الآية الصحيحة:
        </Text>

        <Text style={styles.correctAnswerText}>
          {question.arabic}
        </Text>
      </View>
    );
  };

  const selectedSurahName = arabicNames[selectedSurah - 1];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>حفظ القرآن 🧠</Text>

        <Text style={styles.subtitle}>
          احفظي القرآن وراجعي ما حفظتِ خطوة بخطوة
        </Text>

        {/* اختيار الوضع */}
        <View style={styles.modeContainer}>
          <Pressable
            style={[
              styles.modeButton,
              mode === 'review' && styles.activeMode,
            ]}
            onPress={() => {
              setMode('review');
              setQuestion(null);
              setAnswer('');
              setChecked(false);
            }}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'review' && styles.activeModeText,
              ]}
            >
              📖 وضع الحفظ
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.modeButton,
              mode === 'test' && styles.activeMode,
            ]}
            onPress={() => {
              setMode('test');
              setHidden(false);
              setQuestion(null);
              setAnswer('');
              setChecked(false);
            }}
          >
            <Text
              style={[
                styles.modeText,
                mode === 'test' && styles.activeModeText,
              ]}
            >
              🧠 اختبار الحفظ
            </Text>
          </Pressable>
        </View>

        {/* اختيار السورة */}
        <Text style={styles.sectionTitle}>اختاري السورة</Text>

        {loadingSurahs ? (
          <ActivityIndicator size="large" color="#075B46" />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {surahs.map(surah => (
              <Pressable
                key={surah.number}
                onPress={() => changeSurah(surah.number)}
                style={[
                  styles.surahButton,
                  selectedSurah === surah.number &&
                    styles.selectedSurah,
                ]}
              >
                <Text
                  style={[
                    styles.surahButtonText,
                    selectedSurah === surah.number &&
                      styles.selectedSurahText,
                  ]}
                >
                  {surah.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* معلومات السورة */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            سورة {selectedSurahName}
          </Text>

          <Text style={styles.infoSubtitle}>
            {ayahs.length} آية
          </Text>
        </View>

        {loadingAyahs ? (
          <ActivityIndicator
            size="large"
            color="#075B46"
            style={{ marginTop: 25 }}
          />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : mode === 'review' ? (
          <>
            <Pressable
              style={styles.hideButton}
              onPress={() => setHidden(!hidden)}
              disabled={ayahs.length === 0}
            >
              <Text style={styles.hideButtonText}>
                {hidden
                  ? '👁 إظهار الآيات'
                  : '🙈 إخفاء الآيات واختبار حفظي'}
              </Text>
            </Pressable>

            {ayahs.map(item => (
              <View key={item.ayah} style={styles.ayahCard}>
                <Text style={styles.ayahNumber}>
                  الآية {item.ayah}
                </Text>

                <Text style={styles.ayahText}>
                  {hidden
                    ? 'ــــــــــــــــــــــــــــ'
                    : item.arabic}
                </Text>
              </View>
            ))}
          </>
        ) : (
          <>
            {/* إعدادات الاختبار */}
            <View style={styles.testSettings}>
              <Text style={styles.settingsTitle}>
                إعدادات الاختبار
              </Text>

              <Text style={styles.settingsDescription}>
                حددي الآيات التي تريدين اختبار حفظك فيها
              </Text>

              <View style={styles.rangeContainer}>
                <View style={styles.rangeItem}>
                  <Text style={styles.inputLabel}>من الآية</Text>

                  <TextInput
                    style={styles.rangeInput}
                    value={startAyah}
                    onChangeText={setStartAyah}
                    keyboardType="numeric"
                    placeholder="1"
                    textAlign="center"
                  />
                </View>

                <View style={styles.rangeItem}>
                  <Text style={styles.inputLabel}>إلى الآية</Text>

                  <TextInput
                    style={styles.rangeInput}
                    value={endAyah}
                    onChangeText={setEndAyah}
                    keyboardType="numeric"
                    placeholder={String(ayahs.length)}
                    textAlign="center"
                  />
                </View>
              </View>

              <Text style={styles.rangeHint}>
                عدد الآيات المختارة: {getSelectedAyahs().length}
              </Text>

              <Pressable
                style={styles.startTestButton}
                onPress={startTest}
              >
                <Text style={styles.startTestText}>
                  🎲 اختاري آية عشوائية
                </Text>
              </Pressable>
            </View>

            {/* الإحصائيات */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{attempts}</Text>
                <Text style={styles.statLabel}>المحاولات</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{correctAnswers}</Text>
                <Text style={styles.statLabel}>الإجابات الصحيحة</Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {attempts > 0
                    ? `${Math.round((correctAnswers / attempts) * 100)}%`
                    : '0%'}
                </Text>
                <Text style={styles.statLabel}>النتيجة</Text>
              </View>
            </View>

            {/* سؤال الاختبار */}
            {question ? (
              <View style={styles.questionCard}>
                <Text style={styles.questionTitle}>
                  اختبري حفظك ✨
                </Text>

                <Text style={styles.questionInfo}>
                  سورة {selectedSurahName} - الآية {question.ayah}
                </Text>

                <Text style={styles.questionHint}>
                  اكتبي الآية من حفظك دون النظر إليها
                </Text>

                <TextInput
                  style={styles.answerInput}
                  value={answer}
                  onChangeText={text => {
                    setAnswer(text);
                    if (checked) setChecked(false);
                  }}
                  placeholder="اكتبي الآية هنا..."
                  placeholderTextColor="#999999"
                  multiline
                  textAlign="right"
                  textAlignVertical="top"
                  editable={!checked}
                />

                {!checked ? (
                  <Pressable
                    style={[
                      styles.checkButton,
                      !answer.trim() && styles.disabledButton,
                    ]}
                    onPress={checkAnswer}
                    disabled={!answer.trim()}
                  >
                    <Text style={styles.checkButtonText}>
                      ✓ تحقق من إجابتي
                    </Text>
                  </Pressable>
                ) : (
                  <>
                    {renderCorrection()}

                    <Pressable
                      style={styles.startTestButton}
                      onPress={startTest}
                    >
                      <Text style={styles.startTestText}>
                        السؤال التالي ←
                      </Text>
                    </Pressable>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.emptyQuestion}>
                <Text style={styles.emptyIcon}>📖</Text>
                <Text style={styles.emptyText}>
                  اضغطي على «اختاري آية عشوائية» لبدء الاختبار
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F6EF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#075B46',
    textAlign: 'center',
  },
  subtitle: {
    color: '#829087',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: '#E8EDE7',
    borderRadius: 14,
    padding: 5,
    marginBottom: 25,
  },
  modeButton: {
    flex: 1,
    padding: 13,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeMode: {
    backgroundColor: '#075B46',
  },
  modeText: {
    color: '#075B46',
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeModeText: {
    color: '#FFFFFF',
  },
  sectionTitle: {
    color: '#075B46',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  surahButton: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  selectedSurah: {
    backgroundColor: '#075B46',
  },
  surahButtonText: {
    color: '#075B46',
    fontWeight: 'bold',
  },
  selectedSurahText: {
    color: '#FFFFFF',
  },
  infoCard: {
    backgroundColor: '#E8F0E9',
    padding: 20,
    borderRadius: 16,
    marginTop: 22,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 23,
    color: '#075B46',
    fontWeight: 'bold',
  },
  infoSubtitle: {
    color: '#829087',
    marginTop: 7,
  },
  hideButton: {
    backgroundColor: '#075B46',
    padding: 16,
    borderRadius: 14,
    marginTop: 20,
    alignItems: 'center',
  },
  hideButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  ayahCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 15,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  ayahNumber: {
    color: '#D5B36A',
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  ayahText: {
    fontSize: 23,
    lineHeight: 43,
    color: '#075B46',
    textAlign: 'right',
  },
  error: {
    color: '#B3261E',
    textAlign: 'center',
    marginTop: 20,
  },
  testSettings: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  settingsTitle: {
    color: '#075B46',
    fontSize: 19,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  settingsDescription: {
    color: '#829087',
    textAlign: 'right',
    marginTop: 7,
  },
  rangeContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  rangeItem: {
    flex: 1,
  },
  inputLabel: {
    color: '#075B46',
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 8,
  },
  rangeInput: {
    backgroundColor: '#F7F6EF',
    borderWidth: 1,
    borderColor: '#D9E2D9',
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    color: '#075B46',
  },
  rangeHint: {
    color: '#829087',
    textAlign: 'right',
    marginTop: 12,
  },
  startTestButton: {
    backgroundColor: '#075B46',
    padding: 15,
    borderRadius: 12,
    marginTop: 17,
    alignItems: 'center',
  },
  startTestText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#E8F0E9',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    color: '#075B46',
    fontSize: 21,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#829087',
    fontSize: 11,
    marginTop: 5,
    textAlign: 'center',
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  questionTitle: {
    color: '#075B46',
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questionInfo: {
    color: '#B89552',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  questionHint: {
    color: '#829087',
    textAlign: 'right',
    marginTop: 20,
    marginBottom: 10,
  },
  answerInput: {
    minHeight: 140,
    backgroundColor: '#F7F6EF',
    borderWidth: 1,
    borderColor: '#D9E2D9',
    borderRadius: 12,
    padding: 15,
    fontSize: 21,
    lineHeight: 38,
    color: '#075B46',
    writingDirection: 'rtl',
  },
  checkButton: {
    backgroundColor: '#B89552',
    padding: 15,
    borderRadius: 12,
    marginTop: 15,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  checkButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  correctionCard: {
    backgroundColor: '#F7F6EF',
    borderRadius: 12,
    padding: 15,
    marginTop: 18,
  },
  correctionTitle: {
    color: '#075B46',
    fontWeight: 'bold',
    fontSize: 17,
    textAlign: 'center',
    marginBottom: 15,
  },
  wordsLine: {
    fontSize: 22,
    lineHeight: 42,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  extraWords: {
    color: '#D32F2F',
    textAlign: 'right',
    marginTop: 12,
    fontSize: 16,
  },
  correctAnswerLabel: {
    color: '#075B46',
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 18,
    marginBottom: 8,
  },
  correctAnswerText: {
    color: '#075B46',
    fontSize: 21,
    lineHeight: 40,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  emptyQuestion: {
    backgroundColor: '#FFFFFF',
    padding: 25,
    borderRadius: 16,
    marginTop: 18,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 35,
    marginBottom: 12,
  },
  emptyText: {
    color: '#829087',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 25,
  },
});
