import { Platform } from 'react-native';

export const COLORS = {
  // Base Colors
  background: '#0B0F19', // Deep dark blue-black
  surface: '#161F30',    // Dark card surface
  surfaceElevated: '#222F47', // Floating card surface
  border: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.04)',
  
  // Accents
  primary: '#00F2FE', // Neon Cyan
  secondary: '#4FACFE', // Neon Blue
  accent: '#A78BFA', // Light Purple
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#94A3B8', // Slate 400
  textMuted: '#afb7c4',     // Slate 500
  
  // Entity Colors (Matches entity_type values)
  fuel_station: '#10B981', // Emerald Green
  depot: '#3B82F6',        // Electric Blue
  opportunity: '#F43F5E',  // Rose Pink
  supply_route: '#8B5CF6', // Purple Route
  
  // Traffic colors (by level)
  trafficLow: '#10B981',   // Green
  trafficMedium: '#F59E0B',// Amber
  trafficHigh: '#EF4444',  // Red

  // Miscellaneous
  shadow: '#000000',
  white: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  glassBg: 'rgba(22, 31, 48, 0.8)',
};

export const TYPOGRAPHY = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
  }),
  fontFamilyBold: Platform.select({
    ios: 'System',
    android: 'sans-serif-condensed',
  }),
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const EFFECTS = {
  glass: {
    backgroundColor: COLORS.glassBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  shadowLow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shadowHigh: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};
