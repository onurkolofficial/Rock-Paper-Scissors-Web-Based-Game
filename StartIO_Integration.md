# Start.io Ads Integration / Start.io Reklam Entegrasyonu

Below you can find the step-by-step guide on how to integrate Start.io (StartApp) Ads into your Capacitor/React application. / Aşağıda Start.io (StartApp) Reklamları'nı Capacitor/React uygulamanıza nasıl entegre edeceğinizi adım adım anlatan rehberi bulabilirsiniz.

---

## 🇬🇧 English Guide

### 1. Start.io Account & App Setup
1. Go to the [Start.io Portal](https://portal.start.io/) and log in or sign up.
2. Add a new App in your dashboard.
3. Once created, you will get an **App ID**. Save this for the initialization step.

### 2. Install Capacitor Plugin
Since Capacitor 8 is being used, we will use an available community plugin for Start.io on Android (like `@martinezmanoloa/capacitor-startio-ads`). Since it might be built for an older Capacitor version, use `--legacy-peer-deps`.

```bash
npm install @martinezmanoloa/capacitor-startio-ads --legacy-peer-deps
npx cap sync
```

### 3. Implementation in React (App.tsx / Game View)
You can show Banner Ads or Interstitial (Fullscreen) Ads when a game ends or when returning to the main menu.

```typescript
import { StartioAds } from '@martinezmanoloa/capacitor-startio-ads';

// Initialize the plugin
const initAds = async () => {
  try {
    await StartioAds.initParams({
      appId: 'YOUR_STARTIO_APP_ID',
      enableTest: false // Set to true when testing
    });
  } catch(e) {
    console.error("Start.io Init error", e);
  }
};

// Call this function when the app loads (e.g., in a useEffect in App.tsx)
initAds();

// --- Displaying a Banner ---
export const showBanner = async () => {
  await StartioAds.showBannerAd({
    position: 'BOTTOM' // or 'TOP'
  });
};

export const hideBanner = async () => {
  await StartioAds.hideBannerAd();
};

// --- Displaying a Fullscreen (Interstitial) Ad ---
export const showFullscreenAd = async () => {
  // First load it
  await StartioAds.loadInterstitialAd();
  // Then show it
  await StartioAds.showInterstitialAd();
};
```

### 4. Important Android Configuration
Sometimes you might need to add specific permissions into your `android/app/src/main/AndroidManifest.xml` (though standard plugins inject this automatically):
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

---

## 🇹🇷 Türkçe Rehber

### 1. Start.io Hesabı ve Uygulama Kaydı
1. [Start.io Portal](https://portal.start.io/) sayfasına gidip giriş yapın veya kayıt olun.
2. Panelinize (Dashboard) yeni bir Uygulama (App) ekleyin.
3. Uygulamanızı oluşturduktan sonra size bir **App ID** verilecektir. Bunu başlatma adımı için not edin.

### 2. Capacitor Eklentisini Kurma
Capacitor 8 kullandığımızdan, topluluk eklentilerinden Android için çalışan bir paketi (örn. `@martinezmanoloa/capacitor-startio-ads`) yükleyeceğiz. Eskiden derlenmiş olma ihtimaline karşı `--legacy-peer-deps` kullanmamız gerekebilir.

```bash
npm install @martinezmanoloa/capacitor-startio-ads --legacy-peer-deps
npx cap sync
```

### 3. React İçerisinde Kullanımı
Oyun sonunda veya ana menüye dönerken Şerit (Banner) veya Tam Ekran (Interstitial) reklamlar gösterebilirsiniz.

```typescript
import { StartioAds } from '@martinezmanoloa/capacitor-startio-ads';

// Eklentiyi başlatın
const initAds = async () => {
  try {
    await StartioAds.initParams({
      appId: 'SİZİN_STARTIO_APP_ID_NUMARANIZ',
      enableTest: false // Test ederken true yapın
    });
  } catch(e) {
    console.error("Start.io Başlatma Hatası", e);
  }
};

// Bu fonksiyonu uygulama yüklendiğinde çağırın (Örn: App.tsx içinde useEffect kullanarak)
initAds();

// --- Banner (Şerit) Reklam Gösterme ---
export const showBanner = async () => {
  await StartioAds.showBannerAd({
    position: 'BOTTOM' // veya 'TOP'
  });
};

export const hideBanner = async () => {
  await StartioAds.hideBannerAd();
};

// --- Tam Ekran Reklam Gösterme ---
export const showFullscreenAd = async () => {
  // Önce reklamı yükleyin
  await StartioAds.loadInterstitialAd();
  // Sonra reklamı gösterin
  await StartioAds.showInterstitialAd();
};
```

### 4. Önemli Android Ayarları (AndroidManifest)
Genellikle eklentiler bunu otomatik olarak yapsa da, `android/app/src/main/AndroidManifest.xml` dosyanızda şu izinlerin olduğundan emin olun:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```
