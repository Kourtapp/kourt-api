import Svg, { Circle, Path } from 'react-native-svg';

interface SoccerBallProps {
  size?: number;
}

export const SoccerBall = ({ size = 34 }: SoccerBallProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Circle cx="20" cy="20" r="18" fill="#fff" stroke="#ccc" strokeWidth={1} />
    <Path d="M20 9 L26 13 L24 20 L16 20 L14 13 Z" fill="#1a1a1a" />
    <Path d="M20 9 L20 2" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M26 13 L33 10" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M24 20 L30 25" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M16 20 L10 25" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M14 13 L7 10" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M20 2 L33 10" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M33 10 L36 22" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M36 22 L30 25" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M30 25 L30 34" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M10 25 L10 34" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M10 25 L4 22" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M4 22 L7 10" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M7 10 L20 2" stroke="#1a1a1a" strokeWidth={1.5} />
    <Path d="M30 34 L20 38 L10 34" stroke="#1a1a1a" strokeWidth={1.5} fill="none" />
    <Circle cx="11" cy="10" r="4" fill="#fff" opacity={0.8} />
  </Svg>
);
