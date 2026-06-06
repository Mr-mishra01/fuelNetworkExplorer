import React from 'react';
import { StyleSheet, View, Text, ScrollView, Pressable } from 'react-native';
import { useFuelStore } from '../../store/useFuelStore';
import { OverlayPanel } from '../../components/OverlayPanel';
import { ResetIcon } from '../../components/Icons';
import { COLORS, TYPOGRAPHY } from '../../theme/Theme';
import { haptics } from '../../utils/haptics';

const BRANDS = [
  { label: 'All', value: null },
  { label: 'BPCL', value: 'BPCL' },
  { label: 'HPCL', value: 'HPCL' },
  { label: 'Indian Oil', value: 'Indian Oil' },
  { label: 'Shell', value: 'Shell' },
  { label: 'Reliance', value: 'Reliance' },
  { label: 'Nayara', value: 'Nayara' },
];

const TRAFFIC_STEPS = [
  { label: 'Any', value: 0 },
  { label: '40+', value: 40 },
  { label: '70+', value: 70 },
  { label: '90+', value: 90 },
];

const OPPORTUNITY_STEPS = [
  { label: 'Any', value: 0 },
  { label: '75+', value: 75 },
  { label: '85+', value: 85 },
  { label: '95+', value: 95 },
];

const CAPACITY_STEPS = [
  { label: 'Any', value: 0 },
  { label: '2.5M+', value: 2500000 },
  { label: '3.5M+', value: 3500000 },
];

export const FiltersPanel = () => {
  const activePanel = useFuelStore((s) => s.activePanel);
  const setActivePanel = useFuelStore((s) => s.setActivePanel);
  const filters = useFuelStore((s) => s.filters);
  const setFilter = useFuelStore((s) => s.setFilter);
  const resetFilters = useFuelStore((s) => s.resetFilters);

  const hasActiveFilters =
    filters.brand !== null ||
    filters.status !== null ||
    filters.minTrafficScore > 0 ||
    filters.minOpportunityScore > 0 ||
    filters.minCapacity > 0;

  const select = <T,>(fn: () => void) => {
    haptics.toggle();
    fn();
  };

  const renderSteps = (
    steps: { label: string; value: number }[],
    current: number,
    onSelect: (v: number) => void,
  ) => (
    <View style={styles.buttonRow}>
      {steps.map((step) => {
        const isSelected = current === step.value;
        return (
          <Pressable
            key={step.label}
            onPress={() => select(() => onSelect(step.value))}
            style={[styles.stepButton, isSelected && styles.stepButtonSelected]}
            accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
          >
            <Text style={[styles.stepText, isSelected && styles.stepTextSelected]}>
              {step.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );

  return (
    <OverlayPanel
      visible={activePanel === 'filters'}
      onClose={() => setActivePanel(null)}
      title="Filters"
      headerAccessory={
        hasActiveFilters ? (
          <Pressable
            onPress={() => select(resetFilters)}
            style={styles.resetButton}
            accessibilityRole="button"
            accessibilityLabel="Reset filters"
          >
            <ResetIcon size={13} color={COLORS.primary} style={styles.resetIcon} />
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        ) : null
      }
    >
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Brand (Stations)</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          {BRANDS.map((b) => {
            const isSelected = filters.brand === b.value;
            return (
              <Pressable
                key={b.label}
                onPress={() => select(() => setFilter('brand', b.value))}
                style={[styles.chip, isSelected && styles.chipSelected]}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {b.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Traffic Congestion Score</Text>
        {renderSteps(TRAFFIC_STEPS, filters.minTrafficScore, (v) =>
          setFilter('minTrafficScore', v),
        )}

        <Text style={styles.sectionTitle}>Opportunity Expansion Score</Text>
        {renderSteps(OPPORTUNITY_STEPS, filters.minOpportunityScore, (v) =>
          setFilter('minOpportunityScore', v),
        )}

        <Text style={styles.sectionTitle}>Minimum Capacity (Depots)</Text>
        {renderSteps(CAPACITY_STEPS, filters.minCapacity, (v) =>
          setFilter('minCapacity', v),
        )}
      </ScrollView>
    </OverlayPanel>
  );
};

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 380,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
  },
  resetIcon: {
    marginRight: 4,
  },
  resetText: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    marginTop: 14,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  chipRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  chipTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  stepButtonSelected: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderColor: COLORS.primary,
  },
  stepText: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  stepTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default FiltersPanel;
