
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_QURAN_AYAHS = 6236;

const MONTH_NAMES = [
  'جانفي', 'فيفري', 'مارس', 'أفريل',
  'ماي', 'جوان', 'جويلية', 'أوت',
  'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
];

const WEEK_DAYS = [
  'أحد', 'إثنين', 'ثلاثاء', 'أربعاء',
  'خميس', 'جمعة', 'سبت',
];

const surahs = [
  ['الفاتحة', 7], ['البقرة', 286], ['آل عمران', 200],
  ['النساء', 176], ['المائدة', 120], ['الأنعام', 165],
  ['الأعراف', 206], ['الأنفال', 75], ['التوبة', 129],
  ['يونس', 109], ['هود', 123], ['يوسف', 111],
  ['الرعد', 43], ['إبراهيم', 52], ['الحجر', 99],
  ['النحل', 128], ['الإسراء', 111], ['الكهف', 110],
  ['مريم', 98], ['طه', 135], ['الأنبياء', 112],
  ['الحج', 78], ['المؤمنون', 118], ['النور', 64],
  ['الفرقان', 77], ['الشعراء', 227], ['النمل', 93],
  ['القصص', 88], ['العنكبوت', 69], ['الروم', 60],
  ['لقمان', 34], ['السجدة', 30], ['الأحزاب', 73],
  ['سبأ', 54], ['فاطر', 45], ['يس', 83],
  ['الصافات', 182], ['ص', 88], ['الزمر', 75],
  ['غافر', 85], ['فصلت', 54], ['الشورى', 53],
  ['الزخرف', 89], ['الدخان', 59], ['الجاثية', 37],
  ['الأحقاف', 35], ['محمد', 38], ['الفتح', 29],
  ['الحجرات', 18], ['ق', 45], ['الذاريات', 60],
  ['الطور', 49], ['النجم', 62], ['القمر', 55],
  ['الرحمن', 78], ['الواقعة', 96], ['الحديد', 29],
  ['المجادلة', 22], ['الحشر', 24], ['الممتحنة', 13],
  ['الصف', 14], ['الجمعة', 11], ['المنافقون', 11],
  ['التغابن', 18], ['الطلاق', 12], ['التحريم', 12],
  ['الملك', 30], ['القلم', 52], ['الحاقة', 52],
  ['المعارج', 44], ['نوح', 28], ['الجن', 28],
  ['المزمل', 20], ['المدثر', 56], ['القيامة', 40],
  ['الإنسان', 31], ['المرسلات', 50], ['النبأ', 40],
  ['النازعات', 46], ['عبس', 42], ['التكوير', 29],
  ['الانفطار', 19], ['المطففين', 36], ['الانشقاق', 25],
  ['البروج', 22], ['الطارق', 17], ['الأعلى', 19],
  ['الغاشية', 26], ['الفجر', 30], ['البلد', 20],
  ['الشمس', 15], ['الليل', 21], ['الضحى', 11],
  ['الشرح', 8], ['التين', 8], ['العلق', 19],
  ['القدر', 5], ['البينة', 8], ['الزلزلة', 8],
  ['العاديات', 11], ['القارعة', 11], ['التكاثر', 8],
  ['العصر', 3], ['الهمزة', 9], ['الفيل', 5],
  ['قريش', 4], ['الماعون', 7], ['الكوثر', 3],
  ['الكافرون', 6], ['النصر', 3], ['المسد', 5],
  ['الإخلاص', 4], ['الفلق', 5], ['الناس', 6],
] as const;

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

type Stats = {
  readAyahs: string[];
  attempts: number;
  correctAnswers: number;
  dailyActivity: DailyActivity;
  currentKhatmaAyahs: string[];
  khatmaHistory: KhatmaHistoryEntry[];
  currentKhatmaStart: string | null;
};

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

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

function parseKhatmaHistory(
  data: string | null
): KhatmaHistoryEntry[] {
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

    if (
      result &&
      typeof result === 'object' &&
      !Array.isArray(result)
    ) {
      return result;
    }

    return {};
  } catch {
    return {};
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'غير متوفر';
  }

  return date.toLocaleDateString('ar-DZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getHistoryInfo(entry: KhatmaHistoryEntry) {
  if (typeof entry === 'string') {
    return {
      startedAt: null,
      completedAt: entry,
      durationDays: null,
    };
  }

  return {
    startedAt: entry.startedAt,
    completedAt: entry.completedAt,
    durationDays: entry.durationDays,
  };
}

function getDayLevel(count: number) {
  if (count === 0) return styles.dayEmpty;
  if (count <= 5) return styles.dayLevel1;
  if (count <= 15) return styles.dayLevel2;

  return styles.dayLevel3;
}

export default function StatisticsScreen() {
  const [stats, setStats] = useState<Stats>({
    readAyahs: [],
    attempts: 0,
    correctAnswers: 0,
    dailyActivity: {},
    currentKhatmaAyahs: [],
    khatmaHistory: [],
    currentKhatmaStart: null,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const [
        readingData,
        memorizationData,
        dailyData,
        currentKhatmaData,
        khatmaHistoryData,
        currentKhatmaStartData,
      ] = await Promise.all([
        AsyncStorage.getItem('quranReadAyahs'),
        AsyncStorage.getItem('quranMemorizeStats'),
        AsyncStorage.getItem('quranDailyActivity'),
        AsyncStorage.getItem('quranCurrentKhatmaAyahs'),
        AsyncStorage.getItem('quranKhatmaHistory'),
        AsyncStorage.getItem('quranCurrentKhatmaStart'),
      ]);

      const reading = parseArray(readingData);

      let memorization: any = {};

      try {
        memorization = memorizationData
          ? JSON.parse(memorizationData)
          : {};
      } catch {
        memorization = {};
      }

      setStats({
        readAyahs: [...new Set(reading)],
        attempts: Number(memorization.attempts) || 0,
        correctAnswers: Number(memorization.correctAnswers) || 0,
        dailyActivity: parseDailyActivity(dailyData),
        currentKhatmaAyahs: [
          ...new Set(parseArray(currentKhatmaData)),
        ],
        khatmaHistory: parseKhatmaHistory(khatmaHistoryData),
        currentKhatmaStart: currentKhatmaStartData || null,
      });
    } catch (error) {
      console.log('Statistics loading error:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      const load = async () => {
        setLoading(true);
        await loadStats();

        if (active) {
          setLoading(false);
        }
      };

      load();

      return () => {
        active = false;
      };
    }, [loadStats])
  );

  const refreshStats = async () => {
    if (refreshing) return;

    setRefreshing(true);

    try {
      await loadStats();
    } finally {
      setRefreshing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const today = getDateKey(new Date());

  // القراءة العامة: الآيات الفريدة المسجلة
  const readCount = stats.readAyahs.length;

  // تقدم السور
  const surahProgress = surahs.map(([surahName, totalAyahs], index) => {
    const surahNumber = index + 1;

    const read = stats.readAyahs.filter(
      key => Number(key.split(':')[0]) === surahNumber
    ).length;

    return {
      number: surahNumber,
      name: surahName,
      total: totalAyahs,
      read,
      percentage: Math.min(
        100,
        Math.round((read / totalAyahs) * 100)
      ),
    };
  });

  const readSurahsCount = surahProgress.filter(
    surah => surah.read > 0
  ).length;

  // التقويم السنوي حسب تاريخ القراءة المسجل
  const annualMonths = Array.from(
    { length: 12 },
    (_, monthIndex) => {
      const firstDay = new Date(
        currentYear,
        monthIndex,
        1
      ).getDay();

      const daysInMonth = new Date(
        currentYear,
        monthIndex + 1,
        0
      ).getDate();

      const cells: Array<{
        day: number;
        date: string;
        count: number;
        isToday: boolean;
      } | null> = [];

      for (let i = 0; i < firstDay; i++) {
        cells.push(null);
      }

      let monthTotal = 0;
      let activeDays = 0;

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(
          currentYear,
          monthIndex,
          day
        );

        const dateKey = getDateKey(date);

        const count = new Set(
          stats.dailyActivity[dateKey] || []
        ).size;

        cells.push({
          day,
          date: dateKey,
          count,
          isToday: dateKey === today,
        });

        monthTotal += count;

        if (count > 0) activeDays++;
      }

      while (cells.length % 7 !== 0) {
        cells.push(null);
      }

      const weeks = [];

      for (let i = 0; i < cells.length; i += 7) {
        weeks.push(cells.slice(i, i + 7));
      }

      return {
        name: MONTH_NAMES[monthIndex],
        weeks,
        monthTotal,
        activeDays,
      };
    }
  );

  // المجموع السنوي يعتمد على نفس مصدر القراءة العامة
  const annualReadCount = readCount;

  // الأيام النشطة تبقى محسوبة حسب التاريخ الفعلي
  const annualActiveDays = annualMonths.reduce(
    (total, month) => total + month.activeDays,
    0
  );

  // نشاط اليوم
  const todayAyahs = stats.dailyActivity[today] || [];
  const todayReadCount = new Set(todayAyahs).size;

  const todaySurahsCount = new Set(
    todayAyahs.map(key => key.split(':')[0])
  ).size;

  // الحفظ والمراجعة
  const memorizationRate =
    stats.attempts > 0
      ? Math.round(
          (stats.correctAnswers / stats.attempts) * 100
        )
      : 0;

  // الختمات
  const completedKhatmas = stats.khatmaHistory.length;

  const currentKhatmaCount = Math.min(
    stats.currentKhatmaAyahs.length,
    TOTAL_QURAN_AYAHS
  );

  const currentKhatmaRate = Math.round(
    (currentKhatmaCount / TOTAL_QURAN_AYAHS) * 100
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#075B46" />
        <Text style={styles.loadingText}>
          جاري تحميل الإحصائيات...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>إحصائياتي 📊</Text>
          <Text style={styles.subtitle}>
            تابع تقدمك في رحلة القرآن الكريم
          </Text>
        </View>

        {/* القراءة العامة */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📖 القراءة</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>{readCount}</Text>
              <Text style={styles.statLabel}>آية مسجلة</Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {readSurahsCount}
              </Text>
              <Text style={styles.statLabel}>
                سورة قرأت منها
              </Text>
            </View>
          </View>

          <Text style={styles.note}>
            يتم تسجيل الآيات عند ظهورها أثناء التمرير.
          </Text>
        </View>

        {/* نشاط اليوم */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🌞 نشاط اليوم</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {todayReadCount}
              </Text>
              <Text style={styles.statLabel}>
                آية قرأتها اليوم
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {todaySurahsCount}
              </Text>
              <Text style={styles.statLabel}>
                سورة اليوم
              </Text>
            </View>
          </View>
        </View>

        {/* التقويم السنوي */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📅 نشاطي خلال سنة {currentYear}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {annualReadCount}
              </Text>
              <Text style={styles.statLabel}>
                مجموع الآيات المقروءة
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {annualActiveDays}
              </Text>
              <Text style={styles.statLabel}>
                أيام القراءة
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          <Text style={styles.currentTitle}>
            📆 التقويم السنوي
          </Text>

          <View style={styles.legend}>
            <Text style={styles.legendText}>قليل</Text>
            <View style={[styles.legendBox, styles.dayLevel1]} />
            <View style={[styles.legendBox, styles.dayLevel2]} />
            <View style={[styles.legendBox, styles.dayLevel3]} />
            <Text style={styles.legendText}>كثير</Text>
          </View>

          {annualMonths.map(month => (
            <View key={month.name} style={styles.monthCard}>
              <View style={styles.monthHeader}>
                <Text style={styles.monthName}>
                  {month.name}
                </Text>

                <Text style={styles.monthTotal}>
                  {month.monthTotal} آية
                </Text>
              </View>

              <Text style={styles.monthDays}>
                {month.activeDays} يوم نشاط
              </Text>

              <View style={styles.calendarWeek}>
                {WEEK_DAYS.map(day => (
                  <View key={day} style={styles.calendarCell}>
                    <Text style={styles.weekDayText}>
                      {day}
                    </Text>
                  </View>
                ))}
              </View>

              {month.weeks.map((week, weekIndex) => (
                <View
                  key={`${month.name}-${weekIndex}`}
                  style={styles.calendarWeek}
                >
                  {week.map((day, dayIndex) => {
                    if (!day) {
                      return (
                        <View
                          key={`empty-${weekIndex}-${dayIndex}`}
                          style={styles.calendarCell}
                        />
                      );
                    }

                    return (
                      <View
                        key={day.date}
                        style={styles.calendarCell}
                      >
                        <View
                          style={[
                            styles.calendarDay,
                            getDayLevel(day.count),
                            day.isToday && styles.todayCalendarDay,
                          ]}
                        >
                          <Text
                            style={[
                              styles.calendarDayText,
                              day.count > 0 && styles.activeDayText,
                            ]}
                          >
                            {day.day}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </View>
          ))}

          <Text style={styles.note}>
            كل سطر يمثل أسبوعاً، وكل مربع يمثل يوماً.
            اللون الأغمق يعني قراءة أكثر.
          </Text>
        </View>

        {/* الختمات */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🏆 ختماتي المكتملة
          </Text>

          <View style={styles.khatmaCenter}>
            <Text style={styles.khatmaNumber}>
              {completedKhatmas}
            </Text>

            <Text style={styles.statLabel}>
              ختمة كاملة
            </Text>
          </View>

          <View style={styles.separator} />

          <Text style={styles.currentTitle}>
            📖 الختمة الحالية
          </Text>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              {currentKhatmaCount} من {TOTAL_QURAN_AYAHS} آية
            </Text>

            <Text style={styles.percentage}>
              {currentKhatmaRate}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${currentKhatmaRate}%` },
              ]}
            />
          </View>

          {stats.currentKhatmaStart && (
            <Text style={styles.khatmaDate}>
              📅 تاريخ بداية الختمة:{' '}
              {formatDate(stats.currentKhatmaStart)}
            </Text>
          )}

          {completedKhatmas > 0 && (
            <Text style={styles.congratulations}>
              🎉 بارك الله فيك! أكملتِ {completedKhatmas} ختمة.
            </Text>
          )}

          <Text style={styles.note}>
            تُحسب الختمة عند تسجيل جميع آيات القرآن الـ6236.
          </Text>

          <View style={styles.separator} />

          <Text style={styles.currentTitle}>
            📜 سجل الختمات
          </Text>

          {stats.khatmaHistory.length === 0 ? (
            <Text style={styles.emptyHistory}>
              لم تُكملي أي ختمة بعد، نسأل الله لكِ التوفيق 🤍
            </Text>
          ) : (
            [...stats.khatmaHistory].reverse().map((entry, index) => {
              const info = getHistoryInfo(entry);

              return (
                <View
                  key={`khatma-${index}`}
                  style={styles.historyItem}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyTitle}>
                      الختمة رقم {stats.khatmaHistory.length - index}
                    </Text>

                    <Text style={styles.historyIcon}>🏆</Text>
                  </View>

                  <Text style={styles.historyText}>
                    📅 تاريخ البداية:{' '}
                    {info.startedAt
                      ? formatDate(info.startedAt)
                      : 'غير متوفر (ختمة قديمة)'}
                  </Text>

                  <Text style={styles.historyText}>
                    ✅ تاريخ الإكمال: {formatDate(info.completedAt)}
                  </Text>

                  <Text style={styles.historyText}>
                    ⏳ المدة:{' '}
                    {info.durationDays !== null &&
                    info.durationDays !== undefined
                      ? `${info.durationDays} يوم`
                      : 'غير متوفرة'}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* تقدم السور */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            📚 تقدمي في السور
          </Text>

          {surahProgress.map(surah => (
            <View key={surah.number} style={styles.surahItem}>
              <View style={styles.surahHeader}>
                <Text style={styles.surahName}>
                  {surah.number}. سورة {surah.name}
                </Text>

                <Text style={styles.surahCount}>
                  {surah.read}/{surah.total}
                </Text>
              </View>

              <View style={styles.progressBackground}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${surah.percentage}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* الحفظ والمراجعة */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            🧠 الحفظ والمراجعة
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {stats.attempts}
              </Text>
              <Text style={styles.statLabel}>
                مجموع المحاولات
              </Text>
            </View>

            <View style={styles.statBox}>
              <Text style={styles.statNumber}>
                {stats.correctAnswers}
              </Text>
              <Text style={styles.statLabel}>
                إجابات صحيحة
              </Text>
            </View>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>
              نسبة الإجابات الصحيحة
            </Text>

            <Text style={styles.percentage}>
              {memorizationRate}%
            </Text>
          </View>

          <View style={styles.progressBackground}>
            <View
              style={[
                styles.progressFill,
                { width: `${memorizationRate}%` },
              ]}
            />
          </View>
        </View>

        <Pressable
          style={[
            styles.refreshButton,
            refreshing && styles.refreshButtonDisabled,
          ]}
          onPress={refreshStats}
          disabled={refreshing}
        >
          {refreshing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.refreshText}>
              🔄 تحديث الإحصائيات
            </Text>
          )}
        </Pressable>

        <Text style={styles.footer}>
          اللهم اجعل القرآن ربيع قلوبنا ونور صدورنا 🤍
        </Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F7F6EF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#075B46',
  },
  header: {
    marginBottom: 25,
    marginTop: 15,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#075B46',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E9E5D8',
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#075B46',
    textAlign: 'right',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#B89552',
  },
  statLabel: {
    fontSize: 13,
    color: '#777',
    marginTop: 6,
    textAlign: 'center',
  },
  note: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 18,
    lineHeight: 20,
  },
  separator: {
    height: 1,
    backgroundColor: '#EAE9DF',
    marginVertical: 20,
  },
  currentTitle: {
    fontSize: 16,
    color: '#075B46',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    marginTop: 18,
    marginBottom: 20,
  },
  legendText: {
    fontSize: 11,
    color: '#777',
  },
  legendBox: {
    width: 15,
    height: 15,
    borderRadius: 4,
  },
  monthCard: {
    backgroundColor: '#FAFAF6',
    borderRadius: 14,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  monthName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#075B46',
  },
  monthTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#B89552',
  },
  monthDays: {
    color: '#888',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 12,
  },
  calendarWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  calendarCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDayText: {
    fontSize: 9,
    color: '#777',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  calendarDay: {
    width: '85%',
    aspectRatio: 1,
    maxWidth: 38,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEEDE6',
  },
  calendarDayText: {
    fontSize: 11,
    color: '#888',
  },
  activeDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  dayEmpty: {
    backgroundColor: '#EEEDE6',
  },
  dayLevel1: {
    backgroundColor: '#B7D5C8',
  },
  dayLevel2: {
    backgroundColor: '#4D9878',
  },
  dayLevel3: {
    backgroundColor: '#075B46',
  },
  todayCalendarDay: {
    borderWidth: 2,
    borderColor: '#D5A94D',
  },
  surahItem: {
    marginBottom: 17,
  },
  surahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  surahName: {
    color: '#173F32',
    fontSize: 14,
    fontWeight: '600',
  },
  surahCount: {
    color: '#B89552',
    fontSize: 13,
    fontWeight: 'bold',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
    marginBottom: 10,
  },
  progressLabel: {
    color: '#555',
    fontSize: 13,
  },
  percentage: {
    color: '#075B46',
    fontWeight: 'bold',
  },
  progressBackground: {
    height: 9,
    backgroundColor: '#EAE8DF',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#075B46',
    borderRadius: 10,
  },
  khatmaCenter: {
    alignItems: 'center',
    marginBottom: 5,
  },
  khatmaNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#B89552',
  },
  congratulations: {
    color: '#075B46',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 18,
  },
  khatmaDate: {
    color: '#777',
    textAlign: 'right',
    fontSize: 13,
    marginTop: 14,
  },
  emptyHistory: {
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
  },
  historyItem: {
    backgroundColor: '#FAFAF6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE9DF',
    padding: 14,
    marginTop: 12,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    color: '#075B46',
    fontWeight: 'bold',
    fontSize: 15,
  },
  historyIcon: {
    fontSize: 19,
  },
  historyText: {
    color: '#666',
    textAlign: 'right',
    fontSize: 13,
    marginTop: 7,
    lineHeight: 21,
  },
  refreshButton: {
    backgroundColor: '#075B46',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 5,
  },
  refreshButtonDisabled: {
    opacity: 0.7,
  },
  refreshText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  footer: {
    textAlign: 'center',
    color: '#999',
    marginTop: 25,
    fontSize: 13,
  },
});
