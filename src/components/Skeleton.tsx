import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { COLORS } from '../theme/Theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}

/**
 * A single shimmering placeholder block. Uses a looping opacity pulse on the
 * UI thread (Reanimated) so it stays smooth even while the JS thread is busy
 * parsing data — exactly when skeletons are on screen.
 */
export const Skeleton = ({
  width = '100%',
  height = 16,
  radius = 8,
  style,
}: SkeletonProps) => {
  const progress = useSharedValue(0.4);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(0.9, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={[
        styles.base,
        { width, height, borderRadius: radius },
        animatedStyle,
        style,
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    />
  );
};

/** Pre-composed skeleton matching a single search result row. */
export const SearchResultSkeleton = () => (
  <View style={styles.searchRow}>
    <Skeleton width={32} height={32} radius={8} />
    <View style={styles.searchText}>
      <Skeleton width="70%" height={13} />
      <Skeleton width="45%" height={10} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  base: {
    backgroundColor: COLORS.surfaceElevated,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  searchText: {
    flex: 1,
    marginLeft: 12,
  },
});

export default Skeleton;
