# Google Play Games Integration / Google Play Games Entegrasyonu

Below you can find the step-by-step guide on how to integrate Google Play Games Services into your Capacitor/React application. / Aşağıda Google Play Games Hizmetleri'ni Capacitor/React uygulamanıza nasıl entegre edeceğinizi adım adım anlatan rehberi bulabilirsiniz.

---

## 🇬🇧 English Guide

### 1. Google Cloud Console Setup
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Enable the **Google Play Game Services API**.
4. Go to **Credentials**, create an **OAuth 2.0 Client ID** for "Android" (and "Web application" if you want web fallback). You will need your package name and SHA-1 certificate fingerprint.

### 2. Google Play Console Setup
1. Go to the [Google Play Console](https://play.google.com/console/).
2. Select your app and navigate to **Play Games Services** -> **Setup and management** -> **Configuration**.
3. Choose "Yes, my game already uses Google APIs" and select your Cloud project.
4. Add credentials for your Android app using the OAuth client you created.
5. Add leaderboards, achievements, etc., if needed, and publish your Play Games configuration.

### 3. Install Capacitor Plugins
You will need a community plugin to handle Google Sign-In and Play Games natively on Android:
```bash
npm install @capawesome/capacitor-google-sign-in
npx cap sync
```

### 4. Implementation in React
In your `AppContext.tsx` or auth logic, initialize the Google Sign-In with your web client ID from Google Cloud:

```typescript
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

// Initialize
GoogleSignIn.initialize({
  clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
  scopes: ['profile', 'email', 'https://www.googleapis.com/auth/games'],
});

// Login Function
const loginWithGoogle = async () => {
  try {
    const result = await GoogleSignIn.signIn();
    console.log("Logged in:", result.user?.displayName);
    // You can now set the userName in your AppContext
  } catch (error) {
    console.error("Login failed:", error);
  }
};
```

### 5. Common Errors and Solutions

**Error:** `"io.capawesome.capacitorjs.plugins.googlesignin.classes.CustomException: The user canceled the sign-in flow."`

This error can occur when the user genuinely cancels the sign-in, but it is also thrown as a default error by Android when there is a **configuration issue**. Check the following to resolve:

1. **Incorrect Client ID:** The Client ID you provide to `GoogleSignIn.initialize()` must be the one created for "Web application" in Google Cloud, *not* the one for "Android".
2. **Missing SHA-1 Key:** When testing on Android, the **SHA-1** fingerprint of the keystore (debug or release) you signed the APK with might not be added to the **Android** type OAuth Client ID in the Google Cloud Console. Run `cd android && ./gradlew signingReport` in your terminal to find the correct SHA-1 hash and add it to the Google Cloud Console.
3. **Missing Support Email:** Ensure you have configured a support platform email for your app in the "OAuth consent screen" section of the Google Cloud Console.
4. **capacitor.config.ts Settings:** You might not have added the Web Client ID to the plugin settings in the Capacitor configuration file:
   ```typescript
   // capacitor.config.ts
   import type { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'com.your.bundle.id',
     appName: 'YourApp',
     webDir: 'dist',
     plugins: {
       GoogleSignIn: {
         clientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
         scopes: ['profile', 'email'],
         forceCodeForRefreshToken: true,
       },
     },
   };
   export default config;
   ```

---

## 🇹🇷 Türkçe Rehber

### 1. Google Cloud Console Kurulumu
1. [Google Cloud Console](https://console.cloud.google.com/)'a gidin.
2. Yeni bir proje oluşturun veya var olanı seçin.
3. **Google Play Game Services API**'sini etkinleştirin.
4. **Kimlik Bilgileri (Credentials)** bölümüne gidip, "Android" için (ve web'de çalışması için "Web application" için) bir **OAuth 2.0 İstemci Kimliği (Client ID)** oluşturun. Uygulamanızın paket adına ve SHA-1 sertifika parmak izine ihtiyacınız olacak.

### 2. Google Play Console Kurulumu
1. [Google Play Console](https://play.google.com/console/)'a gidin.
2. Uygulamanızı seçin ve **Play Games Hizmetleri** -> **Kurulum ve yönetim** -> **Yapılandırma** sekmesine gidin.
3. "Evet, oyunum halihazırda Google API'lerini kullanıyor" seçeneğini seçip Cloud projenizi bağlayın.
4. Cloud üzerinde oluşturduğunuz OAuth istemcisini kullanarak Android uygulamanız için kimlik bilgilerini ekleyin.
5. Gerekirse liderlik tabloları (leaderboards), başarılar (achievements) ekleyin ve Play Games yapılandırmanızı yayınlayın.

### 3. Capacitor Eklentilerini Kurma
Android'de Google Oturum Açma ve Play Games'i yerel (native) olarak yönetmek için bir topluluk eklentisine ihtiyacınız olacak:
```bash
npm install @capawesome/capacitor-google-sign-in
npx cap sync
```

### 4. React İçerisinde Uygulama
`AppContext.tsx` veya yetkilendirme (auth) mantığınızda, Google Cloud'dan aldığınız **WEB İSTEMCİ KİMLİĞİNİZ** (Android istemci kimliği değil!) ile Google Oturum Açma'yı başlatın:

```typescript
import { GoogleSignIn } from '@capawesome/capacitor-google-sign-in';

// Başlatma (DİKKAT: Buraya ANDROID değil, WEB Client ID yazılmalıdır)
GoogleSignIn.initialize({
  clientId: 'SİZİN_WEB_CLIENT_ID_NİZ.apps.googleusercontent.com',
  scopes: ['profile', 'email', 'https://www.googleapis.com/auth/games'],
});

// Giriş Fonksiyonu
const loginWithGoogle = async () => {
  try {
    const result = await GoogleSignIn.signIn();
    console.log("Giriş yapıldı:", result.user?.displayName);
    // Artık userName bilginizi AppContext içinde güncelleyebilirsiniz
  } catch (error) {
    console.error("Giriş başarısız:", error);
  }
};
```

### 5. Sık Karşılaşılan Hatalar ve Çözümleri

**Hata:** `"io.capawesome.capacitorjs.plugins.googlesignin.classes.CustomException: The user canceled the sign-in flow."`

Bu hata kullanıcı giriş yapmaktan gerçekten vazgeçtiğinde çıkabileceği gibi, **kurulum eksikliği** olduğunda Android tarafından varsayılan hata olarak fırlatılır. Çözüm için aşağıdakileri kontrol edin:

1. **Yanlış Client ID Kullanımı:** `GoogleSignIn.initialize()` içerisine yazdığınız Client ID, Google Cloud'da "Android" için oluşturulan *değil*, "Web application (Web Uygulaması)" için oluşturulan Client ID olmalıdır.
2. **Eksik SHA-1 Anahtarı:** Android üzerinde test yaparken APK'yı imzaladığınız keystore'un (debug veya release) **SHA-1** parmak izi, Google Cloud Console'daki **Android** türündeki OAuth Client ID içerisine eklenmemiş olabilir. Terminalinizde `cd android && ./gradlew signingReport` komutunu çalıştırarak doğru SHA-1 şifresini bulun ve Google Cloud Console'a ekleyin.
3. **Destek E-postası Eksikliği:** Google Cloud Console'da "OAuth consent screen (OAuth onay ekranı)" bölümünde uygulamanız için bir destek e-postası (support platform email) belirlediğinizden emin olun.
4. **capacitor.config.ts Ayarları:** Capacitor konfigürasyon dosyasında plugin ayarlarına Web Client ID'yi eklememiş olabilirsiniz:
   ```typescript
   // capacitor.config.ts
   import type { CapacitorConfig } from '@capacitor/cli';

   const config: CapacitorConfig = {
     appId: 'com.your.bundle.id',
     appName: 'YourApp',
     webDir: 'dist',
     plugins: {
       GoogleSignIn: {
         clientId: 'SİZİN_WEB_CLIENT_ID_NİZ.apps.googleusercontent.com',
         scopes: ['profile', 'email'],
         forceCodeForRefreshToken: true,
       },
     },
   };
   export default config;
   ```
