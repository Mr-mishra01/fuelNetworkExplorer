import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated';
import { useFuelStore } from '../../store/useFuelStore';
import { WifiOffIcon } from '../../components/Icons';
import { COLORS, TYPOGRAPHY } from '../../theme/Theme';

/**
 * Slim pill that animates in below the search bar whenever connectivity drops,
 * reassuring the user that the map is running on cached data rather than broken.
 */
export const OfflineBanner = () => {
  const insets = useSafeAreaInsets();
  const isOffline = useFuelStore((s) => s.isOffline);

  if (!isOffline) return null;

  return (
    <View
      style={[styles.wrapper, { top: insets.top + 70 }]}
      pointerEvents="none"
    >
      <Animated.View
        entering={FadeInUp.springify().damping(18)}
        exiting={FadeOutUp.duration(200)}
        layout={Layout}
        style={styles.pill}
        accessibilityRole="alert"
        accessibilityLabel="You are offline. Showing cached map data."
      >
        <WifiOffIcon size={14} color={COLORS.trafficMedium} />
        <Text style={styles.text}>Offline — showing cached data</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  text: {
    color: COLORS.trafficMedium,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    marginLeft: 8,
  },
});

export default OfflineBanner;
