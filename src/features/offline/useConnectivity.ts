import { useEffect, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useFuelStore } from '../../store/useFuelStore';
import { haptics } from '../../utils/haptics';

/**
 * Subscribes to network reachability and mirrors it into the store as
 * `isOffline`. A short haptic warning fires on the transition into offline so
 * the user gets a physical cue that the app has switched to cached data.
 */
export const useConnectivity = () => {
  const setOffline = useFuelStore((s) => s.setOffline);
  const wasOffline = useRef(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      // Treat "connected but not yet verified" as online to avoid false flags;
      // only `isInternetReachable === false` is a confirmed offline state.
      const offline =
        state.isConnected === false || state.isInternetReachable === false;

      if (offline && !wasOffline.current) {
        haptics.warning();
      }
      wasOffline.current = offline;
      setOffline(offline);
    });

    return unsubscribe;
  }, [setOffline]);
};
