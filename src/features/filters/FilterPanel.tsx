import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  LayoutAnimation,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFuelStore } from '../../store/useFuelStore';
import { IconButton } from '../../components/IconButton';
import { Card } from '../../components/Card';
import { FilterIcon, ResetIcon } from '../../components/Icons';
import { COLORS, TYPOGRAPHY, EFFECTS } from '../../theme/Theme';

export const FilterPanel = () => {
  const insets = useSafeAreaInsets();
  const { filters, setFilter, resetFilters } = useFuelStore();
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const handleBrandSelect = (brand: string | null) => {
    setFilter('brand', brand);
  };

  const handleTrafficSelect = (score: number) => {
    setFilter('minTrafficScore', score);
  };

  const handleOpportunitySelect = (score: number) => {
    setFilter('minOpportunityScore', score);
  };

  const handleCapacitySelect = (capacity: number) => {
    setFilter('minCapacity', capacity);
  };

  const brands = [
    { label: 'All', value: null },
    { label: 'BPCL', value: 'BPCL' },
    { label: 'HPCL', value: 'HPCL' },
    { label: 'Indian Oil', value: 'Indian Oil' },
    { label: 'Shell', value: 'Shell' },
    { label: 'Reliance', value: 'Reliance' },
    { label: 'Nayara', value: 'Nayara' },
  ];

  const trafficSteps = [
    { label: 'Any', value: 0 },
    { label: '40+', value: 40 },
    { label: '70+', value: 70 },
    { label: '90+', value: 90 },
  ];

  const opportunitySteps = [
    { label: 'Any', value: 0 },
    { label: '75+', value: 75 },
    { label: '85+', value: 85 },
    { label: '95+', value: 95 },
  ];

  const capacitySteps = [
    { label: 'Any', value: 0 },
    { label: '2.5M+', value: 2500000 },
    { label: '3.5M+', value: 3500000 },
  ];

  // Helper check to see if any filter is active
  const hasActiveFilters =
    filters.brand !== null ||
    filters.status !== null ||
    filters.minTrafficScore > 0 ||
    filters.minOpportunityScore > 0 ||
    filters.minCapacity > 0;

  return (
    <View style={[styles.container, { top: insets.top + 70 + 52 }]}>
      <IconButton
        icon={
          <FilterIcon
            color={expanded || hasActiveFilters ? COLORS.primary : COLORS.textPrimary}
            size={22}
          />
        }
        onPress={toggleExpanded}
        active={expanded}
        activeColor={COLORS.surfaceElevated}
        style={styles.floatingButton}
      />

      {/* Indicator dot showing filters are active */}
      {!expanded && hasActiveFilters && <View style={styles.activeIndicator} />}

      {expanded && (
        <Card style={styles.expandedPanel} glass={true}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Map</Text>
            {hasActiveFilters && (
              <Pressable onPress={resetFilters} style={styles.resetButton}>
                <ResetIcon size={14} color={COLORS.primary} style={styles.resetIcon} />
                <Text style={styles.resetText}>Reset</Text>
              </Pressable>
            )}
          </View>
          <View style={styles.divider} />

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Brands Section */}
            <Text style={styles.sectionTitle}>Brand (Stations)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {brands.map((b) => {
                const isSelected = filters.brand === b.value;
                return (
                  <Pressable
                    key={b.label}
                    onPress={() => handleBrandSelect(b.value)}
                    style={[
                      styles.chip,
                      isSelected && styles.chipSelected,
                    ]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {b.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Traffic Score Section */}
            <Text style={styles.sectionTitle}>Traffic Congestion Score</Text>
            <View style={styles.buttonRow}>
              {trafficSteps.map((step) => {
                const isSelected = filters.minTrafficScore === step.value;
                return (
                  <Pressable
                    key={step.label}
                    onPress={() => handleTrafficSelect(step.value)}
                    style={[
                      styles.stepButton,
                      isSelected && styles.stepButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepText,
                        isSelected && styles.stepTextSelected,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Opportunity Score Section */}
            <Text style={styles.sectionTitle}>Opportunity Expansion Score</Text>
            <View style={styles.buttonRow}>
              {opportunitySteps.map((step) => {
                const isSelected = filters.minOpportunityScore === step.value;
                return (
                  <Pressable
                    key={step.label}
                    onPress={() => handleOpportunitySelect(step.value)}
                    style={[
                      styles.stepButton,
                      isSelected && styles.stepButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepText,
                        isSelected && styles.stepTextSelected,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Depot Capacity Section */}
            <Text style={styles.sectionTitle}>Minimum Capacity (Depots)</Text>
            <View style={styles.buttonRow}>
              {capacitySteps.map((step) => {
                const isSelected = filters.minCapacity === step.value;
                return (
                  <Pressable
                    key={step.label}
                    onPress={() => handleCapacitySelect(step.value)}
                    style={[
                      styles.stepButton,
                      isSelected && styles.stepButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepText,
                        isSelected && styles.stepTextSelected,
                      ]}
                    >
                      {step.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
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
  activeIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    borderWidth: 1.5,
    borderColor: COLORS.background,
    zIndex: 10,
  },
  expandedPanel: {
    width: 260,
    maxHeight: 380,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
    letterSpacing: 0.5,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
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
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  scrollArea: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
    textTransform: 'uppercase',
    marginTop: 8,
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginRight: 6,
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
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  chipTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  stepButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    marginHorizontal: 2,
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
    fontSize: TYPOGRAPHY.sizes.xs,
  },
  stepTextSelected: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
});

export default FilterPanel;
