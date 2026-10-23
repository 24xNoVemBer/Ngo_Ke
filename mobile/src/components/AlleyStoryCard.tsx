import type { ReactElement } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { AlleyStory } from '../data/alleyGuide';
import { useLocale } from '../context/LocaleContext';
import { colors, radius, spacing } from '../theme';

export interface AlleyStoryCardProps {
  story: AlleyStory;
  onClose: () => void;
  visible?: boolean;
  hasIntroTrack?: boolean;
  isPlayingIntro?: boolean;
  onTogglePlayIntro?: () => void;
}

export function AlleyStoryCard({
  story,
  onClose,
  visible = true,
  hasIntroTrack = false,
  isPlayingIntro = false,
  onTogglePlayIntro,
}: AlleyStoryCardProps): ReactElement | null {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { locale, t } = useLocale();

  if (!visible) return null;

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      testID="alley-story-modal"
      accessibilityViewIsModal
    >
      <View style={styles.backdrop}>
        <Pressable
          testID="alley-story-backdrop"
          accessibilityRole="button"
          accessibilityLabel={t('home.alley_story_close')}
          style={StyleSheet.absoluteFill}
          onPress={onClose}
        />
        <View
          testID="alley-story-card"
          style={[
            styles.cardContainer,
            {
              maxHeight: Math.min(screenHeight * 0.88, screenHeight - insets.top - insets.bottom - 24),
              width: Math.min(screenWidth - 32, 540),
            },
          ]}
        >
          {/* Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerTitleWrap}>
              <Text style={styles.eyebrowText}>{t('home.alley_story_title')}</Text>
              <Text accessibilityRole="header" style={styles.titleText}>
                {story.title}
              </Text>
            </View>
            <View style={styles.headerActions}>
              {hasIntroTrack && onTogglePlayIntro && (
                <Pressable
                  testID="alley-story-play-btn"
                  accessibilityRole="button"
                  accessibilityLabel={
                    isPlayingIntro
                      ? (locale === 'en' ? 'Pause alley intro' : 'Tạm dừng giới thiệu ngõ')
                      : (locale === 'en' ? 'Play alley intro' : 'Nghe giới thiệu ngõ')
                  }
                  onPress={onTogglePlayIntro}
                  style={({ pressed }) => [styles.cardPlayButton, pressed && styles.pressed]}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.cardPlayButtonIcon}>{isPlayingIntro ? '⏸' : '▶'}</Text>
                </Pressable>
              )}
              <Pressable
                testID="alley-story-close"
                accessibilityRole="button"
                accessibilityLabel={t('home.alley_story_close')}
                onPress={onClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </Pressable>
            </View>
          </View>

          {/* Scrollable Story Reader */}
          <ScrollView
            testID="alley-story-scroll"
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator
          >
            {story.paragraphs.map((paragraph, index) => (
              <Text
                key={index}
                testID={`alley-story-paragraph-${index}`}
                style={styles.paragraphText}
              >
                {paragraph}
              </Text>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(18, 20, 16, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  headerTitleWrap: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  eyebrowText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.accent,
    marginBottom: 4,
  },
  titleText: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 25,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardPlayButton: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: '#F2C56B',
    borderWidth: 1,
    borderColor: 'rgba(242, 197, 107, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlayButtonIcon: {
    fontSize: 16,
    color: '#24392E',
  },
  closeButton: {
    width: 44,
    height: 44,
    minWidth: 44,
    minHeight: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceWarm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  paragraphText: {
    fontSize: 15,
    lineHeight: 24,
    color: colors.text,
    textAlign: 'left',
  },
  pressed: {
    opacity: 0.75,
  },
});
