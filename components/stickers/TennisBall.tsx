import Svg, { Circle, Path, Defs, RadialGradient, Stop } from 'react-native-svg';

interface TennisBallProps {
  size?: number;
}

export const TennisBall = ({ size = 44 }: TennisBallProps) => (
  <Svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <Circle cx="20" cy="20" r="18" fill="#d4e157" />
    <Circle cx="20" cy="20" r="18" fill="url(#tennisBallGrad)" />
    <Path
      d="M2 20 Q10 8, 20 8 Q30 8, 38 20"
      stroke="#fff"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <Path
      d="M2 20 Q10 32, 20 32 Q30 32, 38 20"
      stroke="#fff"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
    <Circle cx="12" cy="12" r="6" fill="#fff" opacity={0.3} />
    <Defs>
      <RadialGradient id="tennisBallGrad" cx="0.3" cy="0.3" r="0.7">
        <Stop offset="0%" stopColor="#e6ee9c" stopOpacity={0.3} />
        <Stop offset="100%" stopColor="#827717" stopOpacity={0.4} />
      </RadialGradient>
    </Defs>
  </Svg>
);
