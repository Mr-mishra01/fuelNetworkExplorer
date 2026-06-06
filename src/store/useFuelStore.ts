import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  LayerVisibilityState,
  FilterState,
  ViewportState,
  SearchItem,
  CameraTransition,
} from '../types';
import { MapStyleId, DEFAULT_STYLE_ID } from '../features/styles/mapStyles';
import SEARCH_INDEX_RAW from '../constants/searchIndex.json';
import FEATURE_DETAILS_RAW from '../constants/featureDetails.json';

const SEARCH_INDEX = SEARCH_INDEX_RAW as Omit<SearchItem, 'properties'>[];
const FEATURE_DETAILS = FEATURE_DETAILS_RAW as Record<string, any>;

export const DEFAULT_VIEWPORT: ViewportState = {
  center: [77.5975, 12.9852],
  zoom: 11,
  pitch: 30,
  bearing: 0,
};

const DEFAULT_FILTERS: FilterState = {
  brand: null,
  status: null,
  minTrafficScore: 0,
  minOpportunityScore: 0,
  minCapacity: 0,
};

/** Which FAB-launched overlay panel is currently open (one at a time). */
export type ActivePanel = 'layers' | 'styles' | 'filters' | 'offline' | null;

interface FuelStoreState {
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  layerVisibility: LayerVisibilityState;
  toggleLayer: (layerKey: keyof LayerVisibilityState) => void;
  setLayerVisibility: (layers: Partial<LayerVisibilityState>) => void;

  filters: FilterState;
  setFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  resetFilters: () => void;

  searchQuery: string;
  searchResults: SearchItem[];
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;

  selectedFeature: any | null;
  setSelectedFeature: (feature: any | null) => void;

  // viewport is a write-only command channel; lastViewport tracks actual position and is persisted
  viewport: ViewportState;
  cameraTransition: CameraTransition;
  setViewport: (viewport: Partial<ViewportState>, transition?: CameraTransition) => void;
  resetMap: () => void;
  lastViewport: ViewportState;
  setLastViewport: (viewport: ViewportState) => void;

  mapStyleId: MapStyleId;
  setMapStyle: (id: MapStyleId) => void;

  activePanel: ActivePanel;
  setActivePanel: (panel: ActivePanel) => void;

  isOffline: boolean;
  setOffline: (offline: boolean) => void;
}

export const useFuelStore = create<FuelStoreState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),

      layerVisibility: {
        fuel_station: true,
        depot: true,
        opportunity: true,
        supply_route: true,
        traffic: true,
      },
      toggleLayer: (layerKey) =>
        set((state) => ({
          layerVisibility: {
            ...state.layerVisibility,
            [layerKey]: !state.layerVisibility[layerKey],
          },
        })),
      setLayerVisibility: (layers) =>
        set((state) => ({
          layerVisibility: {
            ...state.layerVisibility,
            ...layers,
          },
        })),

      filters: DEFAULT_FILTERS,
      setFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value,
          },
        })),
      resetFilters: () => set({ filters: DEFAULT_FILTERS }),

      searchQuery: '',
      searchResults: [],
      setSearchQuery: (query) => {
        if (!query.trim()) {
          set({ searchQuery: '', searchResults: [] });
          return;
        }

        const cleanQuery = query.toLowerCase().trim();

        const results: SearchItem[] = SEARCH_INDEX.filter((item) => {
          const nameMatch = item.name.toLowerCase().includes(cleanQuery);
          const idMatch = item.id.toLowerCase().includes(cleanQuery);
          const brandMatch = item.brand ? item.brand.toLowerCase().includes(cleanQuery) : false;
          const areaMatch = item.area ? item.area.toLowerCase().includes(cleanQuery) : false;
          return nameMatch || idMatch || brandMatch || areaMatch;
        })
          .slice(0, 30)
          .map((item) => ({ ...item, properties: FEATURE_DETAILS[item.id] ?? {} }));

        set({ searchQuery: query, searchResults: results });
      },
      clearSearch: () => set({ searchQuery: '', searchResults: [] }),

      selectedFeature: null,
      setSelectedFeature: (feature) => set({ selectedFeature: feature }),

      // Map Viewport
      viewport: DEFAULT_VIEWPORT,
      cameraTransition: 'none',
      setViewport: (viewport, transition = 'ease') =>
        set((state) => ({
          viewport: {
            ...state.viewport,
            ...viewport,
          },
          cameraTransition: transition,
        })),
      resetMap: () =>
        set({
          viewport: DEFAULT_VIEWPORT,
          cameraTransition: 'fly',
        }),
      lastViewport: DEFAULT_VIEWPORT,
      setLastViewport: (viewport) => set({ lastViewport: viewport }),

      mapStyleId: DEFAULT_STYLE_ID,
      setMapStyle: (id) => set({ mapStyleId: id }),

      activePanel: null,
      setActivePanel: (panel) =>
        set((state) => ({ activePanel: state.activePanel === panel ? null : panel })),

      isOffline: false,
      setOffline: (offline) => set({ isOffline: offline }),
    }),
    {
      name: 'fuel-network-explorer',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        lastViewport: state.lastViewport,
        layerVisibility: state.layerVisibility,
        mapStyleId: state.mapStyleId,
        filters: state.filters,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.viewport = state.lastViewport;
          state.cameraTransition = 'none';
          state.setHasHydrated(true);
        }
      },
    },
  ),
);
