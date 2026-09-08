export interface PlayerPreferences {
  reducedMotion: boolean;
  soundEnabled: boolean;
  highContrast: boolean;
  enhanced3d: boolean;
}

function readStoredBoolean(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback;

  try {
    const value = window.localStorage.getItem(key);
    return value === null ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

export function readPlayerPreferences(): PlayerPreferences {
  return {
    reducedMotion: readStoredBoolean('sq_reduced_motion', false),
    soundEnabled: readStoredBoolean('sq_sound_enabled', true),
    highContrast: readStoredBoolean('sq_high_contrast', false),
    enhanced3d: readStoredBoolean('sq_enhanced_3d', true),
  };
}

export function savePlayerPreferences(preferences: PlayerPreferences): void {
  window.localStorage.setItem('sq_reduced_motion', String(preferences.reducedMotion));
  window.localStorage.setItem('sq_sound_enabled', String(preferences.soundEnabled));
  window.localStorage.setItem('sq_high_contrast', String(preferences.highContrast));
  window.localStorage.setItem('sq_enhanced_3d', String(preferences.enhanced3d));
}
