
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://ummahapi.com/api/quran/surah/';
const TOTAL_QURAN_AYAHS = 6236;

type Ayah = {
  ayah?: number;
  arabic?: string;
  translations?: {
    french?: string;
  };
};

type AudioInfo = {
  reciter?: string;
  style?: string;
  surah_audio?: string;
};

type DailyActivity = {
  [date: string]: string[];
};

type KhatmaHistoryEntry =
  | string
  | {
      startedAt: string;
      completedAt: string;
      durationDays: number;
    };

function getLocalDateKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function parseArray(data: string | null): string[] {
  if (!data) return [];

  try {
    const result = JSON.parse(data);
    return Array.isArray(result) ? result : [];
  } catch {
    return [];
  }
}

function parseDailyActivity(data: string | null): DailyActivity {
  if (!data) return {};

  try {
    const result = JSON.parse(data);

    if (result && typeof result === 'object' && !Array.isArray(result)) {
      return result;
    }

    return {};
  } catch {
    return {};
  }
}

export default function SurahReader() {
  const { number, name, ayah } = useLocalSearchParams<{
    number: string;
    name: string;
    ayah?: string;
  }>();

  const router = useRouter();
  const listRef = useRef<FlatList<Ayah>>(null);
  const hasScrolled = useRef(false);
  const saveQueue = useRef(Promise.resolve());

  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const player = useAudioPlayer(null);
  const status = useAudioPlayerStatus(player);

  async function loadAyahs() {
    try {
      setLoading(true);
      setError('');
      hasScrolled.current = false;

      const response = await fetch(`${API_URL}${number}`);

      if (!response.ok) {
        throw new Error('API error');
      }

      const result = await response.json();
      const list = result.data?.verses;
      const audio = result.data?.audio?.[0];

      if (!Array.isArray(list) || list.length === 0) {
        throw new Error('Ayahs not found');
      }

      setAyahs(list);
      setAudioInfo(audio ?? null);
    } catch (err) {
      console.log('Ayah loading error:', err);
      setError('تعذر تحميل الآيات. حاولي مرة أخرى.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (number) {
      loadAyahs();
    }
  }, [number]);

  useEffect(() => {
    if (audioInfo?.surah_audio) {
      player.replace({ uri: audioInfo.surah_audio });
    }

    return () => {
      player.pause();
    };
  }, [audioInfo?.surah_audio, number]);

  // حفظ آخر آية وصل إليها المستخدم
  async function saveLastRead(ayahNumber: number) {
    try {
      await AsyncStorage.setItem(
        'lastRead',
        JSON.stringify({
          number: String(number),
          name: String(name || 'القرآن الكريم'),
          ayah: ayahNumber,
        })
      );
    } catch (err) {
      console.log('Saving last read error:', err);
    }
  }

  // تسجيل القراءة اليومية والختمة التلقائية
  function saveVisibleAyahs(visibleAyahs: number[]) {
    if (visibleAyahs.length === 0) return;

    saveQueue.current = saveQueue.current.then(async () => {
      try {
        const [
          allReadData,
          dailyData,
          currentKhatmaData,
          historyData,
          startData,
        ] = await Promise.all([
          AsyncStorage.getItem('quranReadAyahs'),
          AsyncStorage.getItem('quranDailyActivity'),
          AsyncStorage.getItem('quranCurrentKhatmaAyahs'),
          AsyncStorage.getItem('quranKhatmaHistory'),
          AsyncStorage.getItem('quranCurrentKhatmaStart'),
        ]);

        // جميع الآيات المقروءة
        const allRead = new Set(parseArray(allReadData));

        // نشاط اليوم
        const today = getLocalDateKey();
        const dailyActivity = parseDailyActivity(dailyData);

        const todayAyahs = new Set(
          Array.isArray(dailyActivity[today])
            ? dailyActivity[today]
            : []
        );

        // الختمة الحالية
        const currentKhatma = new Set(
          parseArray(currentKhatmaData)
        );

        // سجل الختمات المكتملة
        const khatmaHistory = (
          parseArray(historyData) as unknown as KhatmaHistoryEntry[]
        );

        // تاريخ بداية الختمة الحالية
        let khatmaStart: string | null = startData;

        if (currentKhatma.size === 0 && !khatmaStart) {
          khatmaStart = new Date().toISOString();
        } else if (currentKhatma.size > 0 && !khatmaStart) {
          // للختمة التي بدأت قبل إضافة ميزة تاريخ البداية
          khatmaStart = new Date().toISOString();
        }

        // إضافة الآيات
        visibleAyahs.forEach(ayahNumber => {
          if (!Number.isInteger(ayahNumber) || ayahNumber < 1) {
            return;
          }

          const key = `${number}:${ayahNumber}`;

          allRead.add(key);
          todayAyahs.add(key);
          currentKhatma.add(key);
        });

        dailyActivity[today] = [...todayAyahs];

        // إكمال الختمة
        if (currentKhatma.size >= TOTAL_QURAN_AYAHS) {
          const completedAt = new Date().toISOString();
          const startedAt = khatmaStart || completedAt;

          const durationDays = Math.max(
            1,
            Math.ceil(
              (
                new Date(completedAt).getTime() -
                new Date(startedAt).getTime()
              ) /
                (1000 * 60 * 60 * 24)
            )
          );

          khatmaHistory.push({
            startedAt,
            completedAt,
            durationDays,
          });

          // بداية ختمة جديدة
          currentKhatma.clear();
          khatmaStart = null;

          console.log('تم إكمال ختمة جديدة!');
        }

        await Promise.all([
          AsyncStorage.setItem(
            'quranReadAyahs',
            JSON.stringify([...allRead])
          ),
          AsyncStorage.setItem(
            'quranDailyActivity',
            JSON.stringify(dailyActivity)
          ),
          AsyncStorage.setItem(
            'quranCurrentKhatmaAyahs',
            JSON.stringify([...currentKhatma])
          ),
          AsyncStorage.setItem(
            'quranKhatmaHistory',
            JSON.stringify(khatmaHistory)
          ),
          AsyncStorage.setItem(
            'quranCurrentKhatmaStart',
            khatmaStart || ''
          ),
        ]);

        const validAyahs = visibleAyahs.filter(
          value => Number.isInteger(value) && value > 0
        );

        if (validAyahs.length > 0) {
          const lastVisible = Math.max(...validAyahs);
          await saveLastRead(lastVisible);
        }
      } catch (err) {
        console.log('Saving reading activity error:', err);
      }
    });
  }

  // مراقبة الآيات الظاهرة
  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 60,
    minimumViewTime: 500,
  }).current;

  // اكتشاف الآيات أثناء التمرير
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: any[] }) => {
      const visibleAyahs = viewableItems
        .filter(token => token.isViewable && token.item)
        .map(token => {
          const item = token.item as Ayah;
          return item.ayah ?? (token.index ?? 0) + 1;
        });

      if (visibleAyahs.length > 0) {
        saveVisibleAyahs(visibleAyahs);
      }
    }
  ).current;

  // الضغط على الآية يحفظ آخر موضع
  function handleAyahPress(ayahNumber: number) {
    saveLastRead(ayahNumber);
  }

  // حفظ آخر موضع عند فتح السورة
  useEffect(() => {
    if (ayahs.length > 0) {
      const requestedAyah = Number(ayah);

      const validAyah =
        requestedAyah > 0 && requestedAyah <= ayahs.length
          ? requestedAyah
          : 1;

      saveLastRead(validAyah);
    }
  }, [ayahs, number]);

  // الانتقال إلى الآية المطلوبة
  useEffect(() => {
    if (loading || ayahs.length === 0 || hasScrolled.current) {
      return;
    }

    const requestedAyah = Number(ayah);

    if (requestedAyah > 1 && requestedAyah <= ayahs.length) {
      const targetIndex = ayahs.findIndex(
        item => item.ayah === requestedAyah
      );

      if (targetIndex >= 0) {
        hasScrolled.current = true;

        const timer = setTimeout(() => {
          listRef.current?.scrollToIndex({
            index: targetIndex,
            animated: false,
            viewPosition: 0.15,
          });
        }, 500);

        return () => clearTimeout(timer);
      }
    }

    hasScrolled.current = true;
  }, [loading, ayahs, ayah]);

  function handleScrollToIndexFailed(info: {
    index: number;
    averageItemLength: number;
  }) {
    const offset = info.averageItemLength * info.index;

    listRef.current?.scrollToOffset({
      offset,
      animated: false,
    });

    setTimeout(() => {
      listRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
        viewPosition: 0.15,
      });
    }, 300);
  }

  function toggleAudio() {
    if (status.playing) {
      player.pause();
    } else {
      player.play();
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.back}>→ رجوع</Text>
        </Pressable>

        <Text style={styles.title}>
          سورة {name || 'القرآن الكريم'}
        </Text>

        <Text style={styles.subtitle}>
          بسم الله الرحمن الرحيم
        </Text>

        {audioInfo?.surah_audio && (
          <View style={styles.audioCard}>
            <Text style={styles.reciter}>
              القارئ: {audioInfo.reciter || 'مشاري العفاسي'}
            </Text>

            <Text style={styles.audioStyle}>
              رواية التلاوة: {audioInfo.style || 'Murattal'}
            </Text>

            <Pressable
              style={styles.playButton}
              onPress={toggleAudio}
            >
              <Text style={styles.playButtonText}>
                {status.playing ? '⏸ إيقاف مؤقت' : '▶ تشغيل السورة'}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#075B46" />
          <Text style={styles.message}>جاري تحميل الآيات...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.message}>{error}</Text>

          <Pressable style={styles.retry} onPress={loadAyahs}>
            <Text style={styles.retryText}>إعادة المحاولة</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={ayahs}
          keyExtractor={(item, index) =>
            String(item.ayah ?? index + 1)
          }
          contentContainerStyle={styles.list}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          renderItem={({ item, index }) => {
            const ayahNumber = item.ayah ?? index + 1;

            return (
              <Pressable
                onPress={() => handleAyahPress(ayahNumber)}
                style={[
                  styles.ayahCard,
                  Number(ayah) === ayahNumber &&
                    styles.selectedAyah,
                ]}
              >
                <Text style={styles.ayahText}>
                  {item.arabic ?? ''}
                </Text>

                <Text style={styles.translationText}>
                  {item.translations?.french ??
                    'Traduction non disponible'}
                </Text>

                <View style={styles.ayahFooter}>
                  <Text style={styles.ayahNumber}>
                    {ayahNumber}
                  </Text>
                </View>
              </Pressable>
            );
          }}
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
    alignItems: 'center',
    padding: 22,
    borderBottomWidth: 1,
    borderBottomColor: '#EAE9DF',
  },
  back: {
    color: '#075B46',
    fontSize: 15,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#075B46',
  },
  subtitle: {
    color: '#B18B45',
    fontSize: 16,
    marginTop: 12,
  },
  audioCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 15,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#EAE9DF',
    alignItems: 'center',
  },
  reciter: {
    color: '#075B46',
    fontSize: 16,
    fontWeight: 'bold',
  },
  audioStyle: {
    color: '#888477',
    fontSize: 13,
    marginTop: 5,
  },
  playButton: {
    backgroundColor: '#075B46',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 12,
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  list: {
    padding: 18,
    paddingBottom: 35,
  },
  ayahCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  selectedAyah: {
    borderColor: '#D5B36A',
    borderWidth: 2,
  },
  ayahText: {
    fontSize: 25,
    lineHeight: 52,
    color: '#173F32',
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  translationText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#77776F',
    textAlign: 'left',
    writingDirection: 'ltr',
    marginTop: 16,
  },
  ayahFooter: {
    alignItems: 'flex-start',
    marginTop: 15,
  },
  ayahNumber: {
    color: '#FFFFFF',
    backgroundColor: '#075B46',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  message: {
    color: '#075B46',
    fontSize: 16,
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
