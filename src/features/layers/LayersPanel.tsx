import React from 'react';
import { StyleSheet, View, Text, Switch, Platform } from 'react-native';
import { useFuelStore } from '../../store/useFuelStore';
import { OverlayPanel } from '../../components/OverlayPanel';
import {
  StationIcon,
  DepotIcon,
  RouteIcon,
  TrafficIcon,
  OpportunityIcon,
} from '../../components/Icons';
import { COLORS, TYPOGRAPHY } from '../../theme/Theme';
import { LayerVisibilityState } from '../../types';
import { haptics } from '../../utils/haptics';

interface LayerRow {
  key: keyof LayerVisibilityState;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const LAYERS: LayerRow[] = [
  {
    key: 'fuel_station',
    label: 'Fuel Stations',
    description: 'Retail outlets by brand',
    icon: <StationIcon size={18} color={COLORS.fuel_station} />,
    color: COLORS.fuel_station,
  },
  {
    key: 'depot',
    label: 'Depots',
    description: 'Storage & distribution hubs',
    icon: <DepotIcon size={18} color={COLORS.depot} />,
    color: COLORS.depot,
  },
  {
    key: 'supply_route',
    label: 'Supply Routes',
    description: 'Depot → station logistics',
    icon: <RouteIcon size={18} color={COLORS.supply_route} />,
    color: COLORS.supply_route,
  },
  {
    key: 'traffic',
    label: 'Traffic Segments',
    description: 'Congestion (appears when zoomed in)',
    icon: <TrafficIcon size={18} color={COLORS.trafficMedium} />,
    color: COLORS.trafficMedium,
  },
  {
    key: 'opportunity',
    label: 'Opportunity Locations',
    description: 'Expansion candidates',
    icon: <OpportunityIcon size={18} color={COLORS.opportunity} />,
    color: COLORS.opportunity,
  },
];

export const LayersPanel = () => {
  const activePanel = useFuelStore((s) => s.activePanel);
  const setActivePanel = useFuelStore((s) => s.setActivePanel);
  const layerVisibility = useFuelStore((s) => s.layerVisibility);
  const toggleLayer = useFuelStore((s) => s.toggleLayer);

  const handleToggle = (key: keyof LayerVisibilityState) => {
    haptics.toggle();
    toggleLayer(key);
  };

  return (
    <OverlayPanel
      visible={activePanel === 'layers'}
      onClose={() => setActivePanel(null)}
      title="Layers"
    >
      <View style={styles.list}>
        {LAYERS.map((layer) => {
          const enabled = layerVisibility[layer.key];
          return (
            <View key={layer.key} style={styles.row}>
              <View style={[styles.iconWrap, { backgroundColor: `${layer.color}1A` }]}>
                {layer.icon}
              </View>
              <View style={styles.textWrap}>
                <Text style={styles.label}>{layer.label}</Text>
                <Text style={styles.description}>{layer.description}</Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={() => handleToggle(layer.key)}
                trackColor={{ false: '#334155', true: `${COLORS.primary}80` }}
                thumbColor={enabled ? COLORS.primary : '#94a3b8'}
                ios_backgroundColor="#334155"
                accessibilityLabel={`${layer.label} layer`}
                style={Platform.OS === 'ios' ? { transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] } : {}}
              />
            </View>
          );
        })}
      </View>
      <Text style={styles.footnote}>
        Traffic and opportunity layers reveal automatically as you zoom in to
        keep the map readable.
      </Text>
    </OverlayPanel>
  );
};

const styles = StyleSheet.create({
  list: {
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textWrap: {
    flex: 1,
  },
  label: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  description: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  footnote: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    lineHeight: 16,
    marginTop: 12,
  },
});

export default LayersPanel;
