export type EntityType = 'fuel_station' | 'depot' | 'opportunity' | 'supply_route' | 'traffic';

export interface FuelFeatureProperties {
  id?: string;
  entity_type: EntityType;
  name?: string;
  brand?: string;
  capacity?: number;
  petrol_capacity?: number;
  diesel_capacity?: number;
  current_petrol_stock?: number;
  current_diesel_stock?: number;
  daily_sales?: number;
  daily_vehicle_count?: number;
  distance_km?: number;
  avg_delivery_time?: number;
  source?: string;
  destination?: string;
  status?: string;
  traffic_score?: number;
  opportunity_score?: number;
  estimated_daily_sales?: number;
  area?: string;
  [key: string]: any; // Allows dynamic inspection of any properties
}

export interface FuelFeature {
  type: 'Feature';
  id: string | number;
  geometry: {
    type: 'Point' | 'LineString';
    coordinates: number[] | number[][];
  };
  properties: FuelFeatureProperties;
}

export interface LayerVisibilityState {
  fuel_station: boolean;
  depot: boolean;
  opportunity: boolean;
  supply_route: boolean;
  traffic: boolean;
}

export interface FilterState {
  brand: string | null; // e.g. Shell, BPCL, etc.
  status: string | null; // e.g. ACTIVE
  minTrafficScore: number;
  minOpportunityScore: number;
  minCapacity: number;
}

export interface ViewportState {
  center: [number, number]; // [longitude, latitude]
  zoom: number;
  pitch: number;
  bearing: number;
}

/** Reason a viewport change was requested — lets the map pick the right camera easing. */
export type CameraTransition = 'fly' | 'ease' | 'none';

export interface SearchItem {
  id: string;
  name: string;
  type: 'depot' | 'fuel_station' | 'opportunity';
  brand: string | null;
  area: string | null;
  coords: [number, number];
  properties: any;
}

