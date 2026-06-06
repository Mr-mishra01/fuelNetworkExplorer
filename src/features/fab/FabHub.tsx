import React, { useState, useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Pressable, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { useFuelStore, ActivePanel } from '../../store/useFuelStore';
import {
  PlusIcon,
  LayersIcon,
  PaletteIcon,
  FilterIcon,
  CrosshairIcon,
  WifiOffIcon,
} from '../../components/Icons';
import { COLORS, TYPOGRAPHY, EFFECTS } from '../../theme/Theme';
import { haptics } from '../../utils/haptics';

const FAB_SIZE = 58;
const ACTION_SIZE = 48;
const ITEM_STEP = ACTION_SIZE + 14;
const CONTAINER_WIDTH = 220;
// Container must be tall enough so all items sit within layout bounds.
// Android drops touches outside a View's layout rect even if content is visible.
const CONTAINER_HEIGHT = FAB_SIZE + ITEM_STEP * 5 + 16;

const OPEN_SPRING = { damping: 18, stiffness: 220, mass: 0.6 };
const CLOSE_SPRING = { damping: 22, stiffness: 280, mass: 0.5 };

interface FabAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

interface FabHubProps {
  onResetView: () => void;
}

export const FabHub = ({ onResetView }: FabHubProps) => {
  const insets = useSafeAreaInsets();
  const setActivePanel = useFuelStore((s) => s.setActivePanel);
  const activePanel = useFuelStore((s) => s.activePanel);
  const filters = useFuelStore((s) => s.filters);

  const filterCount = (() => {
    let count = 0;
    if (filters.brand !== null) count++;
    if (filters.status !== null) count++;
    if (filters.minTrafficScore > 0) count++;
    if (filters.minOpportunityScore > 0) count++;
    if (filters.minCapacity > 0) count++;
    return count;
  })();

  const [isOpen, setIsOpen] = useState(false);
  const progress = useSharedValue(0);
  // Snapshot of isOpen captured when the detail sheet opens, restored on dismiss.
  const prevOpenRef = useRef(false);
  const selectedFeature = useFuelStore((s) => s.selectedFeature);

  // Use a ref to track the latest isOpen value to avoid stale closure in the selectedFeature hook
  const isOpenRef = useRef(isOpen);
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (selectedFeature) {
      // A feature was tapped — save current FAB state then close it.
      prevOpenRef.current = isOpenRef.current;
      if (isOpenRef.current) {
        setIsOpen(false);
        progress.value = withSpring(0, CLOSE_SPRING);
      }
    } else {
      // Sheet dismissed — restore the FAB to its previous state.
      if (prevOpenRef.current) {
        setIsOpen(true);
        progress.value = withSpring(1, OPEN_SPRING);
        prevOpenRef.current = false;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFeature]);

  const close = useCallback(() => {
    setIsOpen(false);
    progress.value = withSpring(0, CLOSE_SPRING);
  }, [progress]);

  const open = useCallback(() => {
    setIsOpen(true);
    progress.value = withSpring(1, OPEN_SPRING);
  }, [progress]);

  const toggle = useCallback(() => {
    haptics.action();
    isOpen ? close() : open();
  }, [isOpen, open, close]);

  const runPanelAction = useCallback(
    (panel: Exclude<ActivePanel, null>) => {
      haptics.toggle();
      close();
      setActivePanel(activePanel === panel ? null : panel);
    },
    [activePanel, setActivePanel, close],
  );

  const actions: FabAction[] = [
    {
      key: 'layers',
      label: 'Layers',
      icon: <LayersIcon size={20} color={COLORS.textPrimary} />,
      color: COLORS.fuel_station,
      onPress: () => runPanelAction('layers'),
    },
    {
      key: 'styles',
      label: 'Map Style',
      icon: <PaletteIcon size={20} color={COLORS.textPrimary} />,
      color: COLORS.accent,
      onPress: () => runPanelAction('styles'),
    },
    {
      key: 'filters',
      label: 'Filters',
      icon: <FilterIcon size={18} color={COLORS.textPrimary} />,
      color: COLORS.secondary,
      onPress: () => runPanelAction('filters'),
    },
    {
      key: 'offline',
      label: 'Offline Maps',
      icon: <WifiOffIcon size={18} color={COLORS.textPrimary} />,
      color: COLORS.primary,
      onPress: () => runPanelAction('offline'),
    },
    {
      key: 'reset',
      label: 'Reset View',
      icon: <CrosshairIcon size={18} color={COLORS.textPrimary} />,
      color: COLORS.depot,
      onPress: () => {
        haptics.action();
        close();
        onResetView();
      },
    },
  ];

  // Rotate + icon to ×
  const fabIconStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: `${interpolate(progress.value, [0, 1], [0, 135], Extrapolation.CLAMP)}deg`,
      },
    ],
  }));

  const bottomOffset = insets.bottom + 24;

  return (
    <>
      {/* Scrim — conditionally rendered so it NEVER blocks touches when closed */}
      {isOpen && (
        <Animated.View style={styles.scrim}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={close}
            activeOpacity={1}
            accessibilityLabel="Close action menu"
            accessibilityRole="button"
          />
        </Animated.View>
      )}

      {/*
        Container is CONTAINER_WIDTH wide so all action items (label + button)
        fit within the touch-event boundary on Android.
        FAB sits flush to the right edge; labels extend leftward.
      */}
      <View
        style={[styles.container, { bottom: bottomOffset }]}
        pointerEvents="box-none"
      >
        {/* Action items — rendered only when open to avoid invisible touch blockers */}
        {isOpen &&
          actions.map((action, index) => (
            <FabActionItem
              key={action.key}
              action={action}
              index={index}
              total={actions.length}
              progress={progress}
              spinning={false}
              filterCount={filterCount}
            />
          ))}

        {/* Primary FAB */}
        <TouchableOpacity
          onPress={toggle}
          style={styles.fab}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          accessibilityLabel={isOpen ? 'Close map actions' : 'Open map actions'}
        >
          <Animated.View style={fabIconStyle}>
            <PlusIcon size={26} color={COLORS.background} />
          </Animated.View>
          {!isOpen && filterCount > 0 && (
            <View style={styles.fabBadge}>
              <Text style={styles.fabBadgeText}>{filterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};

interface FabActionItemProps {
  action: FabAction;
  index: number;
  total: number;
  progress: SharedValue<number>;
  spinning?: boolean;
  filterCount: number;
}

const FabActionItem = ({ action, index, total, progress, spinning, filterCount }: FabActionItemProps) => {
  // Each item sits at a fixed bottom position within the container (inside layout bounds).
  // FAB is at bottom 0; item 0 is one step above FAB, item 1 two steps, etc.
  const itemBottom = FAB_SIZE + ITEM_STEP * index + 6;

  // Animation: items slide in from their resting position (no translateY overflow needed)
  const staggerStart = ((total - 1 - index) / total) * 0.2;

  const animStyle = useAnimatedStyle(() => {
    const t = interpolate(progress.value, [staggerStart, 1], [0, 1], Extrapolation.CLAMP);
    return {
      opacity: t,
      transform: [
        { translateY: interpolate(t, [0, 1], [20, 0]) },
        { scale: interpolate(t, [0, 1], [0.6, 1]) },
      ],
    };
  });

  const labelStyle = useAnimatedStyle(() => ({
    opacity: interpolate(progress.value, [0.55, 1], [0, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateX: interpolate(
          progress.value,
          [0.55, 1],
          [8, 0],
          Extrapolation.CLAMP,
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.actionItem, animStyle, { bottom: itemBottom }]}>
      <Animated.View style={[styles.labelPill, labelStyle]} pointerEvents="none">
        <Text style={styles.labelText}>{action.label}</Text>
      </Animated.View>

      <TouchableOpacity
        onPress={action.onPress}
        activeOpacity={0.75}
        style={[
          styles.actionButton,
          { borderColor: `${action.color}99`, shadowColor: action.color },
          spinning && styles.actionButtonActive,
        ]}
        accessibilityRole="button"
        accessibilityLabel={action.label}
      >
        {action.icon}
        {action.key === 'filters' && filterCount > 0 && (
          <View style={styles.actionBadge}>
            <Text style={styles.actionBadgeText}>{filterCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(5, 8, 16, 0.58)',
    zIndex: 14,
  },
  container: {
    position: 'absolute',
    right: 20,
    width: CONTAINER_WIDTH,
    // tall enough to contain all action items within layout bounds
    // Android clips touch events to the layout rect, so items must sit inside it
    height: CONTAINER_HEIGHT,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    zIndex: 15,
  },
  fab: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: FAB_SIZE / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.75,
    shadowRadius: 18,
    elevation: 14,
  },
  actionItem: {
    position: 'absolute',
    right: 0,
    width: CONTAINER_WIDTH,
    height: ACTION_SIZE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  labelPill: {
    ...EFFECTS.glass,
    marginRight: 10,
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 10,
  },
  labelText: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.2,
  },
  actionButton: {
    width: ACTION_SIZE,
    height: ACTION_SIZE,
    borderRadius: ACTION_SIZE / 2,
    backgroundColor: COLORS.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
  },
  actionButtonActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.18)',
  },
  fabBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#FF4D8D',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.background,
    shadowColor: '#FF4D8D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6,
  },
  fabBadgeText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
  actionBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF4D8D',
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.2,
    borderColor: COLORS.surfaceElevated,
  },
  actionBadgeText: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
    fontFamily: TYPOGRAPHY.fontFamily,
  },
});

export default FabHub;
