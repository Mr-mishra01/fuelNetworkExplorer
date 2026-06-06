import React, { useMemo } from 'react';
import Mapbox from '@rnmapbox/maps';
import { useFuelStore } from '../../store/useFuelStore';
import { COLORS } from '../../theme/Theme';

/**
 * Neon highlight colors per entity type.
 * Each entry carries a neon hue for the glows and core.
 */
const NEON_BY_TYPE: Record<string, { neon: string }> = {
  fuel_station: {
    neon: '#00FFB2',   // electric emerald
  },
  depot: {
    neon: '#38BFFF',   // electric blue
  },
  opportunity: {
    neon: '#FF4D8D',   // neon rose
  },
  supply_route: {
    neon: '#A78BFA',   // neon violet
  },
  traffic: {
    neon: '#FF5B5B',   // neon red
  },
};

const DEFAULT_NEON = {
  neon: COLORS.primary,
};

const EMPTY_FEATURE_COLLECTION = {
  type: 'FeatureCollection' as const,
  features: [],
};

/**
 * Renders a multi-layer dark-neon highlight on the selected feature.
 * By keeping this component and its layers statically mounted, we avoid native
 * view manager insertion bugs, allowing fluid map updates purely through prop changes.
 */
export const HighlightLayers = () => {
  const selectedFeature = useFuelStore((s) => s.selectedFeature);

  const geometryType = selectedFeature?.geometry?.type?.toLowerCase();
  const isPoint = geometryType === 'point' || geometryType === 'multipoint';
  const isLine = geometryType === 'linestring' || geometryType === 'multilinestring';

  const entityType = selectedFeature?.properties?.entity_type ?? 'fuel_station';
  const tone = NEON_BY_TYPE[entityType] ?? DEFAULT_NEON;

  const belowLayerID = useMemo(() => {
    switch (entityType) {
      case 'fuel_station':
        return 'fuel_station_markers_layer';
      case 'depot':
        return 'depot_names_layer';
      case 'opportunity':
        return 'opportunity_labels_layer';
      case 'traffic':
      case 'supply_route':
        return 'traffic_labels_layer';
      default:
        return undefined;
    }
  }, [entityType]);

  // High-performance static overlay metrics (no JS bridge overhead)
  const outerR = 38;
  const midR = 20;
  const coreR = 8.5;

  const outerLineW = 26;
  const midLineW = 12;
  const coreLineW = 4;

  const shape = selectedFeature ?? EMPTY_FEATURE_COLLECTION;

  return (
    <Mapbox.ShapeSource
      id="highlight_source"
      shape={shape}
    >
      {/* Point Highlights */}
      <Mapbox.CircleLayer
        id="hl_pt_outer"
        belowLayerID={belowLayerID}
        style={{
          circleRadius: outerR,
          circleColor: tone.neon,
          circleOpacity: 0.25,
          circleBlur: 1.0,
          visibility: isPoint ? 'visible' : 'none',
        }}
      />
      <Mapbox.CircleLayer
        id="hl_pt_mid"
        belowLayerID={belowLayerID}
        style={{
          circleRadius: midR,
          circleColor: tone.neon,
          circleOpacity: 0.6,
          circleBlur: 0.4,
          visibility: isPoint ? 'visible' : 'none',
        }}
      />
      <Mapbox.CircleLayer
        id="hl_pt_core"
        belowLayerID={belowLayerID}
        style={{
          circleRadius: coreR,
          circleColor: '#FFFFFF', // Pure white core for contrast
          circleOpacity: 1,
          circleStrokeColor: tone.neon, // Neon stroke matching feature type
          circleStrokeWidth: 3,
          circleStrokeOpacity: 1,
          visibility: isPoint ? 'visible' : 'none',
        }}
      />

      {/* Line Highlights */}
      <Mapbox.LineLayer
        id="hl_ln_outer"
        belowLayerID={belowLayerID}
        style={{
          lineColor: tone.neon,
          lineWidth: outerLineW,
          lineOpacity: 0.25,
          lineBlur: 4,
          lineCap: 'round',
          lineJoin: 'round',
          visibility: isLine ? 'visible' : 'none',
        }}
      />
      <Mapbox.LineLayer
        id="hl_ln_mid"
        belowLayerID={belowLayerID}
        style={{
          lineColor: tone.neon,
          lineWidth: midLineW,
          lineOpacity: 0.65,
          lineBlur: 1.2,
          lineCap: 'round',
          lineJoin: 'round',
          visibility: isLine ? 'visible' : 'none',
        }}
      />
      <Mapbox.LineLayer
        id="hl_ln_core"
        belowLayerID={belowLayerID}
        style={{
          lineColor: '#FFFFFF', // Pure white inner line core for glowing laser effect
          lineWidth: coreLineW,
          lineOpacity: 1,
          lineCap: 'round',
          lineJoin: 'round',
          visibility: isLine ? 'visible' : 'none',
        }}
      />
    </Mapbox.ShapeSource>
  );
};

export default HighlightLayers;
