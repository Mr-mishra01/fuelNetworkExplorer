import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import Mapbox from '@rnmapbox/maps';
import { useFuelStore, DEFAULT_VIEWPORT } from '../../store/useFuelStore';
import { getLayerFilter, MAP_PAINTS } from './layerStyles';
import SearchBar from '../search/SearchBar';
import FeatureDetailsSheet from '../featureDetails/FeatureDetailsSheet';
import HighlightLayers from './HighlightLayers';
import MapLoader from './MapLoader';
import FabHub from '../fab/FabHub';
import LayersPanel from '../layers/LayersPanel';
import StyleSelector from '../styles/StyleSelector';
import FiltersPanel from '../filters/FiltersPanel';
import OfflinePanel from '../offline/OfflinePanel';
import { useConnectivity } from '../offline/useConnectivity';
import OfflineBanner from '../offline/OfflineBanner';
import {
  configureAmbientCache,
  ensureRegionPack,
} from '../offline/offlineManager';
import { getStyleById, FUEL_NETWORK_TILES, FUEL_NETWORK_SOURCE_LAYER } from '../styles/mapStyles';
import { haptics } from '../../utils/haptics';
import { IconButton } from '../../components/IconButton';
import { ResetIcon } from '../../components/Icons';
import { COLORS, TYPOGRAPHY } from '../../theme/Theme';
import SEARCH_INDEX_RAW from '../../constants/searchIndex.json';

// GeoJSON built once at module load — only coords needed for clustering
const STATIONS_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: (SEARCH_INDEX_RAW as any[])
    .filter((item) => item.type === 'fuel_station')
    .map((item) => ({
      type: 'Feature' as const,
      id: item.id,
      geometry: {
        type: 'Point' as const,
        coordinates: item.coords,
      },
      properties: { id: item.id, brand: item.brand },
    })),
};

export const MapScreen = () => {
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const lastFeaturePressTimeRef = useRef<number>(0);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState(false);
  // set true after map style finishes loading, gates all setCamera calls
  const [mapReady, setMapReady] = useState(false);

  const {
    hasHydrated,
    layerVisibility,
    filters,
    viewport,
    setViewport,
    setSelectedFeature,
    resetMap,
    mapStyleId,
    cameraTransition,
  } = useFuelStore();


  const activeStyle = getStyleById(mapStyleId);

  // Monitor offline connectivity
  useConnectivity();

  // Initialize offline cache settings on startup
  useEffect(() => {
    const initOffline = async () => {
      await configureAmbientCache();
    };
    initOffline();
  }, []);

  // Sync viewport to camera — only runs after map is ready to avoid overriding defaultSettings
  useEffect(() => {
    if (!mapReady || !cameraRef.current) return;

    const animationDuration =
      cameraTransition === 'fly' ? 2000
      : cameraTransition === 'ease' ? 1200
      : 0;
    const animationMode =
      cameraTransition === 'fly' ? 'flyTo'
      : cameraTransition === 'ease' ? 'easeTo'
      : 'none';

    cameraRef.current.setCamera({
      centerCoordinate: viewport.center,
      zoomLevel: viewport.zoom,
      pitch: viewport.pitch,
      heading: viewport.bearing,
      animationDuration,
      animationMode,
    });
  }, [viewport, cameraTransition, mapReady]);

  const focusFeature = (feature: any) => {
    const geom = feature?.geometry;
    if (!geom) return;

    let center: [number, number] | null = null;
    if (geom.type === 'Point') {
      center = geom.coordinates as [number, number];
    } else if (
      geom.type === 'LineString' &&
      Array.isArray(geom.coordinates) &&
      geom.coordinates.length > 0
    ) {
      const mid = Math.floor(geom.coordinates.length / 2);
      center = geom.coordinates[mid] as [number, number];
    }

    if (center && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: center,
        zoomLevel: 15,
        pitch: 45,
        heading: 0,
        animationDuration: 1400,
        animationMode: 'flyTo',
      });
    }
  };

  const handleMapPress = async (event: any) => {
    // Prevent MapView.onPress from resetting selection if a feature was just pressed
    if (Date.now() - lastFeaturePressTimeRef.current < 200) {
      return;
    }

    // 1. Feature already attached to the event
    const clickedFeature = event.features?.[0];
    if (clickedFeature) {
      focusFeature(clickedFeature);
      setSelectedFeature(clickedFeature);
      return;
    }

    // 2. Query at exact tap coordinate
    const coordinates = event.geometry?.coordinates;
    if (coordinates && mapRef.current) {
      try {
        const point = await mapRef.current.getPointInView(coordinates);
        if (point) {
          const [x, y] = point;
          const features = await mapRef.current.queryRenderedFeaturesAtPoint(
            [x, y],
            undefined,
            [
              'fuel_station_layer',
              'depot_layer',
              'opportunity_layer',
              'supply_route_layer',
              'traffic_layer',
            ]
          );
          const feature = features?.features?.[0];
          if (feature) {
            focusFeature(feature);
            setSelectedFeature(feature);
            return;
          }

          // 3. Bounding-box fallback (~24dp) for thin lines / small points
          const tolerance = 24;
          const bbox = [
            y - tolerance, // top
            x - tolerance, // left
            y + tolerance, // bottom
            x + tolerance, // right
          ];
          const bboxFeatures = await mapRef.current.queryRenderedFeaturesInRect(
            bbox,
            undefined,
            [
              'fuel_station_layer',
              'depot_layer',
              'opportunity_layer',
              'supply_route_layer',
              'traffic_layer',
            ]
          );
          const bboxFeature = bboxFeatures?.features?.[0];
          if (bboxFeature) {
            focusFeature(bboxFeature);
            setSelectedFeature(bboxFeature);
            return;
          }
        }
      } catch (err) {
        console.log('Error querying features on map tap:', err);
      }
    }

    // Tap on empty space — dismiss detail sheet
    setSelectedFeature(null);
  };

  const handleFeaturePress = (event: any) => {
    lastFeaturePressTimeRef.current = Date.now();
    if (event && typeof event.stopPropagation === 'function') {
      event.stopPropagation();
    }
    const clickedFeature = event.features?.[0];
    if (clickedFeature) {
      focusFeature(clickedFeature);
      setSelectedFeature(clickedFeature);
    }
  };

  const handleResetCamera = () => {
    resetMap(); // sync store state
    // call setCamera directly so it always works even if viewport was already DEFAULT_VIEWPORT
    if (cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: DEFAULT_VIEWPORT.center,
        zoomLevel: DEFAULT_VIEWPORT.zoom,
        pitch: DEFAULT_VIEWPORT.pitch,
        heading: DEFAULT_VIEWPORT.bearing,
        animationDuration: 2000,
        animationMode: 'flyTo',
      });
    }
  };


  const handleRetryLoad = () => {
    setMapError(false);
    setMapLoading(true);
    setMapReady(false);
  };

  // reset on style change so camera doesn't jump during map reload
  useEffect(() => {
    setMapReady(false);
  }, [mapStyleId]);


  // Compile filters based on layer visibilities and custom parameters
  const stationFilter = getLayerFilter('fuel_station', filters);
  const depotFilter = getLayerFilter('depot', filters);
  const opportunityFilter = getLayerFilter('opportunity', filters);
  const routeFilter = getLayerFilter('supply_route', filters);
  const trafficFilter = getLayerFilter('traffic', filters);

  return (
    <View style={styles.container}>
      {/* wait for store hydration so Camera gets the right starting position */}
      {hasHydrated && (
        <Mapbox.MapView
          ref={mapRef}
          style={styles.map}
          styleURL={activeStyle.url}
          onPress={handleMapPress}
          onDidFinishLoadingStyle={() => {
            setMapReady(true);
            setMapLoading(false);
            setMapError(false);
          }}
          onMapLoadingError={() => {
            setMapLoading(false);
            setMapError(true);
          }}
          logoEnabled={false}
          attributionEnabled={false}
          scaleBarEnabled={false}
        >
          <Mapbox.Camera
            ref={cameraRef}
            defaultSettings={{
              // viewport is already seeded from lastViewport at this point
              centerCoordinate: viewport.center,
              zoomLevel: viewport.zoom,
              pitch: viewport.pitch,
              heading: viewport.bearing,
            }}
          />

        {/* Client-Side Station Clustering (Zoom 0-9) */}
        <Mapbox.ShapeSource
          id="station_clusters_source"
          shape={STATIONS_GEOJSON}
          cluster={true}
          clusterRadius={45}
          clusterMaxZoomLevel={9}
        >
          <Mapbox.CircleLayer
            id="station_cluster_circles"
            maxZoomLevel={9.9}
            filter={['has', 'point_count']}
            style={{
              circleColor: '#10B981', // Emerald green matches COLORS.fuel_station
              circleRadius: [
                'step',
                ['get', 'point_count'],
                16,   // < 20 points: radius 16
                20, 20, // >= 20 points: radius 20
                50, 24, // >= 50 points: radius 24
              ],
              circleOpacity: 0.85,
              circleStrokeColor: '#FFFFFF',
              circleStrokeWidth: 1.5,
              visibility: layerVisibility.fuel_station ? 'visible' : 'none',
            } as any}
          />

          <Mapbox.SymbolLayer
            id="station_cluster_counts"
            maxZoomLevel={9.9}
            filter={['has', 'point_count']}
            style={{
              textField: ['to-string', ['get', 'point_count']],
              textColor: '#FFFFFF',
              textSize: 10,
              textIgnorePlacement: true,
              textAllowOverlap: true,
              textAnchor: 'center',
              textJustify: 'center',
              visibility: layerVisibility.fuel_station ? 'visible' : 'none',
            } as any}
          />
        </Mapbox.ShapeSource>

        <Mapbox.VectorSource
          id="fuel_network_source"
          tileUrlTemplates={FUEL_NETWORK_TILES}
          minZoomLevel={0}
          maxZoomLevel={16}
          onPress={handleFeaturePress}
        >
          {/* 1. Supply Routes Layer (Line) - Zoom 14+ */}
          <Mapbox.LineLayer
            id="supply_route_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={routeFilter as any}
            minZoomLevel={14}
            style={{
              ...MAP_PAINTS.supplyRoutes,
              visibility: layerVisibility.supply_route ? 'visible' : 'none',
            } as any}
          />

          {/* 2. Traffic Segments Layer (Line) - Zoom 16+ */}
          <Mapbox.LineLayer
            id="traffic_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={trafficFilter as any}
            minZoomLevel={16}
            style={{
              ...MAP_PAINTS.traffic,
              visibility: layerVisibility.traffic ? 'visible' : 'none',
            } as any}
          />

          {/* 3. Opportunity Sites Layer (Circle) - Zoom 16+ */}
          <Mapbox.CircleLayer
            id="opportunity_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={opportunityFilter as any}
            minZoomLevel={16}
            style={{
              ...MAP_PAINTS.opportunities,
              visibility: layerVisibility.opportunity ? 'visible' : 'none',
            } as any}
          />

          {/* 4. Fuel Stations Layer (Circle) - Zoom 10+ */}
          <Mapbox.CircleLayer
            id="fuel_station_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={stationFilter as any}
            minZoomLevel={10}
            style={{
              ...MAP_PAINTS.stations,
              visibility: layerVisibility.fuel_station ? 'visible' : 'none',
            } as any}
          />

          {/* 5. Fuel Depots Layer (Circle) - Zoom 0+ */}
          <Mapbox.CircleLayer
            id="depot_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={depotFilter as any}
            minZoomLevel={0}
            style={{
              ...MAP_PAINTS.depots,
              visibility: layerVisibility.depot ? 'visible' : 'none',
            } as any}
          />

          {/* 6. Branded Station Markers (Symbol) - Zoom 10+ */}
          <Mapbox.SymbolLayer
            id="fuel_station_markers_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={stationFilter as any}
            minZoomLevel={10}
            style={{
              textField: [
                'match',
                ['get', 'brand'],
                'BPCL', 'BP',
                'HPCL', 'HP',
                'Indian Oil', 'IO',
                'Shell', 'SH',
                'Reliance', 'RL',
                'Nayara', 'NY',
                '⛽',
              ],
              textColor: '#FFFFFF',
              textSize: 10,
              textHaloColor: '#0B0F19',
              textHaloWidth: 1.5,
              textIgnorePlacement: false,
              textAllowOverlap: false,
              textAnchor: 'center',
              textJustify: 'center',
              visibility: layerVisibility.fuel_station ? 'visible' : 'none',
            } as any}
          />

          {/* 7. Station Names Layer (Symbol) - Zoom 12+ */}
          <Mapbox.SymbolLayer
            id="station_names_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={stationFilter as any}
            minZoomLevel={12}
            style={{
              textField: ['get', 'name'],
              textColor: '#94A3B8',
              textSize: 9.5,
              textHaloColor: '#0B0F19',
              textHaloWidth: 1.5,
              textOffset: [0, 1.25],
              textAnchor: 'top',
              visibility: layerVisibility.fuel_station ? 'visible' : 'none',
            } as any}
          />

          {/* 8. Depot Names Layer (Symbol) - Zoom 12+ */}
          <Mapbox.SymbolLayer
            id="depot_names_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={depotFilter as any}
            minZoomLevel={12}
            style={{
              textField: ['get', 'name'],
              textColor: '#94A3B8',
              textSize: 9.5,
              textHaloColor: '#0B0F19',
              textHaloWidth: 1.5,
              textOffset: [0, 1.2],
              textAnchor: 'top',
              visibility: layerVisibility.depot ? 'visible' : 'none',
            } as any}
          />

          {/* 9. Opportunity Labels Layer (Symbol) - Zoom 16+ */}
          <Mapbox.SymbolLayer
            id="opportunity_labels_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={opportunityFilter as any}
            minZoomLevel={16}
            style={{
              textField: ['concat', 'Score: ', ['get', 'opportunity_score']],
              textColor: '#FF4D8D',
              textSize: 9,
              textHaloColor: '#0B0F19',
              textHaloWidth: 1.2,
              textOffset: [0, 1.1],
              textAnchor: 'top',
              visibility: layerVisibility.opportunity ? 'visible' : 'none',
            } as any}
          />

          {/* 10. Traffic Labels Layer (Symbol) - Zoom 16+ */}
          <Mapbox.SymbolLayer
            id="traffic_labels_layer"
            sourceLayerID={FUEL_NETWORK_SOURCE_LAYER}
            filter={trafficFilter as any}
            minZoomLevel={16}
            style={{
              textField: ['get', 'road_name'],
              textColor: '#E2E8F0',
              textSize: 9,
              textHaloColor: '#0B0F19',
              textHaloWidth: 1.2,
              symbolPlacement: 'line',
              visibility: layerVisibility.traffic ? 'visible' : 'none',
            } as any}
          />
        </Mapbox.VectorSource>

        <HighlightLayers />
      </Mapbox.MapView>
      )}

      {/* Floating Header UI */}
      <SearchBar />

      {/* Offline Banner indicator */}
      <OfflineBanner />

      {/* Centralized FAB Action Hub & Panels */}
      <FabHub
        onResetView={handleResetCamera}
      />
      <LayersPanel />
      <StyleSelector />
      <FiltersPanel />
      <OfflinePanel />

      {/* Feature Details Panel */}
      <FeatureDetailsSheet />

      {/* Premium Sci-Fi Loader */}
      <MapLoader visible={mapLoading} />

      {/* Error state */}
      {mapError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Failed to Load Map</Text>
          <Text style={styles.errorText}>
            Unable to connect to the tile server. Please check your network connection and verify your MapTiler API Key.
          </Text>
          <IconButton
            icon={<ResetIcon size={18} color={COLORS.primary} />}
            onPress={handleRetryLoad}
            size={44}
            style={styles.retryButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  loaderContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  loaderText: {
    marginTop: 14,
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  errorContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 20,
  },
  errorTitle: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    borderColor: COLORS.primary,
  },
});

export default MapScreen;
