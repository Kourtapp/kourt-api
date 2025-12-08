import Svg, { Path, Circle, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';

interface CrownStickerProps {
  size?: number;
}

export const CrownSticker = ({ size = 52 }: CrownStickerProps) => (
  <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <Ellipse cx="24" cy="42" rx="16" ry="3" fill="#000" opacity={0.15} />
    <Path d="M8 36 L40 36 L40 40 L8 40 Z" fill="url(#crownBase)" />
    <Path d="M8 36 L12 20 L18 28 L24 14 L30 28 L36 20 L40 36 Z" fill="url(#crownGold)" />
    <Path d="M10 34 L13 22 L18 29 L24 17 L30 29 L35 22 L38 34 Z" fill="#fbbf24" />
    <Path d="M14 30 L15 24" stroke="#fff" strokeWidth={2} opacity={0.5} strokeLinecap="round" />
    <Path d="M22 24 L24 18" stroke="#fff" strokeWidth={2} opacity={0.4} strokeLinecap="round" />
    <Ellipse cx="24" cy="32" rx="4" ry="3.5" fill="#dc2626" />
    <Ellipse cx="23" cy="31" rx="1.5" ry="1" fill="#fff" opacity={0.5} />
    <Circle cx="14" cy="33" r="2.5" fill="#2563eb" />
    <Circle cx="13.5" cy="32.5" r="0.8" fill="#fff" opacity={0.5} />
    <Circle cx="34" cy="33" r="2.5" fill="#16a34a" />
    <Circle cx="33.5" cy="32.5" r="0.8" fill="#fff" opacity={0.5} />
    <Circle cx="12" cy="20" r="3" fill="#fde047" />
    <Circle cx="11" cy="19" r="1" fill="#fff" opacity={0.6} />
    <Circle cx="24" cy="14" r="4" fill="#fde047" />
    <Circle cx="23" cy="13" r="1.5" fill="#fff" opacity={0.6} />
    <Circle cx="36" cy="20" r="3" fill="#fde047" />
    <Circle cx="35" cy="19" r="1" fill="#fff" opacity={0.6} />
    <Defs>
      <LinearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#fcd34d" />
        <Stop offset="50%" stopColor="#f59e0b" />
        <Stop offset="100%" stopColor="#d97706" />
      </LinearGradient>
      <LinearGradient id="crownBase" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0%" stopColor="#f59e0b" />
        <Stop offset="100%" stopColor="#b45309" />
      </LinearGradient>
    </Defs>
  </Svg>
);
