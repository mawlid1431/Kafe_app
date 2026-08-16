import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';

import type { OnboardingSlideIcon } from '../data';

type IconProps = {
  size?: number;
  color: string;
};

export function RewardGiftIcon({ size = 26, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3.75v16.5M2.25 12h19.5M6.375 17.25a4.875 4.875 0 0 0 4.875-4.875V12m6.375 5.25a4.875 4.875 0 0 1-4.875-4.875V12m-9 8.25h16.5a1.5 1.5 0 0 0 1.5-1.5V5.25a1.5 1.5 0 0 0-1.5-1.5H3.75a1.5 1.5 0 0 0-1.5 1.5v13.5a1.5 1.5 0 0 0 1.5 1.5Zm12.621-9.44c-1.409 1.41-4.242 1.061-4.242 1.061s-.349-2.833 1.06-4.242a2.25 2.25 0 0 1 3.182 3.182ZM10.773 7.63c1.409 1.409 1.06 4.242 1.06 4.242S9 12.22 7.592 10.811a2.25 2.25 0 1 1 3.182-3.182Z"
      />
    </Svg>
  );
}

export function DeliveryMopedIcon({ size = 26, color }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 -960 960 960">
      <Path
        fill={color}
        d="M533-440q-32-45-84.5-62.5T340-520q-56 0-108.5 17.5T147-440h386ZM40-360q0-109 91-174.5T340-600q118 0 209 65.5T640-360H40Zm0 160v-80h600v80H40ZM720-40v-80h56l56-560H450l-10-80h200v-160h80v160h200L854-98q-3 25-22 41.5T788-40h-68Zm0-80h56-56ZM80-40q-17 0-28.5-11.5T40-80v-40h600v40q0 17-11.5 28.5T600-40H80Zm260-400Z"
      />
    </Svg>
  );
}

export function OnboardingSlideIconView({
  item,
  color,
  size = 26,
}: {
  item: OnboardingSlideIcon;
  color: string;
  size?: number;
}) {
  switch (item.icon) {
    case 'delivery':
      return <DeliveryMopedIcon size={size} color={color} />;
    case 'reward':
      return <RewardGiftIcon size={size} color={color} />;
    default:
      return <Ionicons name={item.icon} size={size} color={color} />;
  }
}
