import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { IconButton } from './IconButton';
import { CloseIcon } from './Icons';
import { COLORS, TYPOGRAPHY } from '../theme/Theme';

interface OverlayPanelProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  /** Optional element rendered at the right of the header (e.g. a Reset link). */
  headerAccessory?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Reusable bottom overlay panel: a backdrop that fades in + a card that slides
 * up and springs into place. Shared by the Layers, Map Style and Filter
 * controls so they animate identically and never block the map when closed.
 *
 * Stays mounted through its exit animation, then unmounts itself so it adds no
 * view cost while collapsed.
 */
export const OverlayPanel = ({
  visible,
  onClose,
  title,
  headerAccessory,
  children,
}: OverlayPanelProps) => {
  const insets = useSafeAreaInsets();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      progress.value = withSpring(1, { damping: 18, stiffness: 160, mass: 0.8 });
    } else {
      progress.value = withTiming(0, { duration: 200 }, (finished) => {
        if (finished) {
          runOnJS(setMounted)(false);
        }
      });
    }
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 1], [0, 1], Extrapolation.CLAMP),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0, 0.4, 1], [0, 1, 1], Extrapolation.CLAMP),
    transform: [
      { translateY: interpolate(progress.value, [0, 1], [340, 0], Extrapolation.CLAMP) },
    ],
  }));

  if (!mounted) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityLabel={`Close ${title}`}
          accessibilityRole="button"
        />
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { paddingBottom: insets.bottom + 16 }, sheetStyle]}
        accessibilityViewIsModal
      >
        <View style={styles.handle} />
        <View style={styles.header}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <View style={styles.headerRight}>
            {headerAccessory}
            <IconButton
              icon={<CloseIcon color={COLORS.textSecondary} size={18} />}
              onPress={onClose}
              size={36}
              style={styles.closeButton}
            />
          </View>
        </View>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 11, 19, 0.5)',
    zIndex: 16,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 20,
    paddingTop: 10,
    zIndex: 17,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginLeft: 8,
  },
});

export default OverlayPanel;
