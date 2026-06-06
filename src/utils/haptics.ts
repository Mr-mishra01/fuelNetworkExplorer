import ReactNativeHapticFeedback, {
  HapticFeedbackTypes,
} from 'react-native-haptic-feedback';

/**
 * Thin, crash-safe wrapper around react-native-haptic-feedback.
 *
 * Centralizes haptic intent ("selection", "toggle", "impact") so call sites
 * stay semantic and we never sprinkle raw feedback-type strings around. Wrapped
 * in try/catch because haptics are a non-critical enhancement — a device
 * without a taptic engine should never throw into the UI.
 */

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const trigger = (type: HapticFeedbackTypes) => {
  try {
    ReactNativeHapticFeedback.trigger(type, options);
  } catch {
    // Haptics are best-effort; silently ignore unsupported devices.
  }
};

export const haptics = {
  /** Light tick — feature selection, opening a sheet. */
  selection: () => trigger(HapticFeedbackTypes.impactLight),
  /** Medium tap — FAB open/close, primary actions. */
  action: () => trigger(HapticFeedbackTypes.impactMedium),
  /** Crisp toggle — layer switches, filter chips. */
  toggle: () => trigger(HapticFeedbackTypes.selection),
  /** Success cue — refresh complete, download finished. */
  success: () => trigger(HapticFeedbackTypes.notificationSuccess),
  /** Warning cue — went offline / failure. */
  warning: () => trigger(HapticFeedbackTypes.notificationWarning),
};
