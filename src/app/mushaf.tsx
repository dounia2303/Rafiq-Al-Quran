
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    PanResponder,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TOTAL_PAGES = 604;
const DUA_PAGE = 605;

const COLORS = {
  green: '#075B46',
  darkGreen: '#064536',
  cream: '#F5EFDF',
  paper: '#FFFCF2',
  gold: '#B89552',
};

const SURAH_LIST = [
  { name: 'الفاتحة', page: 1 },
  { name: 'البقرة', page: 2 },
  { name: 'آل عمران', page: 50 },
  { name: 'النساء', page: 77 },
  { name: 'المائدة', page: 106 },
  { name: 'الأنعام', page: 128 },
  { name: 'الأعراف', page: 151 },
  { name: 'الأنفال', page: 177 },
  { name: 'التوبة', page: 187 },
  { name: 'يونس', page: 208 },
  { name: 'هود', page: 221 },
  { name: 'يوسف', page: 235 },
  { name: 'الرعد', page: 249 },
  { name: 'إبراهيم', page: 255 },
  { name: 'الحجر', page: 262 },
  { name: 'النحل', page: 267 },
  { name: 'الإسراء', page: 282 },
  { name: 'الكهف', page: 293 },
  { name: 'مريم', page: 305 },
  { name: 'طه', page: 312 },
  { name: 'الأنبياء', page: 322 },
  { name: 'الحج', page: 332 },
  { name: 'المؤمنون', page: 342 },
  { name: 'النور', page: 350 },
  { name: 'الفرقان', page: 359 },
  { name: 'الشعراء', page: 367 },
  { name: 'النمل', page: 377 },
  { name: 'القصص', page: 385 },
  { name: 'العنكبوت', page: 396 },
  { name: 'الروم', page: 404 },
  { name: 'لقمان', page: 411 },
  { name: 'السجدة', page: 415 },
  { name: 'الأحزاب', page: 418 },
  { name: 'سبأ', page: 428 },
  { name: 'فاطر', page: 434 },
  { name: 'يس', page: 440 },
  { name: 'الصافات', page: 446 },
  { name: 'ص', page: 453 },
  { name: 'الزمر', page: 458 },
  { name: 'غافر', page: 467 },
  { name: 'فصلت', page: 477 },
  { name: 'الشورى', page: 483 },
  { name: 'الزخرف', page: 489 },
  { name: 'الدخان', page: 496 },
  { name: 'الجاثية', page: 499 },
  { name: 'الأحقاف', page: 502 },
  { name: 'محمد', page: 507 },
  { name: 'الفتح', page: 511 },
  { name: 'الحجرات', page: 515 },
  { name: 'ق', page: 518 },
  { name: 'الذاريات', page: 520 },
  { name: 'الطور', page: 523 },
  { name: 'النجم', page: 526 },
  { name: 'القمر', page: 528 },
  { name: 'الرحمن', page: 531 },
  { name: 'الواقعة', page: 534 },
  { name: 'الحديد', page: 537 },
  { name: 'المجادلة', page: 542 },
  { name: 'الحشر', page: 545 },
  { name: 'الممتحنة', page: 549 },
  { name: 'الصف', page: 551 },
  { name: 'الجمعة', page: 553 },
  { name: 'المنافقون', page: 554 },
  { name: 'التغابن', page: 556 },
  { name: 'الطلاق', page: 558 },
  { name: 'التحريم', page: 560 },
  { name: 'الملك', page: 562 },
  { name: 'القلم', page: 564 },
  { name: 'الحاقة', page: 566 },
  { name: 'المعارج', page: 568 },
  { name: 'نوح', page: 570 },
  { name: 'الجن', page: 572 },
  { name: 'المزمل', page: 574 },
  { name: 'المدثر', page: 575 },
  { name: 'القيامة', page: 577 },
  { name: 'الإنسان', page: 578 },
  { name: 'المرسلات', page: 580 },
  { name: 'النبأ', page: 582 },
  { name: 'النازعات', page: 583 },
  { name: 'عبس', page: 585 },
  { name: 'التكوير', page: 586 },
  { name: 'الانفطار', page: 587 },
  { name: 'المطففين', page: 587 },
  { name: 'الانشقاق', page: 589 },
  { name: 'البروج', page: 590 },
  { name: 'الطارق', page: 591 },
  { name: 'الأعلى', page: 591 },
  { name: 'الغاشية', page: 592 },
  { name: 'الفجر', page: 593 },
  { name: 'البلد', page: 594 },
  { name: 'الشمس', page: 595 },
  { name: 'الليل', page: 595 },
  { name: 'الضحى', page: 596 },
  { name: 'الشرح', page: 596 },
  { name: 'التين', page: 597 },
  { name: 'العلق', page: 597 },
  { name: 'القدر', page: 598 },
  { name: 'البينة', page: 598 },
  { name: 'الزلزلة', page: 599 },
  { name: 'العاديات', page: 599 },
  { name: 'القارعة', page: 600 },
  { name: 'التكاثر', page: 600 },
  { name: 'العصر', page: 601 },
  { name: 'الهمزة', page: 601 },
  { name: 'الفيل', page: 601 },
  { name: 'قريش', page: 602 },
  { name: 'الماعون', page: 602 },
  { name: 'الكوثر', page: 602 },
  { name: 'الكافرون', page: 603 },
  { name: 'النصر', page: 603 },
  { name: 'المسد', page: 603 },
  { name: 'الإخلاص', page: 604 },
  { name: 'الفلق', page: 604 },
  { name: 'الناس', page: 604 },
];

export default function MushafScreen() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [surahModalVisible, setSurahModalVisible] = useState(false);

  const pageImageUrl =
    `https://files.quran.app/hafs/madani/width_1024/page${String(page).padStart(3, '0')}.png`;

  const nextPage = useCallback(() => {
    setPage(current => {
      if (current < TOTAL_PAGES) {
        setLoading(true);
        setError(false);
        return current + 1;
      }

      if (current === TOTAL_PAGES) {
        setLoading(false);
        setError(false);
        return DUA_PAGE;
      }

      return current;
    });
  }, []);

  const previousPage = useCallback(() => {
    setPage(current => {
      if (current > 1) {
        setLoading(true);
        setError(false);
        return current - 1;
      }
      return current;
    });
  }, []);

  const selectSurah = (surahPage: number) => {
    setSurahModalVisible(false);
    setError(false);
    setLoading(true);
    setPage(surahPage);
  };

  const retryLoading = () => {
    setError(false);
    setLoading(true);
    setRetryKey(current => current + 1);
  };

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nextPage();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        previousPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [nextPage, previousPage]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 25 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,

        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx < -50) {
            nextPage();
          } else if (gesture.dx > 50) {
            previousPage();
          }
        },
      }),
    [nextPage, previousPage]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>رجوع ←</Text>
        </Pressable>

        <Text style={styles.headerTitle}>المصحف الشريف</Text>
        <Text style={styles.headerIcon}>📖</Text>
      </View>

      <View style={styles.topInfo}>
        <Text style={styles.topTitle}>
          {page === DUA_PAGE
            ? 'دُعَاءُ خَتْمِ الْقُرْآنِ'
            : 'الْقُرْآنُ الْكَرِيمُ'}
        </Text>

        <Text style={styles.pageNumber}>
          {page === DUA_PAGE
            ? 'دعاء ختم القرآن الكريم'
            : `الصفحة ${page} من ${TOTAL_PAGES}`}
        </Text>
      </View>

      <Pressable
        style={styles.chooseSurahButton}
        onPress={() => setSurahModalVisible(true)}
      >
        <Text style={styles.chooseSurahText}>
          ☰ اختيار السورة
        </Text>
      </Pressable>

      <View style={styles.bookArea}>
        {page <= TOTAL_PAGES ? (
          <View
            style={styles.paper}
            {...panResponder.panHandlers}
          >
            <View style={styles.outerBorder}>
              <View style={styles.innerBorder}>
                <Image
                  key={`${page}-${retryKey}`}
                  source={{ uri: pageImageUrl }}
                  style={styles.mushafImage}
                  resizeMode="contain"
                  onLoadStart={() => {
                    setLoading(true);
                    setError(false);
                  }}
                  onLoad={() => {
                    setLoading(false);
                    setError(false);
                  }}
                  onError={() => {
                    setLoading(false);
                    setError(true);
                  }}
                />

                {loading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator
                      size="large"
                      color={COLORS.green}
                    />
                    <Text style={styles.loadingText}>
                      جاري تحميل صفحة المصحف...
                    </Text>
                  </View>
                )}

                {error && (
                  <View style={styles.errorOverlay}>
                    <Text style={styles.errorText}>
                      تعذر تحميل صورة الصفحة
                    </Text>

                    <Pressable
                      style={styles.retryButton}
                      onPress={retryLoading}
                    >
                      <Text style={styles.retryText}>
                        إعادة المحاولة
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </View>
        ) : (
          <ScrollView
            style={styles.duaScroll}
            contentContainerStyle={styles.duaContent}
          >
            <View style={styles.duaBorder}>
              <Text style={styles.duaIcon}>🤲</Text>

              <Text style={styles.duaTitle}>
                دعاء ختم القرآن الكريم
              </Text>

              <View style={styles.duaLine} />

              <Text style={styles.duaText}>
                اللَّهُمَّ ارْحَمْنِي بالقُرْءَانِ وَاجْعَلهُ لِي إِمَاماً وَنُوراً وَهُدًى وَرَحْمَةً ۞

                {'\n\n'}

                اللَّهُمَّ ذَكِّرْنِي مِنْهُ مَانَسِيتُ وَعَلِّمْنِي مِنْهُ مَاجَهِلْتُ وَارْزُقْنِي تِلاَوَتَهُ آنَاءَ اللَّيْلِ وَأَطْرَافَ النَّهَارِ وَاجْعَلْهُ لِي حُجَّةً يَارَبَّ العَالَمِينَ ۞

                {'\n\n'}

                اللَّهُمَّ أَصْلِحْ لِي دِينِي الَّذِي هُوَ عِصْمَةُ أَمْرِي وَأَصْلِحْ لِي دُنْيَايَ الَّتِي فِيهَا مَعَاشِي وَأَصْلِحْ لِي آخِرَتِي الَّتِي فِيهَا مَعَادِي وَاجْعَلِ الحَيَاةَ زِيَادَةً لِي فِي كُلِّ خَيْرٍ وَاجْعَلِ المَوْتَ رَاحَةً لِي مِنْ كُلِّ شَرٍّ ۞

                {'\n\n'}

                اللَّهُمَّ اجْعَلْ خَيْرَ عُمْرِي آخِرَهُ وَخَيْرَ عَمَلِي خَوَاتِمَهُ وَخَيْرَ أَيَّامِي يَوْمَ أَلْقَاكَ فِيهِ ۞

                {'\n\n'}

                اللَّهُمَّ إِنِّي أَسْأَلُكَ عِيشَةً هَنِيَّةً وَمِيتَةً سَوِيَّةً وَمَرَدًّا غَيْرَ مُخْزٍ وَلاَ فَاضِحٍ ۞

                {'\n\n'}

                اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ المَسْأَلةِ وَخَيْرَ الدُّعَاءِ وَخَيْرَ النَّجَاحِ وَخَيْرَ العِلْمِ وَخَيْرَ العَمَلِ وَخَيْرَ الثَّوَابِ وَخَيْرَ الحَيَاةِ وَخيْرَ المَمَاتِ وَثَبِّتْنِي وَثَقِّلْ مَوَازِينِي وَحَقِّقْ إِيمَانِي وَارْفَعْ دَرَجَتِي وَتَقَبَّلْ صَلاَتِي وَاغْفِرْ خَطِيئَاتِي وَأَسْأَلُكَ العُلَا مِنَ الجَنَّةِ ۞

                {'\n\n'}

                اللَّهُمَّ إِنِّي أَسْأَلُكَ مُوجِبَاتِ رَحْمَتِكَ وَعَزَائِمَ مَغْفِرَتِكَ وَالسَّلاَمَةَ مِنْ كُلِّ إِثْمٍ وَالغَنِيمَةَ مِنْ كُلِّ بِرٍّ وَالفَوْزَ بِالجَنَّةِ وَالنَّجَاةَ مِنَ النَّارِ ۞

                {'\n\n'}

                اللَّهُمَّ أَحْسِنْ عَاقِبَتَنَا فِي الأُمُورِ كُلِّهَا وَأجِرْنَا مِنْ خِزْيِ الدُّنْيَا وَعَذَابِ الآخِرَةِ ۞

                {'\n\n'}

                اللَّهُمَّ اقْسِمْ لَنَا مِنْ خَشْيَتِكَ مَاتَحُولُ بِهِ بَيْنَنَا وَبَيْنَ مَعْصِيَتِكَ وَمِنْ طَاعَتِكَ مَاتُبَلِّغُنَا بِهَا جَنَّتَكَ وَمِنَ اليَقِينِ مَاتُهَوِّنُ بِهِ عَلَيْنَا مَصَائِبَ الدُّنْيَا وَمَتِّعْنَا بِأَسْمَاعِنَا وَأَبْصَارِنَا وَقُوَّتِنَا مَاأَحْيَيْتَنَا وَاجْعَلْهُ الوَارِثَ مِنَّا وَاجْعَلْ ثَأْرَنَا عَلَى مَنْ ظَلَمَنَا وَانْصُرْنَا عَلَى مَنْ عَادَانَا وَلاَ تجْعَلْ مُصِيبَتَنَا فِي دِينِنَا وَلاَ تَجْعَلِ الدُّنْيَا أَكْبَرَ هَمِّنَا وَلَا مَبْلَغَ عِلْمِنَا وَلاَ تُسَلِّطْ عَلَيْنَا مَنْ لَا يَرْحَمُنَا ۞

                {'\n\n'}

                اللَّهُمَّ لَا تَدَعْ لَنَا ذَنْبًا إِلَّا غَفَرْتَهُ وَلَا هَمًّا إِلَّا فَرَّجْتَهُ وَلَا دَيْنًا إِلَّا قَضَيْتَهُ وَلَا حَاجَةً مِنْ حَوَائِجِ الدُّنْيَا وَالآخِرَةِ إِلَّا قَضَيْتَهَا يَاأَرْحَمَ الرَّاحِمِينَ ۞

                {'\n\n'}

                رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ وَصَلَّى اللهُ عَلَى سَيِّدِنَا وَنَبِيِّنَا مُحَمَّدٍ وَعَلَى آلِهِ وَأَصْحَابِهِ الأَخْيَارِ وَسَلَّمَ تَسْلِيمًا كَثِيراً.
              </Text>

              <View style={styles.duaLine} />

              <Text style={styles.duaEnd}>
                آمِينَ يَا رَبَّ الْعَالَمِينَ
              </Text>
            </View>
          </ScrollView>
        )}
      </View>

      <View style={styles.navigation}>
        <Pressable
          style={[
            styles.navButton,
            (page === 1 || loading) && styles.disabledButton,
          ]}
          disabled={page === 1 || loading}
          onPress={previousPage}
        >
          <Text style={styles.navButtonText}>
            → الصفحة السابقة
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.navButton,
            (page === DUA_PAGE || loading) && styles.disabledButton,
          ]}
          disabled={page === DUA_PAGE || loading}
          onPress={nextPage}
        >
          <Text style={styles.navButtonText}>
            {page === TOTAL_PAGES
              ? 'دعاء الختم ←'
              : 'الصفحة التالية ←'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {page === DUA_PAGE
            ? 'تقبّل الله منا ومنكم صالح الأعمال'
            : 'اختاري السورة أو استعملي أزرار التنقل'}
        </Text>
      </View>

      <Modal
        visible={surahModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSurahModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                اختاري السورة
              </Text>

              <Pressable
                onPress={() => setSurahModalVisible(false)}
              >
                <Text style={styles.closeModal}>✕</Text>
              </Pressable>
            </View>

            <ScrollView>
              {SURAH_LIST.map((surah, index) => (
                <Pressable
                  key={index}
                  style={styles.surahItem}
                  onPress={() => selectSurah(surah.page)}
                >
                  <Text style={styles.surahItemNumber}>
                    {index + 1}
                  </Text>

                  <Text style={styles.surahItemName}>
                    سورة {surah.name}
                  </Text>

                  <Text style={styles.surahItemPage}>
                    ص {surah.page}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },
  header: {
    backgroundColor: COLORS.paper,
    paddingHorizontal: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold,
  },
  backText: {
    color: COLORS.green,
    fontSize: 15,
    fontWeight: 'bold',
  },
  headerTitle: {
    color: COLORS.darkGreen,
    fontSize: 21,
    fontWeight: 'bold',
  },
  headerIcon: {
    fontSize: 25,
  },
  topInfo: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  topTitle: {
    color: COLORS.green,
    fontSize: 20,
    fontWeight: 'bold',
  },
  pageNumber: {
    color: COLORS.darkGreen,
    fontSize: 13,
    marginTop: 4,
  },
  chooseSurahButton: {
    alignSelf: 'center',
    backgroundColor: COLORS.green,
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 5,
  },
  chooseSurahText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  bookArea: {
    flex: 1,
    minHeight: 0,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  paper: {
    flex: 1,
    minHeight: 0,
    backgroundColor: COLORS.paper,
    borderRadius: 5,
    elevation: 4,
  },
  outerBorder: {
    flex: 1,
    minHeight: 0,
    margin: 6,
    borderWidth: 2,
    borderColor: COLORS.gold,
    padding: 4,
  },
  innerBorder: {
    flex: 1,
    minHeight: 0,
    borderWidth: 1,
    borderColor: COLORS.gold,
    padding: 3,
    position: 'relative',
  },
  mushafImage: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.paper,
  },
  loadingText: {
    color: COLORS.green,
    marginTop: 12,
  },
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.paper,
  },
  errorText: {
    color: '#B3261E',
    fontSize: 15,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.green,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  navButton: {
    flex: 1,
    backgroundColor: COLORS.green,
    padding: 13,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#AAB8B0',
  },
  navButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 9,
  },
  footerText: {
    color: COLORS.green,
    fontSize: 12,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.paper,
    borderRadius: 16,
    maxHeight: '80%',
    padding: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gold,
  },
  modalTitle: {
    color: COLORS.darkGreen,
    fontSize: 21,
    fontWeight: 'bold',
  },
  closeModal: {
    color: COLORS.green,
    fontSize: 23,
    paddingHorizontal: 8,
  },
  surahItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E8DFC9',
  },
  surahItemNumber: {
    color: COLORS.gold,
    width: 35,
    fontWeight: 'bold',
  },
  surahItemName: {
    flex: 1,
    color: COLORS.darkGreen,
    fontSize: 18,
    textAlign: 'right',
  },
  surahItemPage: {
    color: COLORS.green,
    fontSize: 13,
    marginLeft: 12,
  },
  duaScroll: {
    flex: 1,
    backgroundColor: COLORS.paper,
    borderRadius: 8,
  },
  duaContent: {
    flexGrow: 1,
    padding: 15,
    justifyContent: 'center',
  },
  duaBorder: {
    borderWidth: 2,
    borderColor: COLORS.gold,
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.paper,
  },
  duaIcon: {
    fontSize: 35,
    marginBottom: 12,
  },
  duaTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: COLORS.green,
    textAlign: 'center',
    marginBottom: 15,
  },
  duaLine: {
    width: '80%',
    height: 1,
    backgroundColor: COLORS.gold,
    marginVertical: 15,
  },
  duaText: {
    fontSize: 20,
    lineHeight: 39,
    color: COLORS.darkGreen,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  duaEnd: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.green,
    marginTop: 10,
    textAlign: 'center',
  },
});
