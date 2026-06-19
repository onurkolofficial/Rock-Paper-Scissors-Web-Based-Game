import { Capacitor } from '@capacitor/core';
import { StartioAds } from '@martinezmanoloa/capacitor-startio-ads';

let adsInitPromise: Promise<void> | null = null;

export const initAds = async () => {
  if (Capacitor.getPlatform() !== 'android') return;
  if (!adsInitPromise) {
    adsInitPromise = StartioAds.initParams({
      appId: '209638589',
      enableTest: true // Test mode enabled
    }).catch(e => {
      console.error("Start.io Init error", e);
    });
  }
  return adsInitPromise;
};

export const showBanner = async () => {
  if (Capacitor.getPlatform() !== 'android') return;
  await initAds();
  try {
    await StartioAds.showBannerAd({
      position: 'TOP' // or 'BOTTOM'
    });
  } catch(e) {
    console.error("Show banner error:", e);
  }
};

export const hideBanner = async () => {
  if (Capacitor.getPlatform() !== 'android') return;
  try {
    await StartioAds.hideBannerAd();
  } catch(e) {
    console.error("Hide banner error:", e);
  }
};

export const showInterstitialAd = async () => {
  if (Capacitor.getPlatform() !== 'android') return;
  
  if (localStorage.getItem('sps_ads_interstitial') === 'false') {
    return;
  }

  await initAds();
  try {
    await StartioAds.loadInterstitialAd();
    await StartioAds.showInterstitialAd();
  } catch(e) {
    console.error("Show interstitial error:", e);
  }
};
