
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'https://ummahapi.com/api/quran';

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

type Reciter = {
  id: string;
  name: string;
};

type Ayah = {
  number: number;
  arabic: string;
  audioUrl: string;
};

const fallbackReciters: Reciter[] = [
  { id: '1', name: 'مشاري العفاسي' },
  { id: '2', name: 'عبد الباسط' },
  { id: '3', name: 'عبد الرحمن السديس' },
  { id: '4', name: 'محمود خليل الحصري' },
];

export default function ListenScreen() {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [reciters, setReciters] = useState<Reciter[]>(fallbackReciters);
  const [selectedSurah, setSelectedSurah] = useState(1);
  const [selectedReciter, setSelectedReciter] = useState('1');
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [audioLoading, setAudioLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasLoaded, setHasLoaded] = useState(false);

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  const handledFinish = useRef(false);
  const ayahsRef = useRef<Ayah[]>([]);
  const indexRef = useRef(0);
  const selectedSurahRef = useRef(1);
  const selectedReciterRef = useRef('1');

  const playAyahRef = useRef<
    ((list: Ayah[], index: number) => Promise<void>) | null
  >(null);

  const currentAyah = ayahs[currentIndex];
  const currentName = arabicNames[selectedSurah - 1];

  // تحميل السور والقراء
  useEffect(() => {
    async function loadData() {
      try {
        const [surahResponse, reciterResponse] = await Promise.all([
          fetch(`${BASE_URL}/surahs`),
          fetch(`${BASE_URL}/reciters`),
        ]);

        if (surahResponse.ok) {
          const result = await surahResponse.json();

          const list =
            result.data?.surahs ??
            result.data ??
            result.surahs;

          if (Array.isArray(list)) {
            setSurahs(
              list.map((item: any, index: number) => {
                const number = Number(item.number ?? index + 1);

                return {
                  number,
                  name:
                    arabicNames[number - 1] ||
                    item.name_arabic ||
                    'سورة',
                };
              }),
            );
          }
        }

        if (reciterResponse.ok) {
          const result = await reciterResponse.json();

          const list =
            result.data?.reciters ??
            result.data ??
            result.reciters;

          if (Array.isArray(list) && list.length > 0) {
            const formatted = list
              .map((item: any) => ({
                id: String(
                  item.id ??
                  item.reciter_id ??
                  item.key ??
                  '',
                ),
                name:
                  item.name_arabic ??
                  item.name ??
                  item.reciter_name ??
                  item.name_english ??
                  'قارئ',
              }))
              .filter((item: Reciter) => item.id !== '');

            if (formatted.length > 0) {
              setReciters(formatted);
              setSelectedReciter(formatted[0].id);
              selectedReciterRef.current = formatted[0].id;
            }
          }
        }
      } catch (err) {
        console.log('Loading data error:', err);
        setError('تعذر تحميل البيانات. تحققي من الإنترنت.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // استخراج رابط الصوت من البيانات
  function getAudioUrl(value: any, reciterId: string): string {
    if (!value) return '';

    if (typeof value === 'string') {
      return value.startsWith('http') ? value : '';
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const url = getAudioUrl(item, reciterId);
        if (url) return url;
      }

      return '';
    }

    if (typeof value === 'object') {
      const directUrl =
        value.audio_url ??
        value.url ??
        value.uri ??
        value.audio;

      if (
        typeof directUrl === 'string' &&
        directUrl.startsWith('http')
      ) {
        return directUrl;
      }

      const preferredKeys = Object.keys(value).filter(
        key =>
          key === reciterId ||
          key.toLowerCase().includes(reciterId.toLowerCase()),
      );

      for (const key of preferredKeys) {
        const url = getAudioUrl(value[key], reciterId);
        if (url) return url;
      }

      for (const key of Object.keys(value)) {
        const url = getAudioUrl(value[key], reciterId);
        if (url) return url;
      }
    }

    return '';
  }

  // البحث عن صوت القارئ المختار في استجابة الآية
  function findReciterAudio(
    value: any,
    reciterId: string,
  ): string {
    if (!value) return '';

    if (Array.isArray(value)) {
      for (const item of value) {
        const itemId = String(
          item?.id ??
          item?.reciter_id ??
          item?.key ??
          '',
        );

        if (itemId === reciterId) {
          const url = getAudioUrl(
            item.audio ??
            item.audio_url ??
            item.url ??
            item,
            reciterId,
          );

          if (url) return url;
        }

        const nestedUrl = findReciterAudio(item, reciterId);

        if (nestedUrl) return nestedUrl;
      }

      return '';
    }

    if (typeof value === 'object') {
      if (value[reciterId]) {
        const url = getAudioUrl(
          value[reciterId],
          reciterId,
        );

        if (url) return url;
      }

      const itemId = String(
        value.id ??
        value.reciter_id ??
        value.key ??
        '',
      );

      if (itemId === reciterId) {
        const url = getAudioUrl(
          value.audio ??
          value.audio_url ??
          value.url ??
          value,
          reciterId,
        );

        if (url) return url;
      }

      for (const key of Object.keys(value)) {
        const url = findReciterAudio(
          value[key],
          reciterId,
        );

        if (url) return url;
      }
    }

    return '';
  }

  // تشغيل آية واحدة
  async function playAyah(list: Ayah[], index: number) {
    const ayah = list[index];

    if (!ayah) return;

    try {
      handledFinish.current = false;
      indexRef.current = index;
      setCurrentIndex(index);
      setError('');

      const surahNumber = selectedSurahRef.current;
      const reciterId = selectedReciterRef.current;

      // جلب صوت الآية وحدها
      const response = await fetch(
        `${BASE_URL}/audio/${surahNumber}/${ayah.number}`,
      );

      if (!response.ok) {
        throw new Error(
          `Audio API error: ${response.status}`,
        );
      }

      const result = await response.json();

      console.log('SINGLE AYAH AUDIO RESPONSE:', result);

      const audioUrl = findReciterAudio(
        result,
        reciterId,
      );

      if (!audioUrl) {
        console.log('RECITER AUDIO NOT FOUND:', {
          reciterId,
          response: result,
        });

        throw new Error(
          'Audio not found for selected reciter',
        );
      }

      console.log('PLAYING AYAH:', ayah.number);
      console.log('SELECTED RECITER:', reciterId);
      console.log('AYAH AUDIO URL:', audioUrl);

      await player.replace({ uri: audioUrl });
      player.play();
    } catch (err) {
      console.log('Playback error:', err);
      setError('تعذر تشغيل هذه الآية.');
    }
  }

  // تحديث مرجع دالة التشغيل
  useEffect(() => {
    playAyahRef.current = playAyah;
  });

  // تحميل سورة
  async function loadSurah(
    number: number,
    reciterId: string,
  ) {
    try {
      selectedSurahRef.current = number;
      selectedReciterRef.current = reciterId;

      setAudioLoading(true);
      setError('');
      setHasLoaded(false);
      setSelectedSurah(number);
      setCurrentIndex(0);
      setAyahs([]);

      ayahsRef.current = [];
      indexRef.current = 0;
      handledFinish.current = false;

      player.pause();

      const response = await fetch(
        `${BASE_URL}/surah/${number}?reciter=${encodeURIComponent(reciterId)}`,
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();

      const verses =
        result.data?.verses ??
        result.data?.ayahs ??
        result.verses ??
        result.ayahs;

      if (!Array.isArray(verses) || verses.length === 0) {
        console.log('Surah response:', result);
        throw new Error('Verses not found');
      }

      const formatted: Ayah[] = verses.map(
        (item: any, index: number) => ({
          number: Number(
            item.ayah ??
            item.number ??
            item.ayah_number ??
            index + 1,
          ),
          arabic:
            item.arabic ??
            item.text ??
            item.text_uthmani ??
            item.text_arabic ??
            '',
          audioUrl: '',
        }),
      );

      ayahsRef.current = formatted;
      setAyahs(formatted);

      console.log('Number of ayahs:', formatted.length);

      setHasLoaded(true);

      await playAyah(formatted, 0);
    } catch (err) {
      console.log('Listen error:', err);

      setError(
        'تعذر تحميل الصوت. جربي قارئاً آخر أو أعيدي المحاولة.',
      );

      setHasLoaded(false);
    } finally {
      setAudioLoading(false);
    }
  }

  // الانتقال التلقائي عند انتهاء الآية
  useEffect(() => {
    const subscription = player.addListener(
      'playbackStatusUpdate',
      playbackStatus => {
        if (
          !playbackStatus.didJustFinish ||
          handledFinish.current
        ) {
          return;
        }

        handledFinish.current = true;

        const nextIndex = indexRef.current + 1;

        console.log('FINISHED AYAH:', indexRef.current + 1);
        console.log('NEXT INDEX:', nextIndex);
        console.log('TOTAL AYAHS:', ayahsRef.current.length);

        if (nextIndex < ayahsRef.current.length) {
          playAyahRef.current?.(
            ayahsRef.current,
            nextIndex,
          );
        } else {
          console.log('END OF SURAH');
        }
      },
    );

    return () => {
      subscription.remove();
    };
  }, [player]);

  // الآية السابقة
  function previousAyah() {
    if (currentIndex > 0) {
      playAyah(ayahs, currentIndex - 1);
    }
  }

  // الآية التالية
  function nextAyah() {
    if (currentIndex < ayahs.length - 1) {
      playAyah(ayahs, currentIndex + 1);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>
          الاستماع للقرآن 🎧
        </Text>

        <Text style={styles.subtitle}>
          استمعي وتابعي الآيات أثناء التلاوة
        </Text>

        <Text style={styles.sectionTitle}>
          اختاري القارئ
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#075B46"
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {reciters.map(reciter => (
              <Pressable
                key={reciter.id}
                style={[
                  styles.reciterButton,
                  selectedReciter === reciter.id &&
                    styles.selectedReciter,
                ]}
                onPress={() => {
                  setSelectedReciter(reciter.id);
                  selectedReciterRef.current = reciter.id;

                  if (hasLoaded) {
                    loadSurah(
                      selectedSurah,
                      reciter.id,
                    );
                  }
                }}
              >
                <Text
                  style={[
                    styles.reciterText,
                    selectedReciter === reciter.id &&
                      styles.selectedReciterText,
                  ]}
                >
                  {reciter.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <Text style={styles.sectionTitle}>
          اختاري السورة
        </Text>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#075B46"
          />
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {surahs.map(surah => (
              <Pressable
                key={surah.number}
                style={[
                  styles.surahButton,
                  selectedSurah === surah.number &&
                    styles.selectedSurah,
                ]}
                onPress={() =>
                  loadSurah(
                    surah.number,
                    selectedReciter,
                  )
                }
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

        <View style={styles.playerCard}>
          <Text style={styles.headphone}>🎧</Text>

          <Text style={styles.nowPlaying}>
            جاري الاستماع إلى
          </Text>

          <Text style={styles.surahName}>
            {currentName}
          </Text>

          {audioLoading ? (
            <ActivityIndicator
              size="large"
              color="#075B46"
              style={{ margin: 20 }}
            />
          ) : (
            <>
              <View style={styles.ayahBox}>
                <Text style={styles.ayahLabel}>
                  {currentAyah
                    ? `الآية ${currentAyah.number}`
                    : 'اختاري سورة لبدء الاستماع'}
                </Text>

                <Text style={styles.ayahText}>
                  {currentAyah?.arabic || ''}
                </Text>
              </View>

              <Text style={styles.progress}>
                {ayahs.length > 0
                  ? currentIndex + 1
                  : 0}{' '}
                / {ayahs.length}
              </Text>

              <View style={styles.controls}>
                <Pressable
                  style={styles.controlButton}
                  onPress={previousAyah}
                  disabled={
                    currentIndex === 0 ||
                    ayahs.length === 0
                  }
                >
                  <Text style={styles.controlText}>
                    ⏮
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.mainControl}
                  onPress={() => {
                    if (!hasLoaded) {
                      loadSurah(
                        selectedSurah,
                        selectedReciter,
                      );
                    } else if (status.playing) {
                      player.pause();
                    } else {
                      player.play();
                    }
                  }}
                >
                  <Text style={styles.mainControlText}>
                    {status.playing ? '⏸' : '▶'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.controlButton}
                  onPress={nextAyah}
                  disabled={
                    currentIndex >= ayahs.length - 1 ||
                    ayahs.length === 0
                  }
                >
                  <Text style={styles.controlText}>
                    ⏭
                  </Text>
                </Pressable>
              </View>

              <Text style={styles.playingText}>
                {status.playing
                  ? 'جاري تلاوة القرآن الكريم'
                  : 'التلاوة متوقفة'}
              </Text>
            </>
          )}
        </View>

        {error !== '' && (
          <Text style={styles.error}>
            {error}
          </Text>
        )}

        <Text style={styles.sectionTitle}>
          جميع السور
        </Text>

        {surahs.map(surah => (
          <Pressable
            key={surah.number}
            style={[
              styles.surahCard,
              selectedSurah === surah.number &&
                styles.selectedCard,
            ]}
            onPress={() =>
              loadSurah(
                surah.number,
                selectedReciter,
              )
            }
          >
            <Text style={styles.number}>
              {surah.number}
            </Text>

            <Text style={styles.surahText}>
              سورة {surah.name}
            </Text>

            <Text style={styles.musicIcon}>
              ♫
            </Text>
          </Pressable>
        ))}
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
  sectionTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#075B46',
    textAlign: 'right',
    marginTop: 20,
    marginBottom: 12,
  },
  reciterButton: {
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  selectedReciter: {
    backgroundColor: '#075B46',
  },
  reciterText: {
    color: '#075B46',
    fontWeight: 'bold',
  },
  selectedReciterText: {
    color: '#FFFFFF',
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
  playerCard: {
    backgroundColor: '#E8F0E9',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginTop: 25,
  },
  headphone: {
    fontSize: 42,
  },
  nowPlaying: {
    color: '#829087',
    marginTop: 10,
  },
  surahName: {
    color: '#075B46',
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 8,
  },
  ayahBox: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 15,
    padding: 18,
    marginTop: 20,
    minHeight: 145,
    justifyContent: 'center',
  },
  ayahLabel: {
    color: '#D5B36A',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  ayahText: {
    color: '#075B46',
    fontSize: 24,
    lineHeight: 45,
    textAlign: 'center',
  },
  progress: {
    color: '#829087',
    marginTop: 15,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    gap: 25,
  },
  controlButton: {
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    color: '#075B46',
    fontSize: 22,
  },
  mainControl: {
    backgroundColor: '#075B46',
    width: 62,
    height: 62,
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainControlText: {
    color: '#FFFFFF',
    fontSize: 27,
  },
  playingText: {
    color: '#075B46',
    marginTop: 15,
  },
  surahCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  selectedCard: {
    borderColor: '#075B46',
    backgroundColor: '#E8F0E9',
  },
  number: {
    color: '#D5B36A',
    fontWeight: 'bold',
    width: 30,
  },
  surahText: {
    flex: 1,
    textAlign: 'right',
    color: '#075B46',
    fontSize: 17,
    fontWeight: 'bold',
  },
  musicIcon: {
    color: '#D5B36A',
    fontSize: 24,
    marginLeft: 10,
  },
  error: {
    color: '#B3261E',
    textAlign: 'center',
    marginTop: 15,
  },
});
