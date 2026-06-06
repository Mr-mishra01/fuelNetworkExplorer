import { MAPBOX_PUBLIC_TOKEN } from '@env';

export const MAPBOX_ACCESS_TOKEN = MAPBOX_PUBLIC_TOKEN;

const FUEL_NETWORK_TILEJSON = {
  tilejson: '2.2.0',
  tiles: [
    `https://a.tiles.mapbox.com/v4/dheerajm01.9nwn3qiuj3pv/{z}/{x}/{y}.vector.pbf?access_token=${MAPBOX_ACCESS_TOKEN}`,
    `https://b.tiles.mapbox.com/v4/dheerajm01.9nwn3qiuj3pv/{z}/{x}/{y}.vector.pbf?access_token=${MAPBOX_ACCESS_TOKEN}`,
  ],
  minzoom: 0,
  maxzoom: 16,
  bounds: [77.349243, 12.768946, 77.849121, 13.202513],
  center: [77.66385, 12.9564, 9],
};

export const FUEL_NETWORK_TILE_URL = `data:application/json;charset=utf-8,${encodeURIComponent(
  JSON.stringify(FUEL_NETWORK_TILEJSON),
)}`;

export const FUEL_NETWORK_TILES = FUEL_NETWORK_TILEJSON.tiles;

export const FUEL_NETWORK_SOURCE_LAYER = '4828df9279729108e99c';

// ---------------------------------------------------------------------------
// Mapbox basemap styles
// ---------------------------------------------------------------------------

/** Build a fully-qualified Mapbox Style API URL. */
const mapboxStyle = (style: string): string =>
  `https://api.mapbox.com/styles/v1/mapbox/${style}?access_token=${MAPBOX_ACCESS_TOKEN}`;

// ---------------------------------------------------------------------------
// Types & style catalogue
// ---------------------------------------------------------------------------
export type MapStyleId = 'streets' | 'dark' | 'light' | 'satellite' | 'hybrid';

export interface MapStyleConfig {
  id: MapStyleId;
  /** Human-readable label shown in the style selector. */
  label: string;
  /** Fully-qualified Mapbox style URL. */
  url: string;
  /** Whether this style renders a dark basemap. */
  isDark: boolean;
  /** Short descriptor used as a subtitle in the selector. */
  description: string;
  /** Accent color for the style thumbnail swatch. */
  swatch: string;
}

export const MAP_STYLES: MapStyleConfig[] = [
  {
    id: 'streets',
    label: 'Streets',
    url: mapboxStyle('streets-v12'),
    isDark: false,
    description: 'Mapbox Streets v12',
    swatch: '#5B8DEF',
  },
  {
    id: 'dark',
    label: 'Dark',
    url: mapboxStyle('dark-v11'),
    isDark: true,
    description: 'Mapbox Dark v11',
    swatch: '#1F2937',
  },
  {
    id: 'light',
    label: 'Light',
    url: mapboxStyle('light-v11'),
    isDark: false,
    description: 'Mapbox Light v11',
    swatch: '#E5E7EB',
  },
  {
    id: 'satellite',
    label: 'Satellite',
    url: mapboxStyle('satellite-v9'),
    isDark: true,
    description: 'Mapbox Satellite v9',
    swatch: '#374151',
  },
  {
    id: 'hybrid',
    label: 'Hybrid',
    url: mapboxStyle('satellite-streets-v12'),
    isDark: true,
    description: 'Satellite + Streets',
    swatch: '#4B5563',
  },
];

export const DEFAULT_STYLE_ID: MapStyleId = 'dark';

export const getStyleById = (id: MapStyleId): MapStyleConfig =>
  MAP_STYLES.find((s) => s.id === id) ?? MAP_STYLES[0];

/** @deprecated Use MAP_STYLES entries directly. */
export const buildStyleUrl = (slug: string): string =>
  mapboxStyle(slug);
