export const STORAGE_KEYS = {
  USER_NAME: 'sps_user_name',
  USER_IMAGE_URL: 'sps_user_image_url',
  STATS_WINS: 'sps_stats_wins',
  STATS_DRAWS: 'sps_stats_draws',
  STATS_LOSSES: 'sps_stats_losses',
  STATS_ONLINE_WINS: 'sps_stats_online_wins',
  STATS_ONLINE_DRAWS: 'sps_stats_online_draws',
  STATS_ONLINE_LOSSES: 'sps_stats_online_losses',
  STATS_ONLINE_HISTORY: 'sps_stats_online_history',
  SOUND: 'sps_sound',
  VOLUME: 'sps_volume',
  VIBRATION: 'sps_vibration',
  ADS_INTERSTITIAL: 'sps_ads_interstitial',
  LANG: 'sps_lang',
  IRON_COUNT: 'sps_iron_count',
  STATS_CASH: 'sps_stats_cash',
  OWNED_SKINS: 'sps_owned_skins',
  ACTIVE_SKIN: 'sps_active_skin',
  USER_CHANGED_NAME: 'sps_user_changed_name'
};

export const getAllLocalData = (): Record<string, string> => {
  const data: Record<string, string> = {};
  for (const key of Object.values(STORAGE_KEYS)) {
    const val = localStorage.getItem(key);
    if (val !== null) {
      data[key] = val;
    }
  }
  return data;
};

export const applyAllLocalData = (data: Record<string, string>) => {
  if (!data) return;
  for (const [key, value] of Object.entries(data)) {
    if (value !== null && value !== undefined) {
      localStorage.setItem(key, value);
    }
  }
};

