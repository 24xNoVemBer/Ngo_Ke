import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useRef, type ReactElement } from 'react';
import {
  Animated,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation';
import { HERO_PHOTO } from '../assets/photoMap';
import { NgoKeLogo } from '../components/NgoKeLogo';
import { AppIcon } from '../components/AppIcon';
import { useEntranceFadeSlide, usePressSpring } from '../hooks/useMotion';
import { useLocale } from '../context/LocaleContext';
import { spacing } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Prologue'>;

export function PrologueScreen({ navigation }: Props): ReactElement {
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const entering = useEntranceFadeSlide({ duration: 220, offsetY: 10 });
  const press = usePressSpring();
  const starting = useRef(false);
  const { locale, setLocale, t } = useLocale();

  function handleStartJourney(): void {
    if (starting.current) return;
    starting.current = true;
    navigation.replace('Landing');
  }

  return (
    <ImageBackground source={HERO_PHOTO} style={styles.root} resizeMode="cover">
      <View style={styles.scrim} />
      <ScrollView
        contentContainerStyle={[
          styles.page,
          {
            minHeight: height,
            paddingTop: insets.top + 16,
            paddingBottom: insets.bottom + 24,
          },
        ]}
      >
        {/* Language switch on first page */}
        <View style={styles.langSelectorRow}>
          <Pressable
            testID="locale-switch"
            accessibilityRole="button"
            accessibilityLabel="Chọn Tiếng Việt"
            accessibilityState={{ selected: locale === 'vi' }}
            onPress={() => setLocale('vi')}
            style={[styles.langPill, locale === 'vi' && styles.langPillActive]}
          >
            <Text style={[styles.langPillText, locale === 'vi' && styles.langPillTextActive]}>
              Tiếng Việt
            </Text>
          </Pressable>
          <Pressable
            testID="locale-switch"
            accessibilityRole="button"
            accessibilityLabel="Select English"
            accessibilityState={{ selected: locale === 'en' }}
            onPress={() => setLocale('en')}
            style={[styles.langPill, locale === 'en' && styles.langPillActive]}
          >
            <Text style={[styles.langPillText, locale === 'en' && styles.langPillTextActive]}>
              English
            </Text>
          </Pressable>
        </View>

        <Text style={styles.eyebrow}>{t('prologue.eyebrow')}</Text>

        <Animated.View
          style={[
            styles.brand,
            { opacity: entering.opacity, transform: [{ translateY: entering.translateY }] },
          ]}
        >
          <NgoKeLogo size="hero" variant="iconOnly" />
          <Text accessibilityRole="header" style={styles.title}>
            {t('prologue.title')}
          </Text>
          <Text style={styles.subtitle}>{t('prologue.subtitle')}</Text>
          <View style={styles.rule} />
          <Text style={styles.quote}>{t('prologue.quote')}</Text>
        </Animated.View>

        <View style={styles.action}>
          <Animated.View style={{ transform: [{ scale: press.scaleAnim }] }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('prologue.start_label')}
              onPressIn={press.handlePressIn}
              onPressOut={press.handlePressOut}
              onPress={handleStartJourney}
              style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}
            >
              <Text style={styles.buttonText}>{t('prologue.start_button')}</Text>
              <AppIcon name="arrow" />
            </Pressable>
          </Animated.View>
          <Text style={styles.hint}>{t('prologue.hint')}</Text>
        </View>
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#161814' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,24,19,0.67)' },
  page: { flexGrow: 1, justifyContent: 'space-between', paddingHorizontal: spacing.lg, gap: 20 },
  langSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    alignSelf: 'center',
  },
  langPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(28, 20, 16, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(255, 245, 230, 0.25)',
  },
  langPillActive: {
    backgroundColor: '#2D5748',
    borderColor: '#B9A589',
  },
  langPillText: {
    color: '#E8D5BC',
    fontSize: 13,
    fontWeight: '600',
  },
  langPillTextActive: {
    color: '#FFFDF7',
    fontWeight: '700',
  },
  eyebrow: { color: '#E8D5BC', fontSize: 12, letterSpacing: 1.5, textAlign: 'center' },
  brand: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  title: { fontSize: 42, fontWeight: '900', color: '#FFFDF7', letterSpacing: 3, textAlign: 'center' },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#E8D5BC', letterSpacing: 2, textAlign: 'center' },
  rule: { height: 1, width: 100, backgroundColor: '#B9A589', marginVertical: 12 },
  quote: { fontSize: 16, lineHeight: 26, fontStyle: 'italic', color: '#FFF8EB', textAlign: 'center', maxWidth: 420 },
  action: { alignItems: 'center', gap: 14 },
  button: {
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 28,
    backgroundColor: '#2D5748',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#B9A589',
  },
  buttonText: { flexShrink: 1, color: '#FFFDF7', fontSize: 15, fontWeight: '800', letterSpacing: 1 },
  hint: { color: '#E8D5BC', fontSize: 13, textAlign: 'center' },
});
