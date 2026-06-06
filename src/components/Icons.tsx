import React from 'react';
import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';
import { COLORS } from '../theme/Theme';

interface IconProps {
  color?: string;
  size?: number;
  style?: any;
}

export const SearchIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Circle cx="11" cy="11" r="8" />
    <Path d="M21 21l-4.35-4.35" />
  </Svg>
);

export const FilterIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
  </Svg>
);

export const LayersIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M12 2L2 7l10 5 10-5-10-5z" />
    <Path d="M2 17l10 5 10-5" />
    <Path d="M2 12l10 5 10-5" />
  </Svg>
);

export const LocationIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
    <Circle cx="12" cy="10" r="3" />
  </Svg>
);

export const CrosshairIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Circle cx="12" cy="12" r="10" />
    <Line x1="22" y1="12" x2="18" y2="12" />
    <Line x1="6" y1="12" x2="2" y2="12" />
    <Line x1="12" y1="6" x2="12" y2="2" />
    <Line x1="12" y1="22" x2="12" y2="18" />
  </Svg>
);

export const ResetIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M21.5 2v6h-6M21.34 15.57a10 10 0 11-.57-8.38l5.67-5.67" />
  </Svg>
);

export const CloseIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Line x1="18" y1="6" x2="6" y2="18" />
    <Line x1="6" y1="6" x2="18" y2="18" />
  </Svg>
);

export const StationIcon = ({ color = COLORS.fuel_station, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M3 22h18" />
    <Path d="M4 22V4a2 2 0 012-2h8a2 2 0 012 2v18" />
    <Path d="M16 14h4a2 2 0 012 2v3a2 2 0 01-2 2h-4" />
    <Path d="M9 6h2v4H9z" />
    <Circle cx="20" cy="9" r="2" />
  </Svg>
);

export const DepotIcon = ({ color = COLORS.depot, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M14 22V4a2 2 0 00-2-2H3a2 2 0 00-2 2v18h13" />
    <Path d="M23 22V10a2 2 0 00-2-2h-7v14h9" />
    <Path d="M4 6h3v3H4zm0 6h3v3H4zm7-6h1v3h-1zm0 6h1v3h-1zm6 2h3v3h-3z" />
  </Svg>
);

export const OpportunityIcon = ({ color = COLORS.opportunity, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
    <Path d="M12 6v6l4 2" />
    <Path d="M12 12H8" />
    <Circle cx="12" cy="12" r="1" />
  </Svg>
);

export const RouteIcon = ({ color = COLORS.supply_route, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Circle cx="6" cy="6" r="3" />
    <Circle cx="18" cy="18" r="3" />
    <Path d="M9 6h4a4 4 0 014 4v4a4 4 0 004 4" />
  </Svg>
);

export const TrafficIcon = ({ color = COLORS.textSecondary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Rect x="8" y="2" width="8" height="20" rx="4" />
    <Circle cx="12" cy="7" r="2" fill={color} />
    <Circle cx="12" cy="12" r="2" fill={color} />
    <Circle cx="12" cy="17" r="2" fill={color} />
  </Svg>
);

export const PlusIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Line x1="12" y1="5" x2="12" y2="19" />
    <Line x1="5" y1="12" x2="19" y2="12" />
  </Svg>
);

export const PaletteIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M12 2a10 10 0 000 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.4A4.6 4.6 0 0022 11c0-5-4.5-9-10-9z" />
    <Circle cx="7.5" cy="10.5" r="1.2" fill={color} stroke="none" />
    <Circle cx="12" cy="7.5" r="1.2" fill={color} stroke="none" />
    <Circle cx="16.5" cy="10.5" r="1.2" fill={color} stroke="none" />
  </Svg>
);

export const RefreshIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M23 4v6h-6" />
    <Path d="M1 20v-6h6" />
    <Path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
  </Svg>
);

export const WifiOffIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Line x1="1" y1="1" x2="23" y2="23" />
    <Path d="M16.72 11.06A10.94 10.94 0 0119 12.55" />
    <Path d="M5 12.55a10.94 10.94 0 015.17-2.39" />
    <Path d="M10.71 5.05A16 16 0 0122.58 9" />
    <Path d="M1.42 9a15.91 15.91 0 014.7-2.88" />
    <Path d="M8.53 16.11a6 6 0 016.95 0" />
    <Line x1="12" y1="20" x2="12.01" y2="20" />
  </Svg>
);

export const CheckIcon = ({ color = COLORS.textPrimary, size = 20, style }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <Path d="M20 6L9 17l-5-5" />
  </Svg>
);
