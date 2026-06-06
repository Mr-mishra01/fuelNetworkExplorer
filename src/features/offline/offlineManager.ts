import Mapbox from '@rnmapbox/maps';
import { NativeModules } from 'react-native';
import type {
  MapStyleConfig,
} from '../styles/mapStyles';

/**
 * Offline resource orchestration for the map.
 *
 * Mapbox keeps an *ambient cache* (an on-device store of tiles,
 * styles, glyphs and sprites) that transparently serves previously-seen
 * resources when the network is slow or absent. On top of that we register an
 * *offline pack* for the working region so the first launch proactively
 * downloads everything needed to use the area fully offline.
 *
 * This module is the single seam between the app and Mapbox's offline API.
 */

// Greater Bengaluru bounding box [west, south, east, north].
export const REGION_BOUNDS: [number, number, number, number] = [
  77.45, 12.82, 77.78, 13.14,
];

// Zoom span worth pre-caching: city overview (10) down to street detail (16).
const PACK_MIN_ZOOM = 10;
const PACK_MAX_ZOOM = 16;

// 256 MB ambient cache — comfortably holds the region across several styles.
const AMBIENT_CACHE_BYTES = 256 * 1024 * 1024;

const packIdFor = (styleId: string) => `fuel-network-${styleId}`;

export type OfflineProgress = {
  styleId: string;
  percentage: number;
  completed: boolean;
};

/**
 * Configure the ambient cache size. Safe to call on every launch; it only
 * does real work when the size actually changes.
 */
export const configureAmbientCache = async (): Promise<void> => {
  try {
    const offlineModule = NativeModules.RNMBXOfflineModule;
    if (
      typeof Mapbox.offlineManager.setMaximumAmbientCacheSize === 'function' &&
      offlineModule &&
      typeof offlineModule.setMaximumAmbientCacheSize === 'function'
    ) {
      await Mapbox.offlineManager.setMaximumAmbientCacheSize(AMBIENT_CACHE_BYTES);
    } else {
      console.log('[offline] setMaximumAmbientCacheSize is not supported on this platform/version');
    }
  } catch (err) {
    console.warn('[offline] failed to size ambient cache', err);
  }
};

/**
 * Ensure an offline pack exists for the given style + region. If one is already
 * registered it is left untouched (downloads resume automatically). Progress is
 * reported through the optional callback.
 */
export const ensureRegionPack = async (
  style: MapStyleConfig,
  onProgress?: (p: OfflineProgress) => void,
): Promise<void> => {
  const id = packIdFor(style.id);
  try {
    const existing = await Mapbox.offlineManager.getPack(id);
    if (existing) {
      onProgress?.({ styleId: style.id, percentage: 100, completed: true });
      return;
    }
  } catch {
    // getPack throws/returns nothing when the pack does not exist — fall through.
  }

  try {
    // Mapbox createPack requires name, styleURL, bounds: [[neLng, neLat], [swLng, swLat]]
    await Mapbox.offlineManager.createPack(
      {
        name: id,
        styleURL: style.url,
        bounds: [
          [REGION_BOUNDS[2], REGION_BOUNDS[3]], // NorthEast [east, north]
          [REGION_BOUNDS[0], REGION_BOUNDS[1]], // SouthWest [west, south]
        ],
        minZoom: PACK_MIN_ZOOM,
        maxZoom: PACK_MAX_ZOOM,
        metadata: { styleId: style.id },
      },
      (_pack, status) => {
        onProgress?.({
          styleId: style.id,
          percentage: status.percentage ?? 0,
          completed: (status.percentage ?? 0) >= 100,
        });
      },
      (_pack, error) => {
        console.warn('[offline] pack download error', error?.message);
      },
    );
  } catch (err) {
    // A duplicate-pack error is benign; anything else we log and continue.
    console.warn('[offline] createPack failed', err);
  }
};

/**
 * Manual refresh: revalidate cached tiles against the server and pull fresh
 * data.
 */
export const refreshResources = async (
  activeStyleId: string,
): Promise<void> => {
  try {
    await Mapbox.offlineManager.invalidateAmbientCache();
  } catch (err) {
    console.warn('[offline] invalidateAmbientCache failed', err);
  }
  try {
    await Mapbox.offlineManager.invalidatePack(packIdFor(activeStyleId));
  } catch {
    // No pack for this style yet — nothing to revalidate.
  }
};

/**
 * Hard clear of cached map resources. Frees disk
 * by erasing the ambient cache; offline packs are preserved.
 */
export const clearCache = async (): Promise<void> => {
  try {
    await Mapbox.offlineManager.clearAmbientCache();
  } catch (err) {
    console.warn('[offline] clearAmbientCache failed', err);
  }
};

/**
 * Delete the offline region pack for the given style.
 */
export const deleteRegionPack = async (styleId: string): Promise<void> => {
  try {
    await Mapbox.offlineManager.deletePack(packIdFor(styleId));
  } catch (err) {
    console.warn('[offline] deletePack failed', err);
  }
};

export type PackStatusInfo = {
  styleId: string;
  percentage: number;
  completed: boolean;
  sizeBytes: number;
};

/**
 * Retrieve status, download progress, and file size of all offline packs,
 * mapping them by style ID.
 */
export const getOfflinePacksStatus = async (): Promise<Record<string, PackStatusInfo>> => {
  try {
    const packs = await Mapbox.offlineManager.getPacks();
    const result: Record<string, PackStatusInfo> = {};
    for (const p of packs) {
      if (p) {
        // Retrieve name or metadata styleId to identify the pack style
        const metadata = p.metadata;
        const styleId = metadata?.styleId;
        if (styleId) {
          try {
            const status = await p.status();
            result[styleId] = {
              styleId,
              percentage: status.percentage ?? 0,
              completed: (status.percentage ?? 0) >= 100,
              sizeBytes: status.completedResourceSize ?? 0,
            };
          } catch (err: any) {
            const errorMsg = err?.message || String(err);
            const isNotExist = errorMsg.includes('Does not exist') || errorMsg.includes('could not find');
            if (isNotExist) {
              console.log(`[offline] pack status query bypassed: pack "${p.name}" does not exist natively.`);
            } else {
              console.warn('[offline] failed to get status for pack', p.name, err);
            }
          }
        }
      }
    }
    return result;
  } catch (err) {
    console.warn('[offline] getPacks failed', err);
    return {};
  }
};

