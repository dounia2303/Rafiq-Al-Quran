
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
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

const API_URL = 'https://ummahapi.com/api/prayer-times';

const COLORS = {
  green: '#075B46',
  darkGreen: '#064536',
  gold: '#D5B36A',
  cream: '#F7F6EF',
  white: '#FFFFFF',
  text: '#203B32',
  muted: '#829087',
};

const prayers = [
  { key: 'Fajr', name: 'الفجر', icon: '🌅' },
  { key: 'Dhuhr', name: 'الظهر', icon: '☀️' },
  { key: 'Asr', name: 'العصر', icon: '🌤️' },
  { key: 'Maghrib', name: 'المغرب', icon: '🌇' },
  { key: 'Isha', name: 'العشاء', icon: '🌙' },
];

const apiKeys: Record<string, string> = {
  Fajr: 'fajr',
  Dhuhr: 'dhuhr',
  Asr: 'asr',
  Maghrib: 'maghrib',
  Isha: 'isha',
};

export default function PrayerTimesScreen() {
  const router = useRouter();

  const [times, setTimes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  async function loadPrayerTimes() {
    try {
      setLoading(true);
      setError('');

      const permission =
        await Location.requestForegroundPermissionsAsync();

      if (permission.status !== 'granted') {
        throw new Error('permission');
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;

      try {
        const address = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (address.length > 0) {
          setCity(
            address[0].city ||
              address[0].district ||
              address[0].region ||
              'موقعك الحالي'
          );
        }
      } catch {
        setCity('موقعك الحالي');
      }

      const url =
        `${API_URL}?lat=${latitude}&lng=${longitude}` +
        '&timezone=Africa%2FAlgiers';

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('api');
      }

      const result = await response.json();

      console.log(
        'PRAYER API RESPONSE:',
        JSON.stringify(result)
      );

      const payload = result?.data ?? result;

      const timings =
        payload?.prayer_times ??
        payload?.timings ??
        payload;

      const newTimes: Record<string, string> = {};

      for (const key of Object.keys(apiKeys)) {
        const value = timings?.[apiKeys[key]];

        if (value !== undefined && value !== null) {
          newTimes[key] = String(value);
        }
      }

      if (
        !Object.keys(apiKeys).every((key) => newTimes[key])
      ) {
        throw new Error('data');
      }

      setTimes(newTimes);
    } catch (err) {
      console.log('PRAYER TIMES ERROR:', err);

      if (err instanceof Error && err.message === 'permission') {
        setError(
          'لازم تسمحي للتطبيق باستعمال الموقع لحساب مواقيت الصلاة.'
        );
      } else if (err instanceof Error && err.message === 'data') {
        setError('تعذر قراءة مواقيت الصلاة من الخادم.');
      } else {
        setError(
          'تعذر تحميل مواقيت الصلاة. تحققي من الإنترنت وحاولي مجددًا.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const today = new Date().toLocaleDateString('ar-DZ', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>رجوع ←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>مواقيت الصلاة</Text>

        <Text style={styles.headerSubtitle}>
          إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.dateCard}>
          <Text style={styles.dateIcon}>🕌</Text>

          <Text style={styles.dateText}>{today}</Text>

          <Text style={styles.cityText}>
            📍 {city || 'تحديد موقعك'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator
              size="large"
              color={COLORS.green}
            />

            <Text style={styles.loadingText}>
              جاري حساب مواقيت الصلاة...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={loadPrayerTimes}
            >
              <Text style={styles.retryText}>
                إعادة المحاولة
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.prayersContainer}>
            <Text style={styles.sectionTitle}>
              الصلوات الخمس
            </Text>

            {prayers.map((prayer) => (
              <View
                key={prayer.key}
                style={styles.prayerCard}
              >
                <View style={styles.prayerInfo}>
                  <Text style={styles.prayerIcon}>
                    {prayer.icon}
                  </Text>

                  <Text style={styles.prayerName}>
                    {prayer.name}
                  </Text>
                </View>

                <Text style={styles.prayerTime}>
                  {times[prayer.key] || '--:--'}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Pressable
          style={styles.refreshButton}
          onPress={loadPrayerTimes}
          disabled={loading}
        >
          <Text style={styles.refreshText}>
            ↻ تحديث المواقيت
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          اللهم اجعلنا من مقيمي الصلاة 🤍
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backText: {
    color: COLORS.white,
    fontSize: 14,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 25,
    fontWeight: 'bold',
    marginTop: 8,
  },
  headerSubtitle: {
    color: '#E5D4A8',
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  dateCard: {
    backgroundColor: COLORS.green,
    padding: 22,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 25,
  },
  dateIcon: {
    fontSize: 35,
  },
  dateText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 10,
  },
  cityText: {
    color: '#E5D4A8',
    fontSize: 14,
    marginTop: 10,
  },
  sectionTitle: {
    color: COLORS.darkGreen,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 15,
  },
  prayersContainer: {
    marginBottom: 15,
  },
  prayerCard: {
    backgroundColor: COLORS.white,
    padding: 17,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  prayerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerIcon: {
    fontSize: 23,
    marginRight: 12,
  },
  prayerName: {
    color: COLORS.darkGreen,
    fontSize: 17,
    fontWeight: 'bold',
  },
  prayerTime: {
    color: COLORS.green,
    fontSize: 21,
    fontWeight: 'bold',
  },
  center: {
    padding: 35,
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.muted,
    marginTop: 15,
  },
  errorCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
  },
  errorText: {
    color: '#B3261E',
    textAlign: 'center',
    lineHeight: 25,
  },
  retryButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 15,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  refreshButton: {
    backgroundColor: '#E8F0E9',
    padding: 15,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  refreshText: {
    color: COLORS.green,
    fontWeight: 'bold',
    fontSize: 15,
  },
  footer: {
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 25,
  },
});
