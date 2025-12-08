import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

interface BasketballBallProps {
  size?: number;
}

export const BasketballBall = ({ size = 40 }: BasketballBallProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Circle cx="20" cy="20" r="18" fill="#e65100" />
    <Circle cx="20" cy="20" r="18" fill="url(#basketGrad)" />
    <Path d="M20 2 L20 38" stroke="#000" strokeWidth={1.5} />
    <Path d="M2 20 L38 20" stroke="#000" strokeWidth={1.5} />
    <Path d="M7 6 Q2 20, 7 34" stroke="#000" strokeWidth={1.5} fill="none" />
    <Path d="M33 6 Q38 20, 33 34" stroke="#000" strokeWidth={1.5} fill="none" />
    <Circle cx="12" cy="12" r="6" fill="#fff" opacity={0.2} />
    <Defs>
      <RadialGradient id="basketGrad" cx="0.3" cy="0.3" r="0.7">
        <Stop offset="0%" stopColor="#ff8a65" stopOpacity={0.3} />
        <Stop offset="100%" stopColor="#bf360c" stopOpacity={0.5} />
      </RadialGradient>
    </Defs>
  </Svg>
);
