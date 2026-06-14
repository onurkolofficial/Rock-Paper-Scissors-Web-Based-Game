# Google Play Games Integration Guide / Google Play Games Entegrasyon Rehberi

This document explains how to set up Google Play Games Services, leaderboards, and achievements, and how they are integrated into our React/Capacitor application using the open-source `@openforge/capacitor-game-services` plugin.

---

## 🇬🇧 English Guide

### 0. 🛠️ Using `@openforge/capacitor-game-services`
We have transitioned from the private sponsor-only Capawesome plugin to the robust, open-source **`@openforge/capacitor-game-services`** package.

* **Package name:** `@openforge/capacitor-game-services`
* **Seamless Web Support:** It comes with an integrated Web/JS fallback mock out-of-the-box. The codebase compiles, lints, and runs perfectly on both browser environments (web preview) and native devices without needing any local stubs or private registry tokens.

---

### 1. Google Cloud Console Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your Google Play Game project.
3. Go to **Credentials**, ensure you have:
   - An **OAuth 2.0 Web Application Client ID** (used inside the React code to initialize Google Sign-In).
   - An **OAuth 2.0 Android Client ID** (used by Google Play to identify your signed APK/AAB).
4. Ensure your app's package name (`com.onurkolofficial.spsgame`) and SHA-1 fingerprint are correctly registered.

### 2. Google Play Console Setup (Play Games Services)
1. Go to the [Google Play Console](https://play.google.com/console/) and select your game.
2. In the left menu, go to **Play Games Services** -> **Setup and management** -> **Configuration**.
3. Choose "Yes, my game already uses Google APIs" and link your Google Cloud project.
4. **Leaderboards Setting:**
   - Go to **Play Games Services** -> **Leaderboards** -> **Create leaderboard**.
   - Set the name (e.g., "Global High Scores") and format.
   - Copy the generated **Leaderboard ID** (starts with `CgkI...`).
5. **Achievements Setting:**
   - Go to **Play Games Services** -> **Achievements** -> **Create achievement**.
   - Create achievements to match your goals (e.g., First Win, Streak Winner, Rock Power).
   - Copy the generated **Achievement IDs** (each starts with `CgkI...`).
6. Publish your Play Games configuration.

### 3. Integrating the IDs into the Code

#### 🏆 Leaderboards Integration
Open `/src/views/LeaderboardMenu.tsx`. Replace `'CgkIua-BqqENEAIQAQ'` with your actual **Leaderboard ID** from Google Play Console (already configured as default for "Onur KOL"):

```typescript
// /src/views/LeaderboardMenu.tsx
import { GameServices } from '@openforge/capacitor-game-services';

await GameServices.submitScore({
  leaderboardId: 'CgkIua-BqqENEAIQAQ', // Your real leaderboard ID
  score: score
});
```

#### 🎯 Achievements & Multi-language Integration
Open `/src/views/AchievementsMenu.tsx`. Link your Google Play **Achievement IDs** into the `ACHIEVEMENTS_LIST` array, utilizing translation keys:

```typescript
// /src/views/AchievementsMenu.tsx
const ACHIEVEMENTS_LIST = [
  { id: 't1', playGamesId: 'CgkIua-BqqENEAIQBQ', titleKey: 'ach_t1_title', descKey: 'ach_t1_desc', icon: '🏆', isUnlocked: false},
  { id: 't2', playGamesId: 'CgkIua-BqqENEAIQBA', titleKey: 'ach_t2_title', descKey: 'ach_t2_desc', icon: '🔥', isUnlocked: false},
  // ...
];
```

The translation values are dynamically fetched from the `/src/locales/en.json` and `/src/locales/tr.json` files, preventing any hardcoded text inside the views.

### 4. API & Integration Methods Used

* **Multi-language Support:** Display labels, developer notes, scoreboard headers, titles, and descriptions dynamically resolve depending on the user's settings via the `t` function wrapper.
* **Automated Score Submission:** When a match is completed or the leaderboard mounts, the game calls `submitScoreToPlayGames(score)` which automatically syncs the user's score to Google Play Services.
* **Automated Achievement Unlocking:** As local stats trigger milestone conditions (e.g. 1 win, 10 draws), `unlockPlayGamesAchievement(playGamesId)` is invoked dynamically to unlock the reward native on Google Play Games.
* **Native Overlays:** The game provides premium floating primary action buttons allowing native players to open the beautiful high-fidelity official Play Games full-screen overlays:
  * `GameServices.showLeaderboard({ leaderboardId: id })`
  * `GameServices.showAchievements()`

---

## 🇹🇷 Türkçe Entegrasyon Rehberi

Bu dosya; Google Play Oyun Hizmetleri (Play Games Services), liderlik tabloları ve başarıların nasıl kurulacağını ve bunların React/Capacitor uygulamasında nasıl çalıştığını anlatmaktadır. Entegrasyon, açık kaynaklı `@openforge/capacitor-game-services` eklentisiyle sağlanmıştır.

### 0. 🛠️ `@openforge/capacitor-game-services` Kullanımı
Özel sponsorluk gerektiren ücretli/kapalı Capawesome eklentisi yerine tamamen açık kaynaklı ve ücretsiz olan **`@openforge/capacitor-game-services`** paketi tercih edilmiştir.

* **Paket Adı:** `@openforge/capacitor-game-services`
* **Sorunsuz Web Desteği:** Kendiliğinden entegre edilmiş bir tarayıcı/web simülasyon mekanizmasına (Web/JS Fallback) sahiptir. Böylece kod tabanınız herhangi bir hata aramaya takılmadan, yerel köprü veya özel .npmrc kayıtlarına ihtiyaç duymadan tarayıcıda (web önizlemede) ve yerel test cihazlarında doğrudan %100 başarılı şekilde derlenir ve çalışır.

---

### 1. Google Cloud Console Kurulumu
1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin.
2. Google Play projenizi seçin.
3. **Kimlik Bilgileri (Credentials)** sekmesinde aşağıdakilerin hazır olduğundan emin olun:
   - **Web Uygulaması OAuth 2.0 İstemci Kimliği (Web Application Client ID):** Bunu React kodumuzda kullanıcı oturum açma akışını (`GoogleSignIn.initialize`) başlatmak için kullanıyoruz.
   - **Android OAuth 2.0 İstemci Kimliği (Android Client ID):** Google Play'in, cihazda imzalı çalışan paketinizle eşleşmesini doğrulamak için arka planda kullanılır.
4. Paket adınızın (`com.onurkolofficial.spsgame`) ve SHA-1 parmak izinizin Android istemcisine doğru şekilde tanımlandığından emin olun.

### 2. Google Play Console Play Oyun Hizmetleri Kurulumu
1. [Google Play Console](https://play.google.com/console/) adresine gidin ve oyununuzu seçin.
2. Sol menüden **Play Games Hizmetleri (Play Games Services)** -> **Kurulum ve yönetim** -> **Yapılandırma** bölümüne girin.
3. "Evet, oyunum zaten Google API'lerini kullanıyor" seçeneğiyle ilerleyip Google Cloud projenizi bağlayın.
4. **Liderlik Tablo Oluşturma (Leaderboards):**
   - **Liderlik Tabloları** -> **Liderlik tablosu oluştur** adımlarını izleyin.
   - İsim verin (örn: "Küresel Skorlar") ve kaydedin.
   - Console'da oluşan **Liderlik Tablosu Kimliğini (Leaderboard ID)** kopyalayın (genellikle `CgkI...` ile başlar).
5. **Başarılar Oluşturma (Achievements):**
   - **Başarılar** -> **Başarı oluştur** adımlarını izleyin.
   - Oyundaki hedeflere uygun başarılar ekleyin (örn: İlk Galibiyet, Beraberlik Ustası, Taşın Gücü).
   - Her bir başarı için üretilen **Başarı Kimliğini (Achievement ID)** kopyalayın (örn: `CgkI...`).
6. Play Games yapılandırmanızı yayınlayın.

### 3. Kimlik Bilgilerini Koda Bağlama

#### 🏆 Sıralama Tablosu Entegrasyonu
`/src/views/LeaderboardMenu.tsx` dosyasını açın. 'CgkIua-BqqENEAIQAQ' değerini Play Console'dan aldığınız gerçek **Leaderboard ID** ile değiştirin (Onur KOL için önceden tanımlanmıştır):

```typescript
// /src/views/LeaderboardMenu.tsx
import { GameServices } from '@openforge/capacitor-game-services';

await GameServices.submitScore({
  leaderboardId: 'CgkIua-BqqENEAIQAQ', // Liderlik tablosu kimliğiniz
  score: score
});
```

#### 🎯 Başarılar Entegrasyonu
`/src/views/AchievementsMenu.tsx` dosyasını açın. Play Console'dan aldığınız **Başarı Kimliklerini (Achievement IDs)** `ACHIEVEMENTS_LIST` dizisinde ilgili hedeflere atayıp, çeviri anahtarlarını belirtin:

```typescript
// /src/views/AchievementsMenu.tsx
const ACHIEVEMENTS_LIST = [
  { id: 't1', playGamesId: 'CgkIua-BqqENEAIQBQ', titleKey: 'ach_t1_title', descKey: 'ach_t1_desc', icon: '🏆', isUnlocked: false},
  { id: 't2', playGamesId: 'CgkIua-BqqENEAIQBA', titleKey: 'ach_t2_title', descKey: 'ach_t2_desc', icon: '🔥', isUnlocked: false},
  // ...
];
```

Çeviriler doğrudan `/src/locales/en.json` ve `/src/locales/tr.json` dosyalarından okunarak, oyun içi dil seçimiyle tam entegre çalışır.

### 4. Kullanılan Koda Dayalı Entegrasyonlar ve Metotlar

* **Çoklu Dil Desteği:** Liderlik ekranı başlıkları, geliştirici notları ve başarıların isim/açıklamaları `t` fonksiyonu aracılığıyla seçili dile (Türkçe / İngilizce) duyarlı şekilde render edilir.
* **Otomatik Skor Gönderimi:** Maçlar tamamlandığında veya sıralama menüsü yüklendiğinde, local'deki en güncel skor `submitScoreToPlayGames(score)` metodu ile Google Play sunucularına otomatik olarak senkronize edilir.
* **Otomatik Başarı Kilidi Açma:** Oyuncunun yerel istatistikleri (galibiyet sayısı vb.) kilometre taşlarına ulaştığında, başarıların kilidi `unlockPlayGamesAchievement(playGamesId)` aracılığıyla Google Play profilinde otomatik olarak açılır.
* **Yerel Arayüzler (Native Overlays):** Oyunda, sıralama ve başarılar sayfasında yer alan parlayan özel eylem butonları aracılığıyla, oyunculara doğrudan resmi Google Play Games tam ekran arayüzü gösterilir:
  * `GameServices.showLeaderboard({ leaderboardId: id })`
  * `GameServices.showAchievements()`
