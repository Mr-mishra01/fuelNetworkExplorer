import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, Pressable, LayoutAnimation, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFuelStore } from '../../store/useFuelStore';
import { IconButton } from '../../components/IconButton';
import { Card } from '../../components/Card';
import { LayersIcon, StationIcon, DepotIcon, RouteIcon, TrafficIcon, OpportunityIcon } from '../../components/Icons';
import { COLORS, TYPOGRAPHY } from '../../theme/Theme';
import { LayerVisibilityState } from '../../types';

export const LayerControls = () => {
  const insets = useSafeAreaInsets();
  const { layerVisibility, toggleLayer } = useFuelStore();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    // Smooth transition
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const layersList: {
    key: keyof LayerVisibilityState;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      key: 'fuel_station',
      label: 'Fuel Stations',
      icon: <StationIcon size={16} color={COLORS.fuel_station} />,
      color: COLORS.fuel_station,
    },
    {
      key: 'depot',
      label: 'Fuel Depots',
      icon: <DepotIcon size={16} color={COLORS.depot} />,
      color: COLORS.depot,
    },
    {
      key: 'supply_route',
      label: 'Supply Routes',
      icon: <RouteIcon size={16} color={COLORS.supply_route} />,
      color: COLORS.supply_route,
    },
    {
      key: 'traffic',
      label: 'Traffic Segments',
      icon: <TrafficIcon size={16} color={COLORS.textSecondary} />,
      color: COLORS.textSecondary,
    },
    {
      key: 'opportunity',
      label: 'Expansion Sites',
      icon: <OpportunityIcon size={16} color={COLORS.opportunity} />,
      color: COLORS.opportunity,
    },
  ];

  return (
    <View style={[styles.container, { top: insets.top + 70 }]}>
      <IconButton
        icon={<LayersIcon color={expanded ? COLORS.primary : COLORS.textPrimary} size={22} />}
        onPress={toggleExpanded}
        active={expanded}
        activeColor={COLORS.surfaceElevated}
        style={styles.floatingButton}
      />

      {expanded && (
        <Card style={styles.expandedPanel} glass={true}>
          <Text style={styles.title}>Map Layers</Text>
          <View style={styles.divider} />
          {layersList.map((layer) => (
            <View key={layer.key} style={styles.row}>
              <View style={styles.labelContainer}>
                <View style={[styles.iconWrapper, { backgroundColor: `${layer.color}15` }]}>
                  {layer.icon}
                </View>
                <Text style={styles.layerLabel}>{layer.label}</Text>
              </View>
              <Switch
                value={layerVisibility[layer.key]}
                onValueChange={() => toggleLayer(layer.key)}
                trackColor={{ false: '#334155', true: `${COLORS.primary}80` }}
                thumbColor={layerVisibility[layer.key] ? COLORS.primary : '#94a3b8'}
                ios_backgroundColor="#334155"
                style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] } : {}}
              />
            </View>
          ))}
        </Card>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    zIndex: 9,
    alignItems: 'flex-end',
  },
  floatingButton: {
    marginBottom: 8,
  },
  expandedPanel: {
    width: 220,
    padding: 14,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  layerLabel: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default LayerControls;
