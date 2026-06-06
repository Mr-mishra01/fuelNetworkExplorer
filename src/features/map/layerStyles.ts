import { COLORS } from '../../theme/Theme';
import { FilterState } from '../../types';

/**
 * Helper to build dynamic MapLibre filter expressions based on Zustand state.
 * Evaluated natively on-device.
 */
export const getLayerFilter = (entityType: string, filters: FilterState) => {
  const expr: any[] = ['all', ['==', ['get', 'entity_type'], entityType]];

  if (entityType === 'fuel_station') {
    if (filters.brand) {
      expr.push(['==', ['get', 'brand'], filters.brand]);
    }
    if (filters.status) {
      expr.push(['==', ['get', 'status'], filters.status]);
    }
    if (filters.minCapacity > 0) {
      expr.push(['>=', ['get', 'capacity'], filters.minCapacity]);
    }
  }

  if (entityType === 'depot') {
    if (filters.minCapacity > 0) {
      expr.push(['>=', ['get', 'capacity'], filters.minCapacity]);
    }
  }

  if (entityType === 'opportunity') {
    if (filters.minOpportunityScore > 0) {
      expr.push(['>=', ['get', 'opportunity_score'], filters.minOpportunityScore]);
    }
  }

  if (entityType === 'traffic') {
    if (filters.minTrafficScore > 0) {
      expr.push(['>=', ['get', 'traffic_score'], filters.minTrafficScore]);
    }
  }

  return expr;
};

/**
 * Styling configurations for Mapbox Layer paint and layout properties.
 */
export const MAP_PAINTS = {
  // Fuel Depots Styling
  depots: {
    circleColor: COLORS.depot,
    circleRadius: [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 3,
      10, 6,
      14, 12,
    ],
    circleStrokeColor: '#FFFFFF',
    circleStrokeWidth: 1.5,
    circleOpacity: 0.9,
  },

  // Fuel Stations Styling (Brand Color Matching)
  stations: {
    circleColor: [
      'match',
      ['get', 'brand'],
      'BPCL', '#3B82F6',       // Electric Blue
      'HPCL', '#EF4444',       // Red
      'Indian Oil', '#F59E0B', // Orange/Amber
      'Shell', '#10B981',      // Emerald Green
      'Reliance', '#EC4899',   // Pink
      'Nayara', '#8B5CF6',     // Purple
      '#94A3B8',               // Default Slate
    ],
    circleRadius: [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 1.5,
      10, 3.5,
      14, 8,
    ],
    circleStrokeColor: '#FFFFFF',
    circleStrokeWidth: 1,
    circleOpacity: 0.85,
  },

  // Opportunities Styling (Size scales with opportunity score)
  opportunities: {
    circleColor: COLORS.opportunity,
    circleRadius: [
      'interpolate',
      ['linear'],
      ['get', 'opportunity_score'],
      70, 3,
      100, 9,
    ],
    circleStrokeColor: '#FFFFFF',
    circleStrokeWidth: 1,
    circleOpacity: 0.85,
  },

  // Supply Routes Styling
  supplyRoutes: {
    lineColor: COLORS.supply_route,
    lineWidth: [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 1,
      10, 2.5,
      14, 5,
    ],
    lineOpacity: 0.75,
  },

  // Traffic Segments Styling (Dynamic Traffic Light Palette)
  traffic: {
    lineColor: [
      'case',
      ['<', ['get', 'traffic_score'], 40], COLORS.trafficLow,     // Low: Green
      ['<', ['get', 'traffic_score'], 75], COLORS.trafficMedium,  // Med: Orange/Yellow
      COLORS.trafficHigh,                                         // High: Red
    ],
    lineWidth: [
      'interpolate',
      ['linear'],
      ['zoom'],
      6, 1.5,
      10, 3,
      14, 6,
    ],
    lineOpacity: 0.85,
  },
};

