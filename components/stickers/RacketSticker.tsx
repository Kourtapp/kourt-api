import Svg, { Path, Ellipse } from 'react-native-svg';

interface RacketStickerProps {
  size?: number;
}

export const RacketSticker = ({ size = 46 }: RacketStickerProps) => (
  <Svg width={size} height={size + 4} viewBox="0 0 44 48" fill="none">
    <Path d="M20 32 L18 44 L24 44 L22 32 Z" fill="#8B4513" stroke="#5D2E0C" strokeWidth={1} />
    <Path d="M18.5 36 L23.5 35" stroke="#222" strokeWidth={1.5} />
    <Path d="M18.2 38 L23.8 37" stroke="#222" strokeWidth={1.5} />
    <Path d="M18 40 L24 39" stroke="#222" strokeWidth={1.5} />
    <Path d="M18 42 L24 41" stroke="#222" strokeWidth={1.5} />
    <Ellipse cx="21" cy="16" rx="14" ry="16" fill="#22c55e" stroke="#1a1a1a" strokeWidth={3} />
    <Path d="M12 5 L12 27" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M16 3 L16 29" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M21 2 L21 30" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M26 3 L26 29" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M30 5 L30 27" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M8 8 L34 8" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M7 12 L35 12" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M7 16 L35 16" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M7 20 L35 20" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M8 24 L34 24" stroke="#fff" strokeWidth={1} opacity={0.8} />
    <Path d="M10 8 C8 12, 8 20, 10 24" stroke="#fff" strokeWidth={2} opacity={0.5} strokeLinecap="round" fill="none" />
  </Svg>
);
