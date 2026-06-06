import React from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView } from 'react-native';
import { useFuelStore } from '../../store/useFuelStore';
import { OverlayPanel } from '../../components/OverlayPanel';
import { CheckIcon } from '../../components/Icons';
import { COLORS, TYPOGRAPHY } from '../../theme/Theme';
import { MAP_STYLES, MapStyleId, MapStyleConfig } from './mapStyles';
import { haptics } from '../../utils/haptics';

// Visual metadata defining classifications, key features, and descriptive icons
const STYLE_CLASSIFICATIONS: Record<MapStyleId, {
  icon: string;
  features: string[];
  purpose: string;
}> = {
  streets: {
    icon: '🗺️',
    features: ['Road Networks', 'POIs', '3D Buildings'],
    purpose: 'Ideal for roadway visibility & site navigation',
  },
  dark: {
    icon: '🌙',
    features: ['Night Mode', 'Contrast', 'Neon Accents'],
    purpose: 'Low-light comfort & high-contrast visualization',
  },
  light: {
    icon: '☀️',
    features: ['Clean Layout', 'Outlines', 'Day Visibility'],
    purpose: 'Crisp borders & high daytime readability',
  },
  satellite: {
    icon: '🛰️',
    features: ['Aerial Photo', 'Topography', 'Unlabeled'],
    purpose: 'Pure raw satellite photography details',
  },
  hybrid: {
    icon: '🌐',
    features: ['Satellite Detail', 'Road Overlays', 'Labels'],
    purpose: 'Satellite imagery + full navigation overlays',
  },
};

export const StyleSelector = () => {
  const activePanel = useFuelStore((s) => s.activePanel);
  const setActivePanel = useFuelStore((s) => s.setActivePanel);
  const mapStyleId = useFuelStore((s) => s.mapStyleId);
  const setMapStyle = useFuelStore((s) => s.setMapStyle);

  const handleSelect = (id: MapStyleId) => {
    if (id === mapStyleId) return;
    haptics.toggle();
    setMapStyle(id);
  };

  return (
    <OverlayPanel
      visible={activePanel === 'styles'}
      onClose={() => setActivePanel(null)}
      title="Select Map Style"
    >
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.list}>
          {MAP_STYLES.map((style) => {
            const selected = style.id === mapStyleId;
            const meta = STYLE_CLASSIFICATIONS[style.id] || { icon: '📍', features: [], purpose: '' };

            return (
              <Pressable
                key={style.id}
                onPress={() => handleSelect(style.id)}
                style={[
                  styles.card,
                  selected && styles.cardSelected,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                accessibilityLabel={`${style.label} map style: ${style.description}`}
              >
                {/* Visual Swatch with centered Emoji Icon */}
                <View style={[styles.swatch, { backgroundColor: style.swatch }]}>
                  <Text style={styles.swatchIcon}>{meta.icon}</Text>
                </View>

                {/* Metadata & Classification details */}
                <View style={styles.meta}>
                  <Text style={[styles.label, selected && styles.labelSelected]}>
                    {style.label}
                  </Text>
                  <Text style={styles.purposeText} numberOfLines={1}>
                    {meta.purpose}
                  </Text>

                  {/* Feature Badges */}
                  <View style={styles.badgesRow}>
                    {meta.features.map((feat) => (
                      <View key={feat} style={styles.badge}>
                        <Text style={styles.badgeText}>{feat.toUpperCase()}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Selection Checkmark */}
                {selected ? (
                  <View style={styles.checkBadge}>
                    <CheckIcon size={12} color={COLORS.background} />
                  </View>
                ) : (
                  <View style={styles.checkRing} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </OverlayPanel>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 385,
  },
  list: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  cardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 242, 254, 0.03)',
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  swatchIcon: {
    fontSize: 22,
  },
  meta: {
    flex: 1,
    paddingHorizontal: 12,
  },
  label: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  labelSelected: {
    color: COLORS.primary,
  },
  purposeText: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    marginTop: 2,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.04)',
  },
  badgeText: {
    color: COLORS.textMuted,
    fontSize: 8,
    fontWeight: TYPOGRAPHY.weights.bold,
    letterSpacing: 0.3,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkRing: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
});

export default StyleSelector;
