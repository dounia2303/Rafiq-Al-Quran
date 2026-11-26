
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const TOTAL_PAGES = 604;
const TOTAL_DAYS = 30;
const STORAGE_KEY = 'quranKhatmaProgress';

export default function KhatmaScreen() {
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgress();
  }, []);

  async function loadProgress() {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);

      if (saved) {
        setCompletedDays(JSON.parse(saved));
      }
    } catch (error) {
      console.log('Khatma loading error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function toggleDay(day: number) {
    const updated = completedDays.includes(day)
      ? completedDays.filter(item => item !== day)
      : [...completedDays, day];

    setCompletedDays(updated);

    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.log('Khatma saving error:', error);
    }
  }

  function getPageRange(day: number) {
    const start = Math.floor((day - 1) * TOTAL_PAGES / TOTAL_DAYS) + 1;
    const end = Math.floor(day * TOTAL_PAGES / TOTAL_DAYS);

    return { start, end };
  }

  const progress = Math.round(
    (completedDays.length / TOTAL_DAYS) * 100
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ActivityIndicator size="large" color="#075B46" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          <Text style={styles.title}>ختمة القرآن الكريم</Text>
          <Text style={styles.subtitle}>
            رحلة إيمانية لإتمام قراءة القرآن في 30 يوماً 🌿
          </Text>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>
              تقدمك في الختمة
            </Text>

            <Text style={styles.progressNumber}>
              {progress}%
            </Text>

            <View style={styles.progressBackground}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progress}%` },
                ]}
              />
            </View>

            <Text style={styles.progressDetails}>
              أكملتِ {completedDays.length} من 30 يوماً
            </Text>

            <Text style={styles.remaining}>
              {TOTAL_DAYS - completedDays.length} يوم متبقي
            </Text>
          </View>

          <Text style={styles.sectionTitle}>
            برنامج الختمة 📖
          </Text>

          {Array.from({ length: TOTAL_DAYS }, (_, index) => {
            const day = index + 1;
            const { start, end } = getPageRange(day);
            const isCompleted = completedDays.includes(day);

            return (
              <View key={day} style={styles.dayCard}>
                <View style={styles.dayInfo}>
                  <Text style={styles.dayTitle}>
                    اليوم {day}
                  </Text>

                  <Text style={styles.pageText}>
                    من الصفحة {start} إلى الصفحة {end}
                  </Text>

                  <Text style={styles.pageCount}>
                    {end - start + 1} صفحة
                  </Text>
                </View>

                <Pressable
                  style={[
                    styles.checkButton,
                    isCompleted && styles.completedButton,
                  ]}
                  onPress={() => toggleDay(day)}
                >
                  <Text
                    style={[
                      styles.checkText,
                      isCompleted && styles.completedText,
                    ]}
                  >
                    {isCompleted ? '✓ مكتمل' : 'إتمام الورد'}
                  </Text>
                </Pressable>
              </View>
            );
          })}

          {completedDays.length === TOTAL_DAYS && (
            <View style={styles.finishedCard}>
              <Text style={styles.finishedTitle}>
                🎉 مبارك عليكِ!
              </Text>
              <Text style={styles.finishedText}>
                أتممتِ ختمة القرآن الكريم، تقبل الله منكِ.
              </Text>
            </View>
          )}

          <Pressable
            style={styles.resetButton}
            onPress={async () => {
              setCompletedDays([]);
              await AsyncStorage.removeItem(STORAGE_KEY);
            }}
          >
            <Text style={styles.resetText}>
              إعادة الختمة من البداية
            </Text>
          </Pressable>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F6EF',
  },
  container: {
    width: '100%',
    maxWidth: 850,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#075B46',
    textAlign: 'center',
    marginTop: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#829087',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 25,
  },
  progressCard: {
    backgroundColor: '#075B46',
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 30,
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },
  progressNumber: {
    color: '#D5B36A',
    fontSize: 38,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  progressBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#527B6D',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#D5B36A',
    borderRadius: 10,
  },
  progressDetails: {
    color: '#FFFFFF',
    marginTop: 15,
    fontSize: 14,
  },
  remaining: {
    color: '#E5D4A8',
    marginTop: 7,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#064536',
    textAlign: 'right',
    marginBottom: 15,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  dayInfo: {
    flex: 1,
    alignItems: 'flex-end',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#064536',
  },
  pageText: {
    fontSize: 13,
    color: '#829087',
    marginTop: 6,
  },
  pageCount: {
    fontSize: 12,
    color: '#D5B36A',
    marginTop: 4,
  },
  checkButton: {
    backgroundColor: '#E8F0E9',
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderRadius: 12,
    marginRight: 12,
  },
  completedButton: {
    backgroundColor: '#075B46',
  },
  checkText: {
    color: '#075B46',
    fontWeight: 'bold',
    fontSize: 12,
  },
  completedText: {
    color: '#FFFFFF',
  },
  finishedCard: {
    backgroundColor: '#E8F0E9',
    padding: 22,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 15,
  },
  finishedTitle: {
    color: '#075B46',
    fontSize: 21,
    fontWeight: 'bold',
  },
  finishedText: {
    color: '#203B32',
    textAlign: 'center',
    marginTop: 10,
  },
  resetButton: {
    alignItems: 'center',
    padding: 15,
    marginTop: 15,
  },
  resetText: {
    color: '#A45B4A',
    fontWeight: 'bold',
  },
});
