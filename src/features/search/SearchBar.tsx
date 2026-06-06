import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  Text,
  ScrollView,
  Pressable,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut, FadeInDown } from 'react-native-reanimated';
import { useFuelStore } from '../../store/useFuelStore';
import {
  SearchIcon,
  CloseIcon,
  StationIcon,
  DepotIcon,
  OpportunityIcon,
} from '../../components/Icons';
import { SearchResultSkeleton } from '../../components/Skeleton';
import { COLORS, TYPOGRAPHY, EFFECTS } from '../../theme/Theme';
import { SearchItem } from '../../types';
import { haptics } from '../../utils/haptics';

const DEBOUNCE_MS = 350;

export const SearchBar = () => {
  const insets = useSafeAreaInsets();
  const searchQuery = useFuelStore((s) => s.searchQuery);
  const searchResults = useFuelStore((s) => s.searchResults);
  const setSearchQuery = useFuelStore((s) => s.setSearchQuery);
  const clearSearch = useFuelStore((s) => s.clearSearch);
  const setSelectedFeature = useFuelStore((s) => s.setSelectedFeature);
  const setViewport = useFuelStore((s) => s.setViewport);

  const [inputVal, setInputVal] = useState(searchQuery);
  const [isFocused, setIsFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputVal(searchQuery);
  }, [searchQuery]);

  const handleTextChange = (text: string) => {
    setInputVal(text);
    setLoading(true);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setSearchQuery(text);
      setLoading(false);
    }, DEBOUNCE_MS);
  };

  const handleClear = () => {
    setInputVal('');
    clearSearch();
    Keyboard.dismiss();
  };

  const handleSelectResult = (item: SearchItem) => {
    haptics.selection();
    Keyboard.dismiss();
    setIsFocused(false);

    // Smooth fly-to with a closer, slightly tilted framing of the feature.
    setViewport({ center: item.coords, zoom: 15, pitch: 45 }, 'fly');

    setSelectedFeature({
      type: 'Feature',
      id: item.id,
      geometry: { type: 'Point', coordinates: item.coords },
      properties: item.properties,
    });

    clearSearch();
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'fuel_station':
        return <StationIcon size={18} />;
      case 'depot':
        return <DepotIcon size={18} />;
      case 'opportunity':
        return <OpportunityIcon size={18} />;
      default:
        return <SearchIcon size={18} />;
    }
  };

  const showOverlay = isFocused && inputVal.trim().length > 0;
  const showSkeleton = loading && searchResults.length === 0;
  const showEmpty =
    !loading && inputVal.trim().length > 2 && searchResults.length === 0;

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}>
      <View style={[styles.container, isFocused && styles.containerFocused]}>
        <SearchIcon color={COLORS.textSecondary} size={20} style={styles.searchIcon} />
        <TextInput
          value={inputVal}
          onChangeText={handleTextChange}
          placeholder="Search stations, depots, areas..."
          placeholderTextColor={COLORS.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          style={styles.input}
          returnKeyType="search"
          accessibilityLabel="Search the fuel network"
          maxLength={50}
        />
        {inputVal.length > 0 && (
          <Pressable
            onPress={handleClear}
            style={styles.actionIcon}
            accessibilityLabel="Clear search"
            accessibilityRole="button"
          >
            <CloseIcon color={COLORS.textSecondary} size={16} />
          </Pressable>
        )}
      </View>

      {showOverlay && (
        <Animated.View
          entering={FadeIn.duration(160)}
          exiting={FadeOut.duration(120)}
          style={styles.resultsOverlay}
        >
          {showSkeleton ? (
            <View>
              <SearchResultSkeleton />
              <SearchResultSkeleton />
              <SearchResultSkeleton />
            </View>
          ) : showEmpty ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No matching features found</Text>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={styles.resultsList}
              contentContainerStyle={styles.resultsContent}
            >
              {searchResults.map((item, index) => {
                const subTitle =
                  item.type === 'fuel_station' && item.brand
                    ? `${item.brand} • ${item.area || 'Bengaluru'}`
                    : item.area || 'Bengaluru';
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.duration(220).delay(Math.min(index, 8) * 30)}
                  >
                    <Pressable
                      onPress={() => handleSelectResult(item)}
                      style={({ pressed }) => [
                        styles.resultItem,
                        pressed && styles.resultItemPressed,
                      ]}
                      accessibilityRole="button"
                      accessibilityLabel={`${item.name}, ${item.type.replace('_', ' ')}`}
                    >
                      <View style={styles.iconContainer}>{renderIcon(item.type)}</View>
                      <View style={styles.textContainer}>
                        <Text style={styles.itemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <Text style={styles.itemSubtitle}>
                          {item.type.toUpperCase().replace('_', ' ')} • {subTitle}
                        </Text>
                      </View>
                    </Pressable>
                  </Animated.View>
                );
              })}
            </ScrollView>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    ...EFFECTS.glass,
    paddingHorizontal: 16,
  },
  containerFocused: {
    borderColor: COLORS.primary,
    borderWidth: 1.5,
  },
  searchIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 40,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.md,
  },
  actionIcon: {
    padding: 6,
    marginLeft: 4,
  },
  resultsOverlay: {
    marginTop: 8,
    ...EFFECTS.glass,
    maxHeight: 320,
    overflow: 'hidden',
  },
  resultsList: {
    width: '100%',
  },
  resultsContent: {
    paddingVertical: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  resultItemPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  itemName: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  itemSubtitle: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    marginTop: 2,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
});

export default SearchBar;
