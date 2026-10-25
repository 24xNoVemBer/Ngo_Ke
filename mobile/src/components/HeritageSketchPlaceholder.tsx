import type { ReactElement } from 'react';
import { Image, StyleSheet, Text, View, type ImageProps, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import type { NodeVisual, VisualMotif } from '../assets/nodeVisual';
import { t } from '../i18n/translator';

type PlaceholderVisual = Extract<NodeVisual, { kind: 'placeholder' }>;
type Ratio = '4:3' | '16:9' | '1:1' | 'full';
const MOTIFS: Record<VisualMotif, { color: string; paper: string; seal: [string, string]; en: [string, string]; path: string }> = {
  relic: { color: '#9C4F36', paper: '#F6EAE6', seal: ['DI', 'TÍCH'], en: ['HERITAGE', 'SITE'],
    path: 'M12 42 Q35 55 50 50 L150 50 Q165 55 188 42 M25 62 L175 62 M45 64 L45 120 M75 64 L75 120 M125 64 L125 120 M155 64 L155 120 M35 120 L165 120 M56 53 L56 59 M86 53 L86 59 M114 53 L114 59 M144 53 L144 59' },
  culinary: { color: '#2D5748', paper: '#E8EFEA', seal: ['ẨM', 'THỰC'], en: ['FOOD', 'LIFE'],
    path: 'M50 77 Q100 65 150 77 Q145 116 100 117 Q55 116 50 77 M50 77 Q100 90 150 77 M80 116 L85 123 L115 123 L120 116 M75 62 C60 50 90 48 75 35 M100 60 C85 45 115 45 100 28 M125 62 C110 50 140 48 125 35 M35 130 L165 130 M135 70 L172 80' },
  alley_space: { color: '#D49B35', paper: '#FFF4D9', seal: ['KHÔNG', 'GIAN'], en: ['ALLEY', 'SPACE'],
    path: 'M35 90 L35 63 Q35 20 100 20 Q165 20 165 63 L165 90 M35 90 L75 118 L125 118 L165 90 M35 90 L35 135 L75 118 M165 90 L165 135 L125 118 M100 25 L100 50 M94 50 Q85 65 100 73 Q115 65 106 50 Z M55 126 L145 126 M42 133 L158 133' },
};

export function HeritageSketchPlaceholder({ visual, ratio = '4:3', locale = 'vi', siteName, alleyName, style, showAnnotations = true }: {
  visual: PlaceholderVisual; ratio?: Ratio; locale?: string; siteName?: string; alleyName?: string; style?: StyleProp<ViewStyle>; showAnnotations?: boolean;
}): ReactElement {
  const language = locale === 'en' ? 'en' : 'vi';
  const compact = ratio === '1:1';
  const full = ratio === 'full';
  const motif = MOTIFS[visual.motif];
  const seal = language === 'en' ? motif.en : motif.seal;
  const name = siteName ?? visual.siteName;
  const alley = alleyName ?? visual.alleyName;
  const label = t(language, alley ? 'common.sketch_a11y_alley' : 'common.sketch_a11y', { name, alley: alley ?? '' });
  return <View accessible accessibilityRole="image" accessibilityLabel={label}
    style={[styles.paper, !full && { aspectRatio: ratio === '16:9' ? 16 / 9 : compact ? 1 : 4 / 3 }, full && styles.full, style]}>
    <Svg pointerEvents="none" accessible={false} width="100%" height="100%" viewBox="0 0 200 150"
      style={[StyleSheet.absoluteFill, full && styles.faded]}>
      <Path d={motif.path} stroke={full ? '#918A7E' : '#3D342A'} strokeWidth={1} fill="none" />
    </Svg>
    {showAnnotations && !full && <View accessible={false} style={[styles.seal, { borderColor: motif.color, backgroundColor: motif.paper }, compact && styles.compactSeal]}>
      {seal.map((line) => <Text key={line} style={[styles.sealText, { color: motif.color }, compact && styles.compactSealText]}>{line}</Text>)}
    </View>}
    {showAnnotations && ratio === '4:3' && <View accessible={false} style={styles.titles}>
      {alley && alley !== name && <Text style={styles.alley}>{alley}</Text>}
      <Text style={styles.name}>{name}</Text>
    </View>}
    {showAnnotations && !compact && !full && <View accessible={false} style={styles.badge}>
      <View style={styles.badgeInner}><Text style={styles.badgeText}>● {visual.badgeLabel}</Text></View>
    </View>}
  </View>;
}

/** Shared card/thumbnail renderer. Existing image lifecycle callbacks apply only to actual images. */
export function NodeVisualImage({ visual, locale = 'vi', siteName, ratio = '1:1', style, resizeMode = 'cover', showAnnotations = false, ...events }: {
  visual: NodeVisual; locale?: string; siteName?: string; ratio?: Ratio; style?: StyleProp<ViewStyle>; resizeMode?: ImageProps['resizeMode']; showAnnotations?: boolean;
} & Pick<ImageProps, 'onLoadStart' | 'onLoad' | 'onLoadEnd' | 'onError'>): ReactElement {
  const language = locale === 'en' ? 'en' : 'vi';
  // The caller owns the image frame. Placeholder text belongs in the card's
  // normal content flow, not at the same overlay positions as its theme/footer.
  return <View style={[styles.photoFrame, style]}>
    {visual.kind === 'placeholder'
      ? <HeritageSketchPlaceholder visual={visual} locale={locale} siteName={siteName} ratio={ratio} showAnnotations={showAnnotations} style={styles.fillFrame} />
      : <Image {...events} source={visual.source} style={StyleSheet.absoluteFill} resizeMode={resizeMode}
        accessibilityLabel={`${siteName ?? ''} · ${visual.isIllustrative ? t(language, 'common.photo_illustration') : t(language, 'common.photo_author', { author: visual.photographer })}`} />}
  </View>;
}

export function NodeVisualCredit({ visual, locale = 'vi', style }: { visual: NodeVisual; locale?: string; style?: StyleProp<TextStyle> }): ReactElement {
  const language = locale === 'en' ? 'en' : 'vi';
  return <Text style={style}>{visual.kind === 'photo'
    ? `${visual.isIllustrative ? `${t(language, 'common.photo_illustration')} · ` : ''}${t(language, 'common.photo_author', { author: visual.photographer })}`
    : `● ${visual.badgeLabel}`}</Text>;
}

const styles = StyleSheet.create({
  photoFrame: { overflow: 'hidden' },
  fillFrame: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  paper: { backgroundColor: '#F7F4EE', borderColor: '#E2DDD3', borderWidth: 1, overflow: 'hidden', width: '100%', justifyContent: 'flex-end' },
  full: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  faded: { opacity: 0.08 },
  seal: { position: 'absolute', top: 10, left: 10, borderWidth: 3, borderRadius: 5, padding: 4, alignItems: 'center' },
  sealText: { fontSize: 11, fontWeight: '800' },
  compactSeal: { top: 2, left: 2, padding: 1, borderWidth: 1 },
  compactSealText: { fontSize: 5.5, fontWeight: '700' },
  titles: { marginHorizontal: 10, marginTop: 68, padding: 5, backgroundColor: 'rgba(247,244,238,0.94)' },
  alley: { color: '#626559', fontSize: 11, textAlign: 'center' },
  name: { color: '#2E3028', fontSize: 18, fontWeight: '800', textAlign: 'center', flexShrink: 1 },
  badge: { margin: 8, borderWidth: 1, borderColor: '#C5BEAF', borderRadius: 16, padding: 2, backgroundColor: '#FFFDF7', alignSelf: 'center', maxWidth: '94%' },
  badgeInner: { borderWidth: 1, borderColor: '#E2DDD3', borderRadius: 13, paddingHorizontal: 7, paddingVertical: 3 },
  badgeText: { color: '#9C4F36', fontSize: 12, textAlign: 'center', flexShrink: 1 },
});
