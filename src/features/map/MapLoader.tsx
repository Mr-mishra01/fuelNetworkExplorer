import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { COLORS, TYPOGRAPHY } from '../../theme/Theme';
import { StationIcon } from '../../components/Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface MapLoaderProps {
  visible: boolean;
}

const STATUS_MESSAGES = [
  'Establishing secure connection...',
  'Fetching telemetry channels...',
  'Downloading vector tiles...',
  'Caching local region grids...',
  'Rendering fuel network...',
];

export const MapLoader = ({ visible }: MapLoaderProps) => {
  const [isMounted, setIsMounted] = useState(visible);
  const [statusIdx, setStatusIdx] = useState(0);

  const opacity = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseScaleOuter = useSharedValue(1);
  const progressBarX = useSharedValue(-80);

  // Handle mounting and fade-out transition
  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      opacity.value = 1;
    } else {
      opacity.value = withTiming(0, { duration: 650 }, (finished) => {
        if (finished) {
          runOnJS(setIsMounted)(false);
        }
      });
    }
  }, [visible, opacity]);

  // Pulse animations for concentric radar rings
  useEffect(() => {
    if (isMounted) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.12, { duration: 900 }),
          withTiming(1.0, { duration: 900 })
        ),
        -1,
        true
      );
      pulseScaleOuter.value = withRepeat(
        withSequence(
          withTiming(1.22, { duration: 1200 }),
          withTiming(1.0, { duration: 1200 })
        ),
        -1,
        true
      );
    }
  }, [isMounted, pulseScale, pulseScaleOuter]);

  // Slide animation for progress bar glass reflection
  useEffect(() => {
    if (isMounted) {
      progressBarX.value = withRepeat(
        withTiming(200, { duration: 1400 }),
        -1,
        false
      );
    }
  }, [isMounted, progressBarX]);

  // Cycle status messages for premium sci-fi telemetry experience
  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      setStatusIdx((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, [isMounted]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const pulseOuterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScaleOuter.value }],
  }));

  const barStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progressBarX.value }],
  }));

  if (!isMounted) return null;

  return (
    <Animated.View style={[styles.container, containerStyle]} pointerEvents="none">
      <View style={styles.content}>
        {/* Futuristic glowing concentric radar rings */}
        <View style={styles.radarContainer}>
          <Animated.View style={[styles.radarOuter, pulseOuterStyle]} />
          <Animated.View style={[styles.radarMiddle, pulseStyle]} />
          <View style={styles.radarInner}>
            <StationIcon size={32} color={COLORS.primary} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>INITIALIZING TELEMETRY</Text>

        {/* Status text */}
        <Text style={styles.subtitle}>{STATUS_MESSAGES[statusIdx]}</Text>

        {/* Sleek progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View style={[styles.progressBar, barStyle]} />
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#0B0F19', // Deep dark theme background matches COLORS.background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999, // Ensure it is above all panels and views
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  radarContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 36,
  },
  radarOuter: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1.5,
    borderColor: 'rgba(0, 242, 254, 0.12)',
    borderStyle: 'dashed',
  },
  radarMiddle: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
  },
  radarInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderWidth: 2,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '700',
    letterSpacing: 2.2,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#afb7c4', // Matches textMuted color
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: '500',
    marginBottom: 24,
    height: 18, // Fixed height to prevent layouts shifting when message length changes
    textAlign: 'center',
    opacity: 0.8,
  },
  progressContainer: {
    width: 200,
    height: 4,
    justifyContent: 'center',
  },
  progressTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    width: 80,
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});

export default MapLoader;
