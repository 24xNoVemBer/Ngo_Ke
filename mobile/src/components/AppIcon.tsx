import type { ReactElement } from 'react';
import Svg, { Path } from 'react-native-svg';

const paths = {
  food: 'M4 3v6a3 3 0 0 0 6 0V3 M7 3v18 M17 3c-3 3-3 8 0 8h3 M20 3v18',
  book: 'M3 4h7a3 3 0 0 1 2 1 3 3 0 0 1 2-1h7v15h-7a3 3 0 0 0-2 1 3 3 0 0 0-2-1H3z M12 5v15',
  write: 'M4 20h4L20 8l-4-4L4 16z M14 6l4 4 M4 20h16',
  mic: 'M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z M5 10v1a7 7 0 0 0 14 0v-1 M12 18v4 M8 22h8',
  play: 'M8 5v14l11-7z',
  pause: 'M7 5h3v14H7z M14 5h3v14h-3z',
  replay: 'M4 11a8 8 0 1 1 2.3 5.7 M4 11V5 M4 11h6',
  stop: 'M6 6h12v12H6z',
  text: 'M4 5h16 M4 10h16 M4 15h10 M4 20h16',
  close: 'M6 6l12 12 M18 6L6 18',
  qr: 'M3 3h6v6H3z M15 3h6v6h-6z M3 15h6v6H3z M15 15h3v3h3v3h-6z',
  pin: 'M12 22s8-8 8-14a8 8 0 0 0-16 0c0 6 8 14 8 14z M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6',
  compass: 'M22 12a10 10 0 1 0-20 0 10 10 0 0 0 20 0z M16 8l-3 5-5 3 3-5z',
  arrow: 'M4 12h16 M14 6l6 6-6 6',
  passport: 'M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z M8 18h8',
};

export function AppIcon({ name, size = 22, color = '#FFFDF7' }: {
  name: keyof typeof paths; size?: number; color?: string;
}): ReactElement {
  return <Svg width={size} height={size} viewBox="0 0 24 24" accessible={false}>
    <Path d={paths[name]} fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>;
}
