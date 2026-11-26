
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COLORS = {
  green: '#075B46',
  darkGreen: '#064536',
  gold: '#D5B36A',
  cream: '#F7F6EF',
  white: '#FFFFFF',
  text: '#203B32',
  muted: '#829087',
};

export default function HomeScreen() {
  const router = useRouter();

  const [lastRead, setLastRead] = useState<{
    number: string;
    name: string;
    ayah: number;
  } | null>(null);

  useFocusEffect(
    useCallback(() => {
      async function loadLastRead() {
        try {
          const saved = await AsyncStorage.getItem('lastRead');

          if (saved) {
            setLastRead(JSON.parse(saved));
          } else {
            setLastRead(null);
          }
        } catch (error) {
          console.log('Loading last reading error:', error);
        }
      }

      loadLastRead();
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>
                السلام عليكم ورحمة الله 🌿
              </Text>
              <Text style={styles.subtitle}>
                رفيقك في رحلة القرآن الكريم
              </Text>
            </View>

            <View style={styles.profile}>
              <Text style={styles.profileIcon}>☪</Text>
            </View>
          </View>

          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>رفيق القرآن</Text>
            <Text style={styles.mainSubtitle}>
              اجعل القرآن نور يومك
            </Text>
          </View>

          {/* Ayat of the day */}
          <View style={styles.verseCard}>
            <Text style={styles.verseLabel}>✦ آية اليوم ✦</Text>

            <Text style={styles.verse}>
              ﴿ فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ﴾
            </Text>

            <Text style={styles.verseReference}>
              سورة الشرح • الآية 6
            </Text>

            <View style={styles.verseDivider} />

            <Text style={styles.verseFooter}>
              لا تنسَ وردك اليومي من القرآن الكريم
            </Text>
          </View>

          {/* Continue reading */}
          {lastRead && (
            <Pressable
              style={styles.continueCard}
              onPress={() =>
                router.push({
                  pathname: '/surah/[number]',
                  params: {
                    number: lastRead.number,
                    name: lastRead.name,
                    ayah: String(lastRead.ayah),
                  },
                })
              }
            >
              <Text style={styles.continueLabel}>
                📖 مواصلة القراءة
              </Text>

              <Text style={styles.continueName}>
                سورة {lastRead.name}
              </Text>

              <Text style={styles.continueAyah}>
                آخر آية وصلت لها: {lastRead.ayah}
              </Text>

              <Text style={styles.continueButton}>
                تابعي القراءة ←
              </Text>
            </Pressable>
          )}

          {/* Features */}
          <Text style={styles.sectionTitle}>اكتشف التطبيق</Text>

          <View style={styles.grid}>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/explore')}
            >
              <Text style={styles.featureIcon}>📖</Text>
              <Text style={styles.featureTitle}>القرآن الكريم</Text>
              <Text style={styles.featureDesc}>اقرأ وتدبر</Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/mushaf')}
            >
              <Text style={styles.featureIcon}>📖</Text>
              <Text style={styles.featureTitle}>المصحف الشريف</Text>
              <Text style={styles.featureDesc}>
                اقرأ القرآن الكريم صفحة بصفحة
              </Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/listen')}
            >
              <Text style={styles.featureIcon}>🎧</Text>
              <Text style={styles.featureTitle}>الاستماع</Text>
              <Text style={styles.featureDesc}>استمع للتلاوات</Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/memorize')}
            >
              <Text style={styles.featureIcon}>🧠</Text>
              <Text style={styles.featureTitle}>حفظ القرآن</Text>
              <Text style={styles.featureDesc}>اختبر حفظك</Text>
            </Pressable>



            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/tafsir')}
            >
              <Text style={styles.featureIcon}>📚</Text>
              <Text style={styles.featureTitle}>التفسير</Text>
              <Text style={styles.featureDesc}>
                افهم معاني الآيات
              </Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/adhkar')}
            >
              <Text style={styles.featureIcon}>🌿</Text>
              <Text style={styles.featureTitle}>الأذكار</Text>
              <Text style={styles.featureDesc}>
                أذكار الصباح والمساء
              </Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/hadith')}
            >
              <Text style={styles.featureIcon}>📜</Text>
              <Text style={styles.featureTitle}>الحديث الشريف</Text>
              <Text style={styles.featureDesc}>
                أحاديث النبي ﷺ
              </Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/asma')}
            >
              <Text style={styles.featureIcon}>✨</Text>
              <Text style={styles.featureTitle}>
                أسماء الله الحسنى
              </Text>
              <Text style={styles.featureDesc}>
                تعرّف على أسماء الله ومعانيها
              </Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/prayer-times')}
            >
              <Text style={styles.featureIcon}>🕌</Text>
              <Text style={styles.featureTitle}>مواقيت الصلاة</Text>
              <Text style={styles.featureDesc}>
                أوقات الصلوات الخمس
              </Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/mutashabihat')}
            >
              <Text style={styles.featureIcon}>📖</Text>
              <Text style={styles.featureTitle}>
                الآيات المتشابهة
              </Text>
              <Text style={styles.featureDesc}>
                اكتشف الآيات المتشابهة في القرآن الكريم
              </Text>
            </Pressable>

            <Pressable
              style={styles.featureCard}
              onPress={() => router.push('/qibla')}
            >
              <Text style={styles.featureIcon}>🕋</Text>
              <Text style={styles.featureTitle}>اتجاه القبلة</Text>
              <Text style={styles.featureDesc}>
                اعرف اتجاه الكعبة المشرفة
              </Text>
            </Pressable>

          </View>

          {/* Start reading */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>ابدأ القراءة</Text>

            <Pressable onPress={() => router.push('/explore')}>
              <Text style={styles.seeAll}>كل السور ←</Text>
            </Pressable>
          </View>

          <View style={styles.surahList}>

            <Pressable
              style={styles.surahCard}
              onPress={() =>
                router.push({
                  pathname: '/surah/[number]',
                  params: {
                    number: '1',
                    name: 'الفاتحة',
                  },
                })
              }
            >
              <View style={styles.surahNumber}>
                <Text style={styles.numberText}>1</Text>
              </View>

              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>سورة الفاتحة</Text>
                <Text style={styles.surahDetails}>
                  مكية • 7 آيات
                </Text>
              </View>

              <Text style={styles.surahArabic}>الْفَاتِحَة</Text>
            </Pressable>

            <Pressable
              style={styles.surahCard}
              onPress={() =>
                router.push({
                  pathname: '/surah/[number]',
                  params: {
                    number: '2',
                    name: 'البقرة',
                  },
                })
              }
            >
              <View style={styles.surahNumber}>
                <Text style={styles.numberText}>2</Text>
              </View>

              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>سورة البقرة</Text>
                <Text style={styles.surahDetails}>
                  مدنية • 286 آية
                </Text>
              </View>

              <Text style={styles.surahArabic}>الْبَقَرَة</Text>
            </Pressable>

            <Pressable
              style={styles.surahCard}
              onPress={() =>
                router.push({
                  pathname: '/surah/[number]',
                  params: {
                    number: '112',
                    name: 'الإخلاص',
                  },
                })
              }
            >
              <View style={styles.surahNumber}>
                <Text style={styles.numberText}>112</Text>
              </View>

              <View style={styles.surahInfo}>
                <Text style={styles.surahName}>سورة الإخلاص</Text>
                <Text style={styles.surahDetails}>
                  مكية • 4 آيات
                </Text>
              </View>

              <Text style={styles.surahArabic}>الإِخْلَاص</Text>
            </Pressable>

          </View>

          <Text style={styles.footer}>
            صُحبتك مع القرآن تبدأ بخطوة 🤍
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
    padding: 22,
    paddingBottom: 40,
  },

  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 35,
  },

  greeting: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
    textAlign: 'right',
  },

  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 7,
    textAlign: 'right',
  },

  profile: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5EBDD',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileIcon: {
    fontSize: 26,
    color: COLORS.green,
  },

  titleSection: {
    alignItems: 'center',
    marginBottom: 25,
  },

  mainTitle: {
    fontSize: 34,
    fontWeight: 'bold',
    color: COLORS.green,
  },

  mainSubtitle: {
    fontSize: 15,
    color: COLORS.muted,
    marginTop: 8,
  },

  verseCard: {
    backgroundColor: COLORS.green,
    borderRadius: 22,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
  },

  verseLabel: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  verse: {
    color: COLORS.white,
    fontSize: 25,
    lineHeight: 48,
    textAlign: 'center',
    fontWeight: 'bold',
  },

  verseReference: {
    color: '#E5D4A8',
    fontSize: 13,
    marginTop: 15,
  },

  verseDivider: {
    height: 1,
    backgroundColor: '#598575',
    width: '65%',
    marginVertical: 18,
  },

  verseFooter: {
    color: '#FFFFFF',
    fontSize: 13,
  },

  continueCard: {
    backgroundColor: '#E8F0E9',
    borderRadius: 18,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#D5E3D7',
  },

  continueLabel: {
    color: COLORS.gold,
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'right',
  },

  continueName: {
    color: COLORS.darkGreen,
    fontSize: 21,
    fontWeight: 'bold',
    textAlign: 'right',
    marginTop: 12,
  },

  continueAyah: {
    color: COLORS.muted,
    fontSize: 14,
    textAlign: 'right',
    marginTop: 7,
  },

  continueButton: {
    color: COLORS.green,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'left',
    marginTop: 15,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
    textAlign: 'right',
    marginBottom: 17,
  },

  grid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 30,
  },

  featureCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: COLORS.white,
    borderRadius: 17,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },

  featureIcon: {
    fontSize: 30,
    marginBottom: 12,
  },

  featureTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.darkGreen,
  },

  featureDesc: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 6,
    textAlign: 'center',
  },

  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    width: '100%',
  },

  seeAll: {
    color: COLORS.green,
    fontSize: 13,
    fontWeight: 'bold',
  },

  surahList: {
    flexDirection: 'column',
    width: '100%',
    gap: 0,
  },

  surahCard: {
    width: '100%',
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 15,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#EAE9DF',
  },

  surahNumber: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#E8F0E9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  numberText: {
    color: COLORS.green,
    fontWeight: 'bold',
  },

  surahInfo: {
    flex: 1,
    marginRight: 13,
  },

  surahName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'right',
  },

  surahDetails: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 5,
    textAlign: 'right',
  },

  surahArabic: {
    color: COLORS.green,
    fontSize: 16,
    fontWeight: 'bold',
  },

  footer: {
    textAlign: 'center',
    color: COLORS.muted,
    fontSize: 13,
    marginTop: 25,
  },
});
