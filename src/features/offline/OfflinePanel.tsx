import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { useFuelStore } from '../../store/useFuelStore';
import { OverlayPanel } from '../../components/OverlayPanel';
import { COLORS, TYPOGRAPHY, EFFECTS } from '../../theme/Theme';
import { MAP_STYLES, MapStyleConfig } from '../styles/mapStyles';
import { haptics } from '../../utils/haptics';
import {
  getOfflinePacksStatus,
  deleteRegionPack,
  ensureRegionPack,
  clearCache,
  refreshResources,
  PackStatusInfo,
} from './offlineManager';

// Custom icons for the Offline Panel
const CloudIcon = ({ color = COLORS.primary, size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z" />
  </Svg>
);

const TrashIcon = ({ color = '#EF4444', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </Svg>
);

const DownloadIcon = ({ color = COLORS.primary, size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </Svg>
);

const CheckCircleIcon = ({ color = '#10B981', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <Path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
    <Path d="M22 4L12 14.01l-3-3" />
  </Svg>
);

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const OfflinePanel = () => {
  const activePanel = useFuelStore((s) => s.activePanel);
  const setActivePanel = useFuelStore((s) => s.setActivePanel);
  const isOffline = useFuelStore((s) => s.isOffline);
  const mapStyleId = useFuelStore((s) => s.mapStyleId);

  const [packStatuses, setPackStatuses] = useState<Record<string, PackStatusInfo>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const refreshStatuses = useCallback(async () => {
    const statuses = await getOfflinePacksStatus();
    setPackStatuses(statuses);
  }, []);

  // Poll status while sheet is open to show active download progress
  useEffect(() => {
    if (activePanel === 'offline') {
      refreshStatuses();
      const interval = setInterval(refreshStatuses, 1000);
      return () => clearInterval(interval);
    }
  }, [activePanel, refreshStatuses]);

  const handleDownload = async (style: MapStyleConfig) => {
    haptics.toggle();
    setLoadingMap((prev) => ({ ...prev, [style.id]: true }));
    try {
      showToast(`Starting download: ${style.label}`);
      await ensureRegionPack(style, (progress) => {
        setPackStatuses((prev) => ({
          ...prev,
          [style.id]: {
            styleId: style.id,
            percentage: progress.percentage,
            completed: progress.completed,
            sizeBytes: prev[style.id]?.sizeBytes || 0,
          },
        }));
      });
      await refreshStatuses();
    } catch (err) {
      console.warn('Offline download failed', err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [style.id]: false }));
    }
  };

  const handleDelete = async (style: MapStyleConfig) => {
    haptics.warning();
    setLoadingMap((prev) => ({ ...prev, [style.id]: true }));
    try {
      await deleteRegionPack(style.id);
      showToast(`Deleted ${style.label} offline pack`);
      // Short delay for database write
      setTimeout(refreshStatuses, 250);
    } catch (err) {
      console.warn('Offline deletion failed', err);
    } finally {
      setLoadingMap((prev) => ({ ...prev, [style.id]: false }));
    }
  };

  const handleClearCache = async () => {
    haptics.success();
    try {
      await clearCache();
      showToast('Temporary map cache cleared');
    } catch (err) {
      console.warn('Clear cache failed', err);
    }
  };

  const handleRevalidate = async () => {
    haptics.action();
    try {
      showToast('Revalidating map tiles...');
      await refreshResources(mapStyleId);
      showToast('Tiles revalidated successfully');
    } catch (err) {
      console.warn('Revalidation failed', err);
    }
  };

  return (
    <OverlayPanel
      visible={activePanel === 'offline'}
      onClose={() => setActivePanel(null)}
      title="Offline Maps Manager"
    >
      <View style={styles.container}>
        {/* Connection status header */}
        <View style={[styles.statusCard, isOffline ? styles.statusOffline : styles.statusOnline]}>
          <View style={[styles.statusDot, { backgroundColor: isOffline ? '#F59E0B' : '#10B981' }]} />
          <Text style={styles.statusText}>
            {isOffline
              ? 'Offline — Map is running entirely on device-cached tiles.'
              : 'Online — Connected to server. Map styles cache automatically.'}
          </Text>
        </View>

        {toastMsg && (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toastMsg}</Text>
          </View>
        )}

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Active Region: Greater Bengaluru</Text>
          <Text style={styles.sectionSubtitle}>
            Downloads download all vector tiles, glyphs, and sprites for offline navigation (Zoom levels 10 to 16).
          </Text>

          {/* List of styles and their download progress */}
          <View style={styles.list}>
            {MAP_STYLES.map((style) => {
              const pack = packStatuses[style.id];
              const isDownloading = pack && !pack.completed && pack.percentage < 100;
              const isDownloaded = pack && pack.completed;
              const isActiveStyle = style.id === mapStyleId;
              const loading = loadingMap[style.id];

              return (
                <View key={style.id} style={[styles.row, isActiveStyle && styles.rowActive]}>
                  {/* Swatch & Name */}
                  <View style={styles.rowLeft}>
                    <View style={[styles.swatch, { backgroundColor: style.swatch }]} />
                    <View style={styles.rowMeta}>
                      <View style={styles.titleRow}>
                        <Text style={styles.rowName}>{style.label}</Text>
                        {isActiveStyle && <Text style={styles.activeBadge}>ACTIVE</Text>}
                      </View>
                      <Text style={styles.rowStatus}>
                        {isDownloaded
                          ? `Ready for Offline (${formatBytes(pack.sizeBytes)})`
                          : isDownloading
                          ? `Downloading: ${pack.percentage.toFixed(0)}%`
                          : 'Not downloaded'}
                      </Text>
                    </View>
                  </View>

                  {/* Actions */}
                  <View style={styles.rowRight}>
                    {loading ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : isDownloaded ? (
                      <View style={styles.actionsGroup}>
                        <View style={styles.doneIcon}>
                          <CheckCircleIcon size={16} />
                        </View>
                        <Pressable
                          onPress={() => handleDelete(style)}
                          style={styles.actionBtnIcon}
                          accessibilityLabel={`Delete ${style.label} offline pack`}
                          accessibilityRole="button"
                        >
                          <TrashIcon size={16} />
                        </Pressable>
                      </View>
                    ) : isDownloading ? (
                      <View style={styles.progressCircle}>
                        <ActivityIndicator size="small" color={COLORS.primary} />
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => handleDownload(style)}
                        style={styles.downloadBtn}
                        accessibilityLabel={`Download ${style.label} offline pack`}
                        accessibilityRole="button"
                      >
                        <DownloadIcon size={15} color={COLORS.primary} />
                        <Text style={styles.downloadBtnText}>Save</Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Progress Bar under row if downloading */}
                  {isDownloading && (
                    <View style={styles.progressBarWrapper}>
                      <View style={[styles.progressBarFill, { width: `${pack.percentage}%` }]} />
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Disk & Cache Controls */}
          <Text style={styles.sectionTitle}>Cache & Maintenance</Text>
          <View style={styles.cacheCard}>
            <View style={styles.cacheRow}>
              <View style={styles.cacheMeta}>
                <Text style={styles.cacheTitle}>Ambient Tiles Cache</Text>
                <Text style={styles.cacheDesc}>
                  Mapbox stores seen tiles. Clear this cache to release device memory. Offline packs are preserved.
                </Text>
              </View>
              <Pressable onPress={handleClearCache} style={styles.cacheActionBtn} accessibilityRole="button">
                <Text style={styles.cacheActionBtnText}>Clear</Text>
              </Pressable>
            </View>

            <View style={styles.cacheSeparator} />

            <View style={styles.cacheRow}>
              <View style={styles.cacheMeta}>
                <Text style={styles.cacheTitle}>Force Tile Revalidation</Text>
                <Text style={styles.cacheDesc}>
                  Forces map to check for server tile updates. Useful if network returns 429 warnings.
                </Text>
              </View>
              <Pressable onPress={handleRevalidate} style={styles.cacheActionBtn} accessibilityRole="button">
                <Text style={styles.cacheActionBtnText}>Sync</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    </OverlayPanel>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusOnline: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statusOffline: {
    backgroundColor: 'rgba(245, 158, 17, 0.08)',
    borderColor: 'rgba(245, 158, 17, 0.25)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusText: {
    flex: 1,
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.medium,
    lineHeight: 16,
  },
  toast: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: COLORS.primary,
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  toastText: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  scroll: {
    maxHeight: 390,
  },
  sectionTitle: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
    marginTop: 6,
    marginBottom: 4,
    letterSpacing: 0.4,
  },
  sectionSubtitle: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 14,
  },
  list: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  rowActive: {
    borderColor: 'rgba(0, 242, 254, 0.25)',
    backgroundColor: 'rgba(0, 242, 254, 0.03)',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  rowMeta: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowName: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  activeBadge: {
    fontSize: 8,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginLeft: 6,
    letterSpacing: 0.3,
  },
  rowStatus: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 10,
    marginTop: 2,
  },
  rowRight: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  actionsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doneIcon: {
    marginRight: 8,
  },
  actionBtnIcon: {
    padding: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
  },
  progressCircle: {
    paddingHorizontal: 8,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
  },
  downloadBtnText: {
    color: COLORS.primary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
    marginLeft: 4,
  },
  progressBarWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  // Cache Card
  cacheCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  cacheRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  cacheMeta: {
    flex: 1,
    paddingRight: 16,
  },
  cacheTitle: {
    color: COLORS.textPrimary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: TYPOGRAPHY.sizes.xs,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  cacheDesc: {
    color: COLORS.textMuted,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 9,
    lineHeight: 12,
    marginTop: 2,
  },
  cacheActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    minWidth: 54,
    alignItems: 'center',
  },
  cacheActionBtnText: {
    color: COLORS.textSecondary,
    fontFamily: TYPOGRAPHY.fontFamily,
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  cacheSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 10,
  },
});

export default OfflinePanel;
