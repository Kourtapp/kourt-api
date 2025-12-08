import Svg, { Circle, Path } from 'react-native-svg';

interface VolleyballStickerProps {
  size?: number;
}

export const VolleyballSticker = ({ size = 44 }: VolleyballStickerProps) => (
  <Svg width={size} height={size} viewBox="0 0 44 44" fill="none">
    <Circle cx="22" cy="22" r="20" fill="#fff" stroke="#ddd" strokeWidth={1} />
    <Path
      d="M22 2 C22 2, 10 10, 10 22 C10 34, 22 42, 22 42"
      stroke="#1e40af"
      strokeWidth={6}
      fill="none"
    />
    <Path
      d="M22 2 C22 2, 34 10, 34 22 C34 34, 22 42, 22 42"
      stroke="#dc2626"
      strokeWidth={6}
      fill="none"
    />
    <Path
      d="M4 16 C12 20, 32 20, 40 16"
      stroke="#eab308"
      strokeWidth={5}
      fill="none"
      strokeLinecap="round"
    />
    <Circle cx="13" cy="12" r="5" fill="#fff" opacity={0.7} />
  </Svg>
);
