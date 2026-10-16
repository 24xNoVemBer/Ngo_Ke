/* eslint-disable @typescript-eslint/no-require-imports */
import type { ReactElement } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';

import { useLocale } from '../context/LocaleContext';

const LOGO_SOURCE = require('../../assets/logo_monogram.jpg');

type LogoSize = 'sm' | 'md' | 'lg' | 'hero';
type LogoVariant = 'horizontal' | 'vertical' | 'iconOnly';
type LogoTheme = 'light' | 'dark';

interface NgoKeLogoProps {
  size?: LogoSize;
  variant?: LogoVariant;
  theme?: LogoTheme;
  showSubtitle?: boolean;
  subtitle?: string;
  style?: ViewStyle;
}

const SIZE_MAP: Record<LogoSize, { image: number; title: number; subtitle: number; gap: number }> = {
  sm: { image: 28, title: 13, subtitle: 9, gap: 6 },
  md: { image: 38, title: 16, subtitle: 10, gap: 8 },
  lg: { image: 52, title: 20, subtitle: 11, gap: 10 },
  hero: { image: 78, title: 26, subtitle: 12.5, gap: 12 },
};

export function NgoKeLogo({
  size = 'md',
  variant = 'horizontal',
  theme = 'light',
  showSubtitle = true,
  subtitle,
  style,
}: NgoKeLogoProps): ReactElement {
  const { t } = useLocale();
  const config = SIZE_MAP[size];
  const isLight = theme === 'light';

  const titleColor = isLight ? '#FFFDF7' : '#2C221E';
  const subtitleColor = isLight ? '#E8D5BC' : '#8C5A40';
  const resolvedSubtitle = subtitle ?? t('common.brand_subtitle');

  if (variant === 'iconOnly') {
    return (
      <View
        style={[
          styles.iconOnlyContainer,
          {
            width: config.image,
            height: config.image,
            borderRadius: config.image / 2,
          },
          style,
        ]}
      >
        <Image
          source={LOGO_SOURCE}
          style={[styles.logoImage, { width: config.image, height: config.image }]}
          resizeMode="cover"
        />
      </View>
    );
  }

  const isVertical = variant === 'vertical';

  return (
    <View
      style={[
        isVertical ? styles.verticalContainer : styles.horizontalContainer,
        { gap: config.gap },
        style,
      ]}
    >
      <View
        style={[
          styles.logoImageWrapper,
          {
            width: config.image,
            height: config.image,
            borderRadius: config.image * 0.28,
          },
        ]}
      >
        <Image
          source={LOGO_SOURCE}
          style={[styles.logoImage, { width: config.image, height: config.image }]}
          resizeMode="cover"
        />
      </View>

      <View style={[styles.textGroup, isVertical && styles.textGroupCentered]}>
        <Text
          style={[
            styles.brandTitle,
            {
              fontSize: config.title,
              color: titleColor,
              textAlign: isVertical ? 'center' : 'left',
            },
          ]}
        >
          NGÕ KỂ
        </Text>
        {showSubtitle && (
          <Text
            style={[
              styles.brandSubtitle,
              {
                fontSize: config.subtitle,
                color: subtitleColor,
                textAlign: isVertical ? 'center' : 'left',
              },
            ]}
          >
            {resolvedSubtitle}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  verticalContainer: {
    alignItems: 'center',
  },
  iconOnlyContainer: {
    overflow: 'hidden',
    backgroundColor: '#FFFDF9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImageWrapper: {
    overflow: 'hidden',
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  logoImage: {
    borderRadius: 8,
  },
  textGroup: {
    justifyContent: 'center',
    gap: 1,
    flexShrink: 1,
  },
  textGroupCentered: {
    alignItems: 'center',
  },
  brandTitle: {
    fontWeight: '900',
    letterSpacing: 2.5,
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 0, height: 1.5 },
    textShadowRadius: 4,
  },
  brandSubtitle: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
