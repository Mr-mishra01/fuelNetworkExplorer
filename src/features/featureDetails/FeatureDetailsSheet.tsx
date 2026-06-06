import React, { useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useFuelStore } from '../../store/useFuelStore';
import { IconButton } from '../../components/IconButton';
import { Skeleton } from '../../components/Skeleton';
import {
  CloseIcon,
  StationIcon,
  DepotIcon,
  RouteIcon,
  TrafficIcon,
  OpportunityIcon,
} from '../../components/Icons';
import { COLORS, TYPOGRAPHY } from '../../theme/Theme';
import { haptics } from '../../utils/haptics';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sheet geometry
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.85;
const PEEK_HEIGHT = SCREEN_HEIGHT * 0.44;
const EXPANDED = 0;
const COLLAPSED = SHEET_HEIGHT - PEEK_HEIGHT;
const CLOSED = SHEET_HEIGHT;

const SPRING = { damping: 22, stiffness: 200, mass: 0.85 };

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.min(Math.max(value, min), max);
};

const formatKeyLabel = (key: string) =>
  key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const formatValue = (key: string, value: any): string => {
  if (value === null || value === undefined) return 'N/A';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    if (key.includes('capacity') || key.includes('sales') || key.includes('stock') || key.includes('count'))
      return value.toLocaleString();
    if (key.includes('score')) return `${value}/100`;
    if (key.includes('distance')) return `${value} km`;
    if (key.includes('time')) return `${value} mins`;
    return value.toLocaleString();
  }
  return String(value);
};

interface EntityStyle {
  color: string;
  neon: string;
  label: string;
  icon: (size: number) => React.ReactNode;
}

const ENTITY_STYLES: Record<string, EntityStyle> = {
  fuel_station: {
    color: COLORS.fuel_station,
    neon: '#00FFB2',
    label: 'Fuel Station',
    icon: (s) => <StationIcon size={s} color="#00FFB2" />,
  },
  depot: {
    color: COLORS.depot,
    neon: '#38BFFF',
    label: 'Depot',
    icon: (s) => <DepotIcon size={s} color="#38BFFF" />,
  },
  opportunity: {
    color: COLORS.opportunity,
    neon: '#FF4D8D',
    label: 'Opportunity Site',
    icon: (s) => <OpportunityIcon size={s} color="#FF4D8D" />,
  },
  supply_route: {
    color: COLORS.supply_route,
    neon: '#A78BFA',
    label: 'Supply Route',
    icon: (s) => <RouteIcon size={s} color="#A78BFA" />,
  },
  traffic: {
    color: COLORS.trafficHigh,
    neon: '#FF5B5B',
    label: 'Traffic Segment',
    icon: (s) => <TrafficIcon size={s} color="#FF5B5B" />,
  },
};

const DEFAULT_ENTITY: EntityStyle = {
  color: COLORS.primary,
  neon: COLORS.primary,
  label: 'Feature',
  icon: (s) => <StationIcon size={s} color={COLORS.primary} />,
};

export const FeatureDetailsSheet = () => {
  const insets = useSafeAreaInsets();
  const selectedFeature = useFuelStore((s) => s.selectedFeature);
  const setSelectedFeature = useFuelStore((s) => s.setSelectedFeature);

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const translateY = useSharedValue(CLOSED);
  const startY = useSharedValue(CLOSED);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const close = () => setSelectedFeature(null);

  const featureKey = selectedFeature
    ? `${selectedFeature.id ?? ''}-${selectedFeature.properties?.id ?? ''}`
    : null;

  useEffect(() => {
    if (selectedFeature) {
      setMounted(true);
      haptics.selection();
      setLoading(true);
      if (loadTimer.current) clearTimeout(loadTimer.current);
      loadTimer.current = setTimeout(() => setLoading(false), 320);
      translateY.value = withSpring(COLLAPSED, SPRING);
    } else {
      translateY.value = withTiming(CLOSED, { duration: 250 }, (finished) => {
        if (finished) runOnJS(setMounted)(false);
      });
    }
    return () => {
      if (loadTimer.current) clearTimeout(loadTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureKey]);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      translateY.value = clamp(startY.value + e.translationY, EXPANDED, CLOSED);
    })
    .onEnd((e) => {
      const pos = translateY.value;
      const vel = e.velocityY;
      if (pos > COLLAPSED + 80 || vel > 900) {
        translateY.value = withTiming(CLOSED, { duration: 220 }, (done) => {
          if (done) runOnJS(close)();
        });
      } else if (pos < COLLAPSED / 2 || vel < -700) {
        translateY.value = withSpring(EXPANDED, SPRING);
      } else {
        translateY.value = withSpring(COLLAPSED, SPRING);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const grabberOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [EXPANDED, COLLAPSED, CLOSED],
      [1, 0.9, 0.3],
      Extrapolation.CLAMP,
    ),
  }));

  const scrollContentStyle = useAnimatedStyle(() => ({
    paddingBottom: 28 + interpolate(
      translateY.value,
      [EXPANDED, COLLAPSED],
      [0, COLLAPSED],
      Extrapolation.CLAMP,
    ),
  }));

  if (!mounted || !selectedFeature) return null;

  const props = selectedFeature.properties ?? {};
  const entityType: string = props.entity_type ?? 'feature';
  const es = ENTITY_STYLES[entityType] ?? DEFAULT_ENTITY;

  const getTitle = () => {
    if (props.name) return props.name;
    if (props.source && props.destination) return `${props.source} → ${props.destination}`;
    if (props.road_name) return props.road_name;
    return es.label;
  };

  const excludeKeys = new Set(['id', 'entity_type', 'name', 'uid', 'source', 'destination']);
  const filteredKeys = Object.keys(props).filter((k) => !excludeKeys.has(k));

  // Stock gauges for stations / depots
  const gauges: { label: string; pct: number; color: string; text: string }[] = [];
  if (props.petrol_capacity && props.current_petrol_stock !== undefined) {
    const pct = Math.min(100, Math.max(0, (props.current_petrol_stock / props.petrol_capacity) * 100));
    gauges.push({
      label: 'Petrol Stock',
      pct,
      color: '#F59E0B',
      text: `${props.current_petrol_stock.toLocaleString()} / ${props.petrol_capacity.toLocaleString()} L`,
    });
  }
  if (props.diesel_capacity && props.current_diesel_stock !== undefined) {
    const pct = Math.min(100, Math.max(0, (props.current_diesel_stock / props.diesel_capacity) * 100));
    gauges.push({
      label: 'Diesel Stock',
      pct,
      color: '#10B981',
      text: `${props.current_diesel_stock.toLocaleString()} / ${props.diesel_capacity.toLocaleString()} L`,
    });
  }

  return (
    <Animated.View
      style={[
        styles.sheet,
        {
          height: SHEET_HEIGHT,
          paddingBottom: insets.bottom + 12,
          borderTopColor: es.neon,
        },
        sheetStyle,
      ]}
      accessibilityViewIsModal
    >
      {/* Neon top-border glow */}
      <View style={[styles.neonTopBar, { backgroundColor: es.neon }]} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={grabberOpacity}>
          {/* Handle pill */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {/* Icon badge */}
              <View style={[styles.iconBadge, { backgroundColor: `${es.neon}1A`, borderColor: `${es.neon}40` }]}>
                {es.icon(24)}
              </View>

              <View style={styles.headerText}>
                <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
                  {getTitle()}
                </Text>
                {/* Entity type chip */}
                <View style={[styles.typeBadge, { backgroundColor: `${es.neon}22`, borderColor: `${es.neon}55` }]}>
                  <View style={[styles.typeDot, { backgroundColor: es.neon }]} />
                  <Text style={[styles.typeLabel, { color: es.neon }]}>{es.label.toUpperCase()}</Text>
                </View>
              </View>
            </View>

            <IconButton
              icon={<CloseIcon color={COLORS.textSecondary} size={17} />}
              onPress={close}
              size={34}
              style={styles.closeBtn}
            />
          </View>
        </Animated.View>
      </GestureDetector>

      <View style={styles.separator} />

      <Animated.ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, scrollContentStyle]}
      >
        {loading ? (
          <DetailsSkeleton />
        ) : (
          <>
            {/* Stock gauges */}
            {gauges.length > 0 && (
              <View style={styles.gaugeBox}>
                {gauges.map((g) => (
                  <View key={g.label} style={styles.gaugeRow}>
                    <View style={styles.gaugeHead}>
                      <Text style={styles.gaugeLabel}>{g.label}</Text>
                      <Text style={[styles.gaugeVal, { color: g.color }]}>{g.pct.toFixed(0)}%</Text>
                    </View>
                    <Text style={styles.gaugeSub}>{g.text}</Text>
                    <View style={styles.gaugeTrack}>
                      <View style={[styles.gaugeFill, { width: `${g.pct}%` as any, backgroundColor: g.color }]} />
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Source → Destination for routes */}
            {props.source && props.destination && (
              <View style={[styles.routeBox, { borderColor: `${es.neon}33` }]}>
                <View style={styles.routeEndpoint}>
                  <View style={[styles.routeDot, { backgroundColor: '#10B981' }]} />
                  <View>
                    <Text style={styles.routeEndLabel}>FROM</Text>
                    <Text style={styles.routeEndValue}>{props.source}</Text>
                  </View>
                </View>
                <View style={styles.routeArrowLine} />
                <View style={styles.routeEndpoint}>
                  <View style={[styles.routeDot, { backgroundColor: es.neon }]} />
                  <View>
                    <Text style={styles.routeEndLabel}>TO</Text>
                    <Text style={styles.routeEndValue}>{props.destination}</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Dynamic properties grid */}
            {filteredKeys.length > 0 && (
              <View style={styles.propsGrid}>
                {filteredKeys.map((key) => {
                  const val = props[key];
                  if (val === null || val === undefined) return null;
                  return (
                    <View key={key} style={[styles.propCard, { borderColor: `${es.neon}18` }]}>
                      <Text style={styles.propKey}>{formatKeyLabel(key)}</Text>
                      <Text style={styles.propValue}>{formatValue(key, val)}</Text>
                    </View>
                  );
                })}
              </View>
            )}

            {filteredKeys.length === 0 && gauges.length === 0 && (
              <Text style={styles.emptyText}>No additional data available.</Text>
            )}
          </>
        )}
      </Animated.ScrollView>
    </Animated.View>
  );
};

const DetailsSkeleton = () => (
  <View style={{ paddingTop: 4 }}>
    <Skeleton width="100%" height={60} radius={12} style={{ marginBottom: 14 }} />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={{ width: '48%', marginBottom: 12 }}>
          <Skeleton width="55%" height={9} style={{ marginBottom: 8 }} />
          <Skeleton width="80%" height={15} />
        </View>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 2,
    zIndex: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 22,
    overflow: 'hidden',
  },
  neonTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.85,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBadge: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  headerText: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 5,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  typeDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.6,
  },
  closeBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 18,
    marginBottom: 2,
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  // Gauges
  gaugeBox: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 14,
    marginBottom: 14,
  },
  gaugeRow: {
    marginBottom: 14,
  },
  gaugeHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  gaugeLabel: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  gaugeVal: {
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  gaugeSub: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    marginBottom: 6,
  },
  gaugeTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Route box
  routeBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  routeEndpoint: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  routeArrowLine: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginLeft: 5,
    marginVertical: 2,
  },
  routeEndLabel: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 9,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.5,
    marginBottom: 1,
  },
  routeEndValue: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  // Properties grid
  propsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  propCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  propKey: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.3,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  propValue: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginTop: 24,
  },
});

export default FeatureDetailsSheet;
