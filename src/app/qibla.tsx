
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { Magnetometer } from 'expo-sensors';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const API_URL = 'https://ummahapi.com/api/qibla';

const COLORS = {
  green: '#075B46',
  darkGreen: '#064536',
  gold: '#D5B36A',
  cream: '#F7F6EF',
  white: '#FFFFFF',
  text: '#203B32',
  muted: '#829087',
};

export default function QiblaScreen() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [compassBearing, setCompassBearing] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const [city, setCity] = useState('');

  useEffect(() => {
    loadQibla();

    // الحساس يخدم غير في الهاتف، ماشي في Web
    if (Platform.OS !== 'web') {
      try {
        Magnetometer.setUpdateInterval(250);

        const subscription = Magnetometer.addListener(({ x, y }) => {
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          angle = (angle + 360) % 360;
          setHeading(angle);
        });

        return () => subscription.remove();
      } catch (err) {
        console.log('Compass sensor error:', err);
      }
    }
  }, []);

  async function loadQibla() {
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

      // تحديد المدينة
      if (Platform.OS !== 'web') {
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
      } else {
        setCity('موقعك الحالي');
      }

      // جلب اتجاه القبلة من Ummah API
      const response = await fetch(
        `${API_URL}?lat=${latitude}&lng=${longitude}`
      );

      if (!response.ok) {
        throw new Error('api');
      }

      const result = await response.json();
      const data = result?.data ?? result;

      if (typeof data?.qibla_direction !== 'number') {
        throw new Error('data');
      }

      setQiblaDirection(data.qibla_direction);
      setCompassBearing(data.compass_bearing || '');
      setDistance(
        typeof data.distance_km === 'number'
          ? data.distance_km
          : null
      );
    } catch (err) {
      console.log('QIBLA ERROR:', err);

      if (err instanceof Error && err.message === 'permission') {
        setError('لازم تسمحي للتطبيق باستعمال الموقع.');
      } else {
        setError('تعذر تحديد اتجاه القبلة. حاولي مرة أخرى.');
      }
    } finally {
      setLoading(false);
    }
  }

  const arrowRotation =
    qiblaDirection !== null && heading !== null && Platform.OS !== 'web'
      ? qiblaDirection - heading
      : qiblaDirection ?? 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backText}>رجوع ←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>اتجاه القبلة</Text>

        <Text style={styles.headerSubtitle}>
          فَوَلِّ وَجْهَكَ شَطْرَ الْمَسْجِدِ الْحَرَامِ
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.locationCard}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationText}>
            {city || 'تحديد موقعك'}
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.green} />
            <Text style={styles.loadingText}>
              جاري تحديد اتجاه القبلة...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable
              style={styles.retryButton}
              onPress={loadQibla}
            >
              <Text style={styles.retryText}>إعادة المحاولة</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.compassCard}>
              <Text style={styles.compassTitle}>
                🕋 اتجاه الكعبة المشرفة
              </Text>

              <View style={styles.compass}>
                <Text style={styles.north}>شمال N</Text>
                <Text style={styles.east}>شرق E</Text>
                <Text style={styles.south}>جنوب S</Text>
                <Text style={styles.west}>غرب W</Text>

                <View style={styles.innerCircle}>
                  <Text
                    style={[
                      styles.arrow,
                      {
                        transform: [
                          { rotate: `${arrowRotation}deg` },
                        ],
                      },
                    ]}
                  >
                    ↑
                  </Text>
                  <Text style={styles.kaaba}>🕋</Text>
                </View>
              </View>

              <Text style={styles.directionText}>
                {compassBearing || 'اتجاه القبلة'}
              </Text>

              <Text style={styles.degreeText}>
                {qiblaDirection?.toFixed(2)}° من الشمال الحقيقي
              </Text>

              {Platform.OS === 'web' && (
                <Text style={styles.webNote}>
                  ملاحظة: في المتصفح يظهر الاتجاه بالنسبة للشمال،
                  أما البوصلة الحية فتحتاج إلى الهاتف.
                </Text>
              )}
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>
                📐 معلومات القبلة
              </Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>
                  {qiblaDirection?.toFixed(2)}°
                </Text>
                <Text style={styles.infoLabel}>زاوية القبلة</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoValue}>
                  {distance !== null
                    ? `${Math.round(distance).toLocaleString('en-US')} كم`
                    : '--'}
                </Text>
                <Text style={styles.infoLabel}>المسافة إلى مكة</Text>
              </View>
            </View>

            <View style={styles.tipCard}>
              <Text style={styles.tipTitle}>💡 طريقة الاستعمال</Text>
              <Text style={styles.tipText}>
                ضعي الهاتف بشكل أفقي وابتعدي عن المعادن والأجهزة
                المغناطيسية. حرّكيه ببطء حتى تستقر البوصلة.
              </Text>
              <Text style={styles.tipText}>
                البوصلة الإلكترونية تقريبية وقد تتأثر بمعايرة الهاتف
                والمجال المغناطيسي المحيط.
              </Text>
            </View>
          </>
        )}

        <Pressable
          style={styles.refreshButton}
          onPress={loadQibla}
          disabled={loading}
        >
          <Text style={styles.refreshText}>
            ↻ تحديث اتجاه القبلة
          </Text>
        </Pressable>

        <Text style={styles.footer}>
          اللهم ارزقنا صلاةً تقرّبنا إليك 🤍
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
    fontSize: 15,
    marginTop: 12,
    textAlign: 'center',
  },
  content: {
    padding: 18,
    paddingBottom: 35,
  },
  locationCard: {
    backgroundColor: COLORS.green,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  locationText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  compassCard: {
    backgroundColor: COLORS.white,
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  compassTitle: {
    color: COLORS.darkGreen,
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  compass: {
    width: 270,
    height: 270,
    borderRadius: 135,
    borderWidth: 5,
    borderColor: COLORS.gold,
    backgroundColor: '#F8F8F1',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerCircle: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: '#DDE6DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  north: {
    position: 'absolute',
    top: 8,
    color: COLORS.green,
    fontWeight: 'bold',
  },
  south: {
    position: 'absolute',
    bottom: 8,
    color: COLORS.green,
    fontWeight: 'bold',
  },
  east: {
    position: 'absolute',
    right: 8,
    color: COLORS.green,
    fontWeight: 'bold',
  },
  west: {
    position: 'absolute',
    left: 8,
    color: COLORS.green,
    fontWeight: 'bold',
  },
  arrow: {
    color: '#C28B32',
    fontSize: 100,
    lineHeight: 110,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  kaaba: {
    fontSize: 27,
    marginTop: -12,
  },
  directionText: {
    color: COLORS.green,
    fontSize: 23,
    fontWeight: 'bold',
    marginTop: 20,
  },
  degreeText: {
    color: COLORS.muted,
    fontSize: 14,
    marginTop: 8,
  },
  webNote: {
    color: COLORS.muted,
    fontSize: 12,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 12,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },
  infoTitle: {
    color: COLORS.darkGreen,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEA',
  },
  infoLabel: {
    color: COLORS.muted,
    fontSize: 15,
  },
  infoValue: {
    color: COLORS.green,
    fontSize: 17,
    fontWeight: 'bold',
  },
  tipCard: {
    backgroundColor: '#E8F0E9',
    padding: 18,
    borderRadius: 16,
    marginTop: 18,
  },
  tipTitle: {
    color: COLORS.darkGreen,
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'right',
    marginBottom: 10,
  },
  tipText: {
    color: COLORS.text,
    fontSize: 14,
    lineHeight: 24,
    textAlign: 'right',
    marginBottom: 8,
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
    marginTop: 18,
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
