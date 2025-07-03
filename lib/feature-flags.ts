// Feature flags for safe feature rollout
export const FEATURE_FLAGS = {
  VIDEO_RECORDING: process.env.ENABLE_VIDEO_RECORDING === 'true',
  VIDEO_STORAGE: process.env.ENABLE_VIDEO_STORAGE === 'true',
  VIDEO_PLAYBACK: process.env.ENABLE_VIDEO_PLAYBACK === 'true',
} as const;

export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature] || false;
}

// Safe feature check with fallback
export function withFeatureFlag<T>(
  feature: keyof typeof FEATURE_FLAGS,
  enabledFn: () => T,
  disabledFn: () => T
): T {
  return isFeatureEnabled(feature) ? enabledFn() : disabledFn();
} 