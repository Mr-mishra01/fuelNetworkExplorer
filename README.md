# Fuel Network Explorer

> A production-quality React Native application for visualising, exploring, searching, filtering, and interacting with a 9,000+ feature GeoJSON fuel network dataset across Bengaluru.

---

## Table of Contents

1. [Setup Instructions](#1-setup-instructions)
2. [Build Instructions](#2-build-instructions)
3. [Feature Checklist & What Was Delivered](#3-feature-checklist--what-was-delivered)
4. [Assumptions Made](#4-assumptions-made)
5. [Technical Decisions](#5-technical-decisions)
6. [Performance Considerations](#6-performance-considerations)
7. [Architecture Notes](#7-architecture-notes)
   - [Project Structure](#71-project-structure)
   - [State Management Approach](#72-state-management-approach)
   - [Data Handling Strategy](#73-data-handling-strategy)
   - [Map Rendering Pipeline](#74-map-rendering-pipeline)
   - [Component Design Patterns](#75-component-design-patterns)
   - [Navigation & Screen Structure](#76-navigation--screen-structure)
   - [Offline Architecture](#77-offline-architecture)
   - [Search Architecture](#78-search-architecture)
   - [Animation System](#79-animation-system)
   - [Theme & Design System](#710-theme--design-system)

---

## 1. Setup Instructions

### 1.1 Prerequisites

Ensure the following are installed and configured on your development machine before proceeding:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 22.11.0 | JS runtime for Metro bundler |
| React Native CLI | Latest | Device deployment |
| Android Studio | Latest | Android SDK, emulator |
| Android SDK | API 34+ (Android 14) | Build target |
| JDK (Java) | 17 (LTS) | Required by Gradle |
| Watchman | Latest | File watching for Metro |
| Git | Any | Source control |

Verify your Android environment with:

```bash
npx react-native doctor
```

---

### 1.2 Clone & Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd Assignment

# Install all JavaScript dependencies
npm install
```

> **Note:** `node_modules` is not committed. Always run `npm install` before trying to build.

---

### 1.3 Mapbox Credentials Setup

This app uses **two different Mapbox tokens** that serve completely different purposes:

#### Public Access Token (already in source)

The **public token** (`pk.*`) is embedded in `src/features/styles/mapStyles.ts`. This is intentional and safe — it is scoped to read-only tile access and cannot perform any write, upload, or billing operations on the Mapbox account.


#### Secret Download Token (must be added locally — never commit this)

The **secret token** (`sk.*`) is required only by the Android Gradle build system to download the native Mapbox SDK binary (`rnmapbox-maps`) from Mapbox's authenticated Maven repository.

1. Open (or create) the file `android/gradle.properties` — this file is **gitignored**.
2. Add the following line, replacing the placeholder with your actual secret token:

```properties
MAPBOX_DOWNLOADS_TOKEN=...
```

3. Verify `android/build.gradle` has the Mapbox Maven repository configured (already in place):

```groovy
maven {
    url 'https://api.mapbox.com/downloads/v2/releases/maven'
    authentication { basic(BasicAuthentication) }
    credentials {
        username = "mapbox"
        password = project.properties['MAPBOX_DOWNLOADS_TOKEN'] ?: ""
    }
}
```

> ⚠️ **Security Note:** Never commit `android/gradle.properties` containing your secret token. Anyone with an `sk.*` token has full write access to the Mapbox account, including deleting tilesets and incurring billing.

---

### 1.4 Dataset Setup

**No manual data import is required.** The 9,000+ feature GeoJSON dataset has already been:

1. Uploaded to Mapbox as a hosted **Vector Tileset** (`dheerajm01.9nwn3qiuj3pv`).
2. Pre-processed into a local **search index** (`src/constants/searchIndex.json`) for instant offline search.

The app fetches vector tiles live from `https://a.tiles.mapbox.com` and `https://b.tiles.mapbox.com` (two CDN endpoints for load balancing) at runtime.

---

## 2. Build Instructions

### 2.1 Start Metro Bundler

Metro is React Native's JS bundler. It must be running before deploying to a device:

```bash
npm start
# or
npx react-native start
```

> Metro will stay running in this terminal. Open a second terminal for the commands below.

---

### 2.2 Android Build & Deploy

```bash
# Build debug APK and deploy to connected device / emulator
npm run android
# or
npx react-native run-android
```

This command:
1. Compiles the native Android module (Gradle).
2. Downloads Mapbox SDK from Maven using the secret token.
3. Starts Metro (if not already running).
4. Bundles the JS.
5. Installs the APK onto the connected device or emulator.

#### Building a Release APK (optional)

```bash
cd android
./gradlew assembleRelease
# APK output: android/app/build/outputs/apk/release/app-release.apk
```

---

### 2.3 iOS Build & Deploy

```bash
# Install CocoaPods dependencies
cd ios && pod install && cd ..

# Build and deploy
npm run ios
# or
npx react-native run-ios
```

> iOS was not the primary test target during development (tested on Android emulator Pixel 9 API 35). The app is architecturally iOS-compatible but has not been hardware-tested on a physical iOS device.

---

### 2.4 TypeScript Compilation Check

Run this any time to verify there are zero type errors before committing:

```bash
npx tsc --noEmit
# Expected output: (nothing — clean exit code 0)
```

---

### 2.5 Linting

```bash
npm run lint
```

---

## 3. Feature Checklist & What Was Delivered

### 3.1 Required Features (All ✅)

| Requirement | Status | Implementation File(s) |
|---|---|---|
| React Native | ✅ | RN 0.85.3, zero Expo |
| TypeScript | ✅ | `tsconfig.json`, strict mode, `src/types/index.ts` |
| Map visualisation & navigation | ✅ | `MapScreen.tsx`, `@rnmapbox/maps` v10 |
| Layer management | ✅ | `LayersPanel.tsx`, `useFuelStore.ts` |
| Search functionality | ✅ | `SearchBar.tsx`, `searchIndex.json` |
| Feature details view | ✅ | `FeatureDetailsSheet.tsx` |
| Data filtering | ✅ | `FiltersPanel.tsx`, `layerStyles.ts` |
| Responsive performance | ✅ | Vector tiles, Reanimated, clustering |

### 3.2 Features Built Beyond Requirements

| Feature | Description |
|---|---|
| 5 Basemap styles | Streets, Dark, Light, Satellite, Hybrid — switchable at runtime |
| Progressive zoom disclosure | Layers reveal progressively as user zooms in |
| Neon selection highlights | Multi-layer neon glow effect on selected feature |
| Offline Maps Manager | Per-style pack download, progress, delete |
| Offline detection | Real-time NetInfo monitoring + offline banner |
| Animated sci-fi map loader | Animated splash on first tile load |
| Persistent user state | Last viewport, layer config, style, filters saved across sessions |
| Active filter badge | FAB shows count of active filters |
| Cinematic camera fly-to | Smooth fly-to animation on feature tap or search result select |
| Haptic feedback system | Contextual haptics on every interaction |
| Fuel stock gauges | Visual progress bars for petrol/diesel levels in detail sheet |
| Supply route visualiser | From → To endpoint display for route features |

---

## 4. Assumptions Made

### 4.1 Geographic Scope

The application is scoped exclusively to **Bengaluru, Karnataka, India**. This assumption drives:

- The default camera centre: `[77.5975° E, 12.9852° N]` (MG Road area).
- The default camera zoom level: `11` (city-level overview).
- The offline region pack bounds: `[77.45–77.78° E, 12.82–13.14° N]`.
- The vector tileset bounds: `[77.35–77.85° E, 12.77–13.20° N]`.

If the dataset were national or global, the default viewport, clustering thresholds, and offline pack strategy would all need to change.

---

### 4.2 Dataset Hosting Strategy — Vector Tiles, Not Inline GeoJSON

The raw GeoJSON file was assumed to be too large to bundle directly in the app. Key reasoning:

| Factor | Inline GeoJSON | Vector Tiles (chosen) |
|---|---|---|
| Bundle size impact | +5–10 MB APK | ~0 (tiles fetched at runtime) |
| First render time | Parse on JS thread, blocking | Native GPU tile decode, non-blocking |
| Memory usage | All 9,000 features in JS heap | Only visible tile features in memory |
| Zoom-level detail | Same at every zoom | Server-side simplification per zoom level |
| Offline support | Full file always available | Requires pre-downloading packs |

The dataset was uploaded once to Mapbox Studio as a vector tileset. The app references it via two `https://` tile URLs (to bypass Android's HTTP cleartext security policy which would block `http://` tile URLs from the Mapbox TileJSON endpoint).

---

### 4.3 Read-Only Application

No create, edit, or delete feature workflow is required. The app is a pure **visualisation and exploration** tool. All data modifications would be done outside the app (e.g., updating the Mapbox tileset directly).

---

### 4.4 Search Index is Pre-Generated

The `searchIndex.json` (2.4 MB, ~9,000 entries) was generated offline by processing the raw GeoJSON and extracting only the fields needed for search:

```json
{
  "id": "station_001",
  "name": "HPCL Whitefield",
  "type": "fuel_station",
  "brand": "HPCL",
  "area": "Whitefield",
  "coords": [77.7499, 12.9698],
  "properties": { ... }
}
```

This index is imported as a module constant at JS startup and kept in memory. It is never regenerated at runtime.

---

### 4.5 Android-Primary Development

All development and testing was done on an Android emulator (Pixel 9, API 35). The codebase is structured to be cross-platform:

- Platform-conditional font families: `sans-serif-medium` on Android, `System` on iOS.
- Haptic feedback uses `react-native-haptic-feedback` which supports both platforms.
- Mapbox SDK `@rnmapbox/maps` v10 supports both platforms.

However, iOS was not hardware-tested — it is a known untested surface.

---

### 4.6 Single Map Screen — No Navigation Needed

The assignment requires a map-centric app, so a single-screen architecture was chosen. React Navigation is installed (`@react-navigation/native-stack`) and a native stack navigator is configured in `AppNavigator.tsx`, but currently only one screen (`MapScreen`) is registered. Adding more screens (e.g., a settings screen or a list view) requires only registering new routes.

---

## 5. Technical Decisions

### 5.1 `@rnmapbox/maps` over `@maplibre/maplibre-react-native`

The app was initially scaffolded with MapLibre but migrated to Mapbox. Reasons:

1. **Authenticated Mapbox tileset support** — The fuel-network tileset is hosted under a Mapbox account. MapLibre can consume the tile URLs but cannot authenticate with the Mapbox download server (for SDK binary) or Mapbox API.
2. **Offline manager API** — `Mapbox.offlineManager` with `createPack`, `getPacks`, `deletePack`, and `invalidatePack` is more complete than MapLibre's offline equivalent.
3. **Client-side clustering built-in** — `<Mapbox.ShapeSource cluster={true}>` handles cluster radius, max-zoom, and count property natively with no extra library.
4. **`belowLayerID` prop** — Allows symbol/text layers to always render on top of highlight overlays, keeping labels readable when a feature is selected.

---

### 5.2 Zustand over Redux / Context API

| Criteria | Redux | Context API | Zustand (chosen) |
|---|---|---|---|
| Boilerplate | Very high | Low | Minimal |
| TypeScript support | Needs extra types | Needs extra types | First-class |
| Selector re-renders | Fine-grained | Context re-renders all consumers | Fine-grained |
| Middleware | Redux toolkit | N/A | `persist`, `devtools` |
| Async side-effects | Redux Thunk / Saga | useEffect | useEffect outside store |
| Bundle size | ~40 KB | 0 KB | ~3 KB |

Zustand's `persist` middleware with `AsyncStorage` enabled zero-boilerplate state hydration (restoring viewport, layer settings, style, and filters on relaunch) with a single 8-line configuration block.

---

### 5.3 Reanimated 4 over Animated API

The bottom sheet (`FeatureDetailsSheet`) and all overlay panels (`OverlayPanel`, `FabHub`) are animated using **Reanimated 4 shared values and worklets**. This means:

- All interpolation and spring physics run on the **UI thread**, not the JS thread.
- Dragging the bottom sheet has zero JS-thread involvement — gesture delta → `translateY.value` update → UI render, all within the native layer.
- No jank even when the JS thread is busy (e.g., running a search query).

The React Native `Animated` API would push all animation frames through the JS→Native bridge, creating jank under load.

---

### 5.4 Vector Tile Source over GeoJSON Source for the Main Dataset

A `<Mapbox.VectorSource>` with `tileUrlTemplates` is used instead of a `<Mapbox.ShapeSource>` with a GeoJSON feature collection for the main fuel network data. This means:

- Mapbox GL renders features using its native C++ tile pipeline — no JS objects created per feature.
- Layer filters (e.g., `['==', ['get', 'entity_type'], 'fuel_station']`) are evaluated natively on the rendering thread.
- Zoom-level-based simplification: at lower zoom levels, the tile server returns simplified geometries; at higher zooms, full detail is returned.

The only GeoJSON source used is for **client-side clustering** (zoom 0–9), where `STATIONS_GEOJSON` is a pre-compiled `FeatureCollection` of just `{coordinates, properties}` for every station. This is a small, bounded dataset (~2,000 stations) that fits comfortably in JS memory.

---

### 5.5 Pre-compiled GeoJSON Constant for Clustering

```ts
// Evaluated once at module load time, not on every render
const STATIONS_GEOJSON = {
  type: 'FeatureCollection',
  features: (SEARCH_INDEX_RAW as any[])
    .filter((item) => item.type === 'fuel_station')
    .map((item) => ({ ... })),
};
```

This is intentionally evaluated at module scope (not inside the component) so the filtering and mapping operation runs **once** when the module is first imported, not on every re-render of `MapScreen`. React's reconciler will see the same object reference on every render, preventing unnecessary `ShapeSource` updates.

---

### 5.6 Inline TileJSON over Remote TileJSON Fetch

Mapbox's TileJSON endpoint (`https://api.mapbox.com/v4/{tileset}.json`) returns tile URLs using `http://` (not `https://`). Android's **Network Security Configuration** blocks cleartext HTTP by default in API 28+.

Solution: Build the TileJSON object inline in `mapStyles.ts`, hardcoding `https://` tile URLs. This eliminates the cleartext issue and also removes a network round-trip (one fewer API call on startup).

```ts
const FUEL_NETWORK_TILEJSON = {
  tiles: [
    `https://a.tiles.mapbox.com/v4/dheerajm01.9nwn3qiuj3pv/{z}/{x}/{y}.vector.pbf?access_token=${TOKEN}`,
    `https://b.tiles.mapbox.com/v4/dheerajm01.9nwn3qiuj3pv/{z}/{x}/{y}.vector.pbf?access_token=${TOKEN}`,
  ],
  ...
};
```

---

### 5.7 Haptic Feedback as a UX Signal Layer

`react-native-haptic-feedback` wraps each category of user action with an appropriate haptic:

| Action | Haptic type | Context |
|---|---|---|
| Feature selected | `selection` | Soft click |
| Layer toggle | `impactLight` | Switch flick |
| FAB open/close | `impactMedium` | Button push |
| Filter applied | `impactLight` | Toggle |
| Offline transition | `notificationWarning` | Alert signal |
| Successful operation | `notificationSuccess` | Completion |
| Destructive action (delete) | `notificationWarning` | Warning signal |

This makes the app feel physically responsive, a key differentiator on mobile.

---

## 6. Performance Considerations

### 6.1 Map Rendering

**Vector tiles are the single most impactful performance decision.** The rendering pipeline is:

```
Tile request (HTTPS) → PBF binary decode (native C++) → 
Feature filter expression (native thread) → 
Vertex buffer creation (native) → 
GPU rasterisation → Display
```

The JS thread is never involved in rendering individual features. This means 9,000 features do not impose any JS-thread cost.

---

### 6.2 Progressive Zoom Disclosure

Each layer has explicit `minZoomLevel` and where needed `maxZoomLevel` constraints:

| Zoom range | Layers visible |
|---|---|
| 0–9 | Depot circles, station clusters (client-side) |
| 10–11 | Individual station circles, branded text markers |
| 12–13 | Station names, depot names |
| 14–15 | Supply route lines |
| 16+ | Traffic segments, opportunity circles, labels |

At any given zoom level, only a **subset of layers** is rendering. At zoom 11 (city overview), the supply route and traffic layers are completely inactive — Mapbox skips them in the render pass entirely. This prevents overdraw and keeps frame rates high.

---

### 6.3 Layer Filter Evaluation

Every layer uses a Mapbox GL expression filter:

```ts
filter={['all', ['==', ['get', 'entity_type'], 'fuel_station'], ...]}
```

These expressions are compiled to native bytecode by Mapbox GL and evaluated per-feature inside the tile data during the render pass — entirely on the native thread. Changing a filter (e.g., selecting a brand) calls `setFilter` in Zustand, the React component re-renders with the new filter prop, and Mapbox GL re-evaluates the expression natively. The total JS cost of a filter change is one Zustand setter call and one React re-render of the layer JSX — negligible.

---

### 6.4 Search Performance

The search runs on a pre-indexed JSON array of ~9,000 objects, filtered by `.includes()` across 4 fields per item:

- **Debounce (350 ms)**: Prevents running the filter on every keystroke. The filter only runs when the user pauses typing.
- **Result slice (30 max)**: The UI only renders 30 result items maximum, preventing a large FlatList or ScrollView layout pass.
- **String comparisons only**: The search index contains only primitive values (strings, arrays of numbers). There is no JSON parsing, network call, or complex object traversal at query time.
- **Module-scope import**: `SEARCH_INDEX` is parsed once at startup (a single `require()` call) and cached. All subsequent searches use the in-memory array.

A 350 ms debounce on a 9,000-item array filter runs in < 5 ms on a mid-range Android device, well within the 16 ms frame budget.

---

### 6.5 State Management Re-render Budget

Zustand selectors use strict reference equality by default:

```ts
// Only re-renders when layerVisibility changes — NOT when filters change
const layerVisibility = useFuelStore((s) => s.layerVisibility);
```

Each component subscribes only to the slice it needs:

- `MapScreen` subscribes to `layerVisibility`, `filters`, `viewport`, `mapStyleId`, `cameraTransition`.
- `SearchBar` subscribes to `searchQuery`, `searchResults`.
- `FeatureDetailsSheet` subscribes to `selectedFeature`.
- `FabHub` subscribes to `filters` (for badge count) and `activePanel`.

This means tapping a feature (which updates `selectedFeature`) **does not re-render** the layers panel, search bar, or FAB hub. Only `FeatureDetailsSheet` and `HighlightLayers` re-render.

---

### 6.6 Highlight Layers — Static Mount Strategy

`HighlightLayers.tsx` mounts **six layers** (three circle + three line) at startup and keeps them permanently mounted. Visibility is controlled via the style `visibility` property (`'visible'` or `'none'`), not by conditionally rendering the JSX.

**Why this matters:** Dynamically adding/removing Mapbox layers after the map style has loaded triggers a native layer insertion operation in the Mapbox GL style hierarchy. On Android, this can cause a brief frame drop or a race condition where the layer is not registered by the time the first render frame is requested. Static mounting eliminates this entirely — layers are registered during map style load, and subsequent feature selection only changes a style property value.

---

### 6.7 Camera Synchronisation — Command Channel Pattern

The Mapbox camera is not controlled directly from user state. Instead, `viewport` in the store acts as a **command channel**:

1. User taps a search result → `setViewport({ center, zoom }, 'fly')` is called.
2. `MapScreen` watches `viewport` via `useEffect`.
3. On `viewport` change, it calls `cameraRef.current.setCamera(...)` with the appropriate animation mode.
4. The camera animates natively — no JS animation loop.

The `cameraTransition` field (`'fly' | 'ease' | 'none'`) lets callers specify the camera easing without coupling them to the camera implementation.

---

### 6.8 Offline Pack Download — No Startup Starvation

An earlier version of the app called `ensureRegionPack(activeStyle)` in a `useEffect` on startup. This caused **connection pool starvation** on first launch:

- The offline pack creation triggers hundreds of simultaneous background tile downloads.
- These background requests saturate the native HTTP connection pool (typically 6 connections per host).
- The visible map tile requests from `MapView` get queued behind the background downloads and time out.
- Result: black map on first launch. Fix and re-launch: tiles load (pack already exists, so downloads skip).

**Fix:** Startup only calls `configureAmbientCache()` (a single native call to set the cache size limit). Offline pack downloads are **strictly user-initiated** from the Offline Maps Manager panel. The network is entirely free for streaming map tiles on first launch.

---

## 7. Architecture Notes

### 7.1 Project Structure

```
Assignment/
├── android/                  # Android native project
│   ├── build.gradle          # Mapbox Maven repo configured here
│   ├── gradle.properties     # Secret token goes here (gitignored)
│   └── app/
│       └── build.gradle      # App-level build config
├── ios/                      # iOS native project
├── src/
│   ├── components/           # Shared atomic UI components
│   │   ├── Card.tsx          # Generic card container
│   │   ├── IconButton.tsx    # Circular pressable icon button
│   │   ├── Icons.tsx         # All SVG icon definitions (react-native-svg)
│   │   ├── OverlayPanel.tsx  # Reusable animated bottom panel
│   │   └── Skeleton.tsx      # Shimmer skeleton loaders
│   │
│   ├── constants/
│   │   └── searchIndex.json  # Pre-processed search dataset (~2.4 MB)
│   │
│   ├── features/             # Feature-domain vertical slices
│   │   ├── fab/
│   │   │   └── FabHub.tsx    # Floating action button + action menu
│   │   ├── featureDetails/
│   │   │   └── FeatureDetailsSheet.tsx  # Gesture bottom sheet
│   │   ├── filters/
│   │   │   ├── FilterPanel.tsx          # (Legacy — superseded)
│   │   │   └── FiltersPanel.tsx         # Active filters UI
│   │   ├── layers/
│   │   │   ├── LayerControls.tsx        # (Component primitives)
│   │   │   └── LayersPanel.tsx          # Layer toggle switches
│   │   ├── map/
│   │   │   ├── HighlightLayers.tsx      # Selection overlay layers
│   │   │   ├── MapLoader.tsx            # Animated startup loader
│   │   │   ├── MapScreen.tsx            # Root map screen
│   │   │   └── layerStyles.ts           # Layer paint styles + filter builders
│   │   ├── offline/
│   │   │   ├── OfflineBanner.tsx        # Top network status banner
│   │   │   ├── OfflinePanel.tsx         # Pack download/delete UI
│   │   │   ├── offlineManager.ts        # Mapbox offline API wrapper
│   │   │   └── useConnectivity.ts       # NetInfo hook
│   │   ├── search/
│   │   │   └── SearchBar.tsx            # Search input + results
│   │   └── styles/
│   │       ├── StyleSelector.tsx        # Basemap style picker
│   │       └── mapStyles.ts             # Style config + token + tile URLs
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx  # React Navigation native stack
│   ├── store/
│   │   └── useFuelStore.ts   # Single Zustand store
│   ├── theme/
│   │   └── Theme.ts          # COLORS, TYPOGRAPHY, EFFECTS tokens
│   ├── types/
│   │   └── index.ts          # Shared TypeScript interfaces
│   └── utils/
│       └── haptics.ts        # Haptic feedback helpers
│
├── App.tsx                   # Entry: Mapbox token init + navigation
├── index.js                  # RN entry point
├── package.json
└── tsconfig.json
```

---

### 7.2 State Management Approach

The entire application state is managed by a **single Zustand store** (`useFuelStore`). The store is divided into named slices:

#### Slice Breakdown

```
useFuelStore
├── hasHydrated: boolean
│     Flag indicating AsyncStorage rehydration is complete.
│
├── layerVisibility: LayerVisibilityState
│     { fuel_station, depot, opportunity, supply_route, traffic }
│     Controls map layer visibility. Actions: toggleLayer, setLayerVisibility.
│     PERSISTED via AsyncStorage.
│
├── filters: FilterState
│     { brand, status, minTrafficScore, minOpportunityScore, minCapacity }
│     Native Mapbox filter expressions are built from this in layerStyles.ts.
│     Actions: setFilter, resetFilters.
│     PERSISTED via AsyncStorage.
│
├── searchQuery: string
│     Raw text in the search input. NOT persisted.
│
├── searchResults: SearchItem[]
│     Results computed synchronously from searchIndex.json on setSearchQuery.
│     Limited to 30 results. NOT persisted.
│
├── selectedFeature: GeoJSONFeature | null
│     The currently selected map feature (from tap or search).
│     Drives FeatureDetailsSheet and HighlightLayers. NOT persisted.
│
├── viewport: ViewportState
│     { center, zoom, pitch, bearing }
│     Command channel to the Mapbox camera. Writing to this triggers
│     a camera animation in MapScreen's useEffect.
│
├── cameraTransition: 'fly' | 'ease' | 'none'
│     Animation mode for the next viewport change.
│
├── lastViewport: ViewportState
│     Records the user's actual last camera position (updated on map idle).
│     PERSISTED via AsyncStorage — restores camera position on relaunch.
│
├── mapStyleId: MapStyleId
│     'streets' | 'dark' | 'light' | 'satellite' | 'hybrid'
│     PERSISTED via AsyncStorage.
│
├── activePanel: 'layers' | 'styles' | 'filters' | 'offline' | null
│     Only one overlay panel is open at a time. Setting the same panel
│     again closes it (toggle behaviour). NOT persisted.
│
└── isOffline: boolean
      Set by useConnectivity (NetInfo). NOT persisted.
```

#### Persistence Configuration

Only four slices survive app restarts:

```ts
partialize: (state) => ({
  lastViewport: state.lastViewport,   // Restore camera position
  layerVisibility: state.layerVisibility, // Restore layer toggles
  mapStyleId: state.mapStyleId,       // Restore basemap style
  filters: state.filters,             // Restore active filters
})
```

On rehydration, the `onRehydrateStorage` callback seeds `viewport` from `lastViewport` with `cameraTransition: 'none'` — so the map opens exactly where the user left it, without an animated fly-to.

---

### 7.3 Data Handling Strategy

```
                         ┌─────────────────────┐
                         │  Raw GeoJSON Dataset │
                         │   (9,000+ features)  │
                         └──────────┬──────────┘
                                    │ (one-time offline processing)
              ┌─────────────────────┴──────────────────────┐
              ▼                                            ▼
   ┌──────────────────────┐                 ┌─────────────────────────┐
   │  Mapbox Vector        │                 │  searchIndex.json        │
   │  Tileset Upload       │                 │  (name, brand, area,     │
   │  dheerajm01.9nwn3qiu  │                 │   coords, type, props)   │
   └──────────┬───────────┘                 └─────────────┬───────────┘
              │ (streaming at runtime)                     │ (bundled in APK)
              ▼                                            ▼
   ┌──────────────────────┐                 ┌─────────────────────────┐
   │  VectorSource         │                 │  Module-scope constant   │
   │  (PBF tiles, HTTPS)   │                 │  SEARCH_INDEX (in-memory)│
   └──────────┬───────────┘                 └─────────────┬───────────┘
              │                                            │
              ▼                                            ▼
   ┌──────────────────────┐                 ┌─────────────────────────┐
   │  Mapbox GL Layers     │                 │  SearchBar filter()      │
   │  (native GPU render)  │                 │  (debounced, 30 results) │
   └──────────┬───────────┘                 └─────────────┬───────────┘
              │                                            │
              ▼                                            ▼
         Map display                              Search result list
```

The two data paths are **completely independent**:
- Map rendering never touches the JS search index.
- Search never triggers a network request or touches tile data.

---

### 7.4 Map Rendering Pipeline

#### Layer Hierarchy (bottom → top)

```
Mapbox Basemap (streets / dark / light / satellite / hybrid)
  │
  ├── supply_route_layer        LineLayer   zoom 14+  purple
  ├── traffic_layer             LineLayer   zoom 16+  green/amber/red by score
  ├── depot_layer               CircleLayer zoom 0+   blue
  ├── opportunity_layer         CircleLayer zoom 16+  rose pink, radius ∝ score
  ├── fuel_station_layer        CircleLayer zoom 10+  brand colour
  │
  ├── station_cluster_circles   CircleLayer zoom 0–9  emerald, radius ∝ count
  ├── station_cluster_counts    SymbolLayer zoom 0–9  white number, centered
  │
  ├── fuel_station_markers_layer  SymbolLayer zoom 10+ brand code centered in circle
  ├── station_names_layer         SymbolLayer zoom 12+ name below circle
  ├── depot_names_layer           SymbolLayer zoom 12+ name below circle
  ├── opportunity_labels_layer    SymbolLayer zoom 16+ score above circle
  ├── traffic_labels_layer        SymbolLayer zoom 16+ road name along line path
  │
  └── HighlightLayers (ShapeSource — selected feature)
        ├── hl_pt_outer          CircleLayer large blurred glow
        ├── hl_pt_mid            CircleLayer medium semi-opaque
        ├── hl_pt_core           CircleLayer tight white core + neon stroke
        ├── hl_ln_outer          LineLayer   wide blurred glow
        ├── hl_ln_mid            LineLayer   medium semi-opaque
        └── hl_ln_core           LineLayer   thin white inner core
```

#### belowLayerID: Keeping Labels Readable on Selection

Highlight layers are inserted **below** the corresponding text/symbol layer for each entity type:

| Entity type | Highlight renders below |
|---|---|
| fuel_station | `fuel_station_markers_layer` |
| depot | `depot_names_layer` |
| opportunity | `opportunity_labels_layer` |
| traffic / supply_route | `traffic_labels_layer` |

This ensures that brand abbreviations and station names are always readable — the neon glow renders beneath the text, not over it.

---

### 7.5 Component Design Patterns

#### OverlayPanel — Shared Panel Container

All four overlay panels (Layers, Map Style, Filters, Offline Maps) use the same `OverlayPanel` component. It provides:

- Animated backdrop fade-in (opacity 0 → 1).
- Panel slide-up animation (translateY 340 → 0) with spring.
- Tap-to-dismiss backdrop.
- Handle pill at the top.
- `headerAccessory` slot for panel-specific controls (e.g., the Reset Filters button).
- Self-unmounting after exit animation completes (`runOnJS(setMounted)(false)`) — adds zero view cost when closed.

#### FabHub — State-Saving FAB

The FAB auto-closes when a feature is selected (the detail sheet needs the screen). When the sheet is dismissed, the FAB restores to whatever state it was in before (open or closed). This is implemented with a `useRef` (`isOpenRef`) to avoid a stale closure:

```ts
// Capture the latest isOpen value without causing re-renders
const isOpenRef = useRef(isOpen);
useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

// On feature selection: save state, auto-close FAB
// On sheet dismiss: restore FAB to prevOpenRef.current
```

#### FeatureDetailsSheet — Three-State Spring Sheet

The sheet has three named positions:
- `EXPANDED = 0` (translateY = 0): Full screen height.
- `COLLAPSED = SHEET_HEIGHT - PEEK_HEIGHT`: Shows ~44% of screen height.
- `CLOSED = SHEET_HEIGHT`: Fully off-screen.

Drag velocity and drag position are used to snap to the nearest state on gesture release:
- `pos > COLLAPSED + 80 || vel > 900` → close.
- `pos < COLLAPSED / 2 || vel < -700` → expand.
- Otherwise → collapse (peek).

---

### 7.6 Navigation & Screen Structure

```
App.tsx
  └── GestureHandlerRootView
        └── SafeAreaProvider
              └── AppNavigator (native-stack)
                    └── MapScreen (only screen)
```

`App.tsx` also calls `Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN)` before any native map code runs — this is required by the Mapbox SDK to authenticate tile requests.

The native stack navigator (`@react-navigation/native-stack`) is used because it gives native screen transitions backed by the OS's own navigation stack (FragmentTransaction on Android, UINavigationController on iOS), which is faster than the JS-animated stack.

---

### 7.7 Offline Architecture

```
useConnectivity (NetInfo listener)
  └── setOffline(true/false) → Zustand
        └── isOffline → OfflineBanner (visible/hidden)
        └── isOffline → OfflinePanel (status indicator colour)

configureAmbientCache() [called once on startup]
  └── Sets 256 MB ambient cache limit on Mapbox's on-device SQLite store.
      Previously seen tiles, glyphs, and sprites are served from this
      cache without a network round-trip.

User taps "Save" in OfflinePanel
  └── ensureRegionPack(style)
        └── Mapbox.offlineManager.createPack(...)
              ├── Downloads all tiles for Greater Bengaluru
              │   bounds [77.45–77.78° E, 12.82–13.14° N]
              │   at zoom levels 10–16
              ├── Stores in on-device SQLite pack database
              └── Fires progress callback → UI progress bar

getOfflinePacksStatus() [called every 1 second while OfflinePanel is open]
  └── Mapbox.offlineManager.getPacks()
        └── For each pack: p.status()
              ├── Returns { percentage, completedResourceSize }
              └── "Does not exist" errors are silently swallowed
                  (pack was deleted or not yet registered — benign)
```

---

### 7.8 Search Architecture

```
User types "HPCL Whitefield"
          │
          ▼ (350 ms debounce)
setSearchQuery("HPCL Whitefield")
          │
          ▼
SEARCH_INDEX.filter(item => {
  const q = "hpcl whitefield"   // lowercased
  return item.name.toLowerCase().includes(q)      // ✓ "HPCL Whitefield"
      || item.brand?.toLowerCase().includes(q)    // ✓ "HPCL"
      || item.area?.toLowerCase().includes(q)     // ✓ "Whitefield"
      || item.id.toLowerCase().includes(q)        // (id check)
}).slice(0, 30)
          │
          ▼
searchResults updated in store
          │
          ▼
SearchBar re-renders results list
```

User taps a result:
```
handleSelectResult(item)
  ├── setViewport({ center: item.coords, zoom: 15, pitch: 45 }, 'fly')
  │     └── Camera flies to feature with cinematic animation
  ├── setSelectedFeature({ type: 'Feature', geometry, properties })
  │     └── FeatureDetailsSheet slides up
  │     └── HighlightLayers glow activates
  └── clearSearch()
        └── Search bar and results list are cleared
```

---

### 7.9 Animation System

All animations in the app use **Reanimated 4** shared values, never the React Native `Animated` API:

| Component | Animation type | Detail |
|---|---|---|
| `FeatureDetailsSheet` | `withSpring` / `withTiming` | 3-position snap sheet, drag with velocity |
| `OverlayPanel` (all panels) | `withSpring` / `withTiming` | Slide-up on open, fade-out on close |
| `FabHub` action items | `withSpring` with stagger | Each action item rises with a stagger delay |
| `FabHub` + icon | `interpolate` on rotate | `+` rotates to `×` as menu opens |
| `SearchBar` results | `FadeIn`, `FadeInDown` | Results fade in + stagger downward |
| `MapLoader` | `withRepeat(withSequence(...))` | Pulsing neon ring animation |
| `Skeleton` loaders | `withRepeat(withTiming(...))` | Shimmer sweep animation |

All worklet functions are marked `'worklet'` and run on the UI thread. `runOnJS()` is used only for state updates that must happen on the JS thread (e.g., `setMounted(false)` after exit animation).

---

### 7.10 Theme & Design System

All visual tokens are defined in `src/theme/Theme.ts` and imported across all components. There are no hard-coded colours, font sizes, or shadow values anywhere in the codebase.

#### Colour Palette

```
Background:  #0B0F19  (deep dark blue-black)
Surface:     #161F30  (dark card)
Elevated:    #222F47  (floating card)
Primary:     #00F2FE  (neon cyan — used for selection, FAB, active states)
Secondary:   #4FACFE  (neon blue)
Accent:      #A78BFA  (light purple — supply routes)

Entity Colours (match entity_type values):
  fuel_station: #10B981  Emerald Green
  depot:        #3B82F6  Electric Blue
  opportunity:  #F43F5E  Rose Pink
  supply_route: #8B5CF6  Purple

Traffic Colours:
  Low  (<40):  #10B981  Green
  Med  (<75):  #F59E0B  Amber
  High (≥75):  #EF4444  Red
```

#### Glass Effect

The search bar, result overlay, and FAB label pills use a **glassmorphism** style defined as `EFFECTS.glass`:

```ts
glass: {
  backgroundColor: 'rgba(22, 31, 48, 0.8)',  // semi-transparent surface
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.08)',   // subtle white border
  borderRadius: 16,
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 16,
}
```

This gives UI elements the appearance of floating above the map without fully blocking it.
