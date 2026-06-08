# Taş Kağıt Makas - Oyun Dökümantasyonu / Game Documentation

---

## 🇬🇧 English Guide

This documentation explains the code architecture, directory structure, and used technologies of the "Rock Paper Scissors" game developed by Onur KOL. The application is a mobile-responsive web/hybrid app developed using React, Vite, TypeScript, Tailwind CSS, and Capacitor.

### Technologies Used
- **React (v18+) & Vite:** Fast building and component-based user interface.
- **TypeScript:** Type safety and scalability.
- **Tailwind CSS:** Modern and fast interface style optimizations.
- **Capacitor:** Used to convert the written web application into a Native (Android) mobile app and to use Native APIs (e.g., Google Play Sign-in).
- **i18next:** Multi-language (Turkish / English) support.
- **Framer Motion:** Smooth transitions and animations in the interface.

### Directory Structure and Modules

The project is organized under the `src` directory in a scalable and manageable structure, referencing the Separation of Concerns principle.

#### 1. `src/views` (Views / Pages)
The section where all screens of the game are hosted.
- `MainMenu.tsx`: Main menu. The section where game modes, statistics, and settings are selected. (Also displays a banner ad at the top).
- `SinglePlayerGame.tsx`: The interface for the Single Player (Player vs. CPU) mode.
- `TwoPlayerGame.tsx`: The interface for the Two Player (Split screen) mode.
- `SettingsMenu.tsx`: Settings screen. Audio settings, language selection, etc., are managed here.
- `StatsMenu.tsx`: Statistics menu. Reflects the player's win, loss, or draw data.

#### 2. `src/contexts` (State Management)
The application's global variables and settings are managed modularly using the React Context API.
- `AppContext.tsx`: The center where all inter-screen navigation, current active screen state, Google Play Sign-In processes, and player information are kept.
- `SettingsContext.tsx`: The file where theme, playing or stopping in-game sound effects, vibration, and local storage features are managed.

#### 3. `src/model` (Game Logic - MVC Model)
- `GameModel.ts`: The class that processes the game rules. It is the code section that manages the data (Model) such as which move beats which, the winning mechanic, and score calculations.

#### 4. `src/components` (Reusable Components)
- `AlertModal.tsx`: A popup designed to show error messages or simple notifications.
- `ConfirmModal.tsx`: A popup that asks the user "Are you sure?" during actions like returning to the menu or exiting the game.

#### 5. `src/utils` (Tools / Helpers)
- `ads.ts`: Covers the loading and management of Start.io ads (Banner and Interstitial ads). Also includes platform guards to safely cancel them on non-native devices.

#### 6. `src/locales` & `src/i18n.ts` (Language Management)
The section providing the application's "Turkish-English translation" requirement. JSON-based localization files are read and reflected to the user across the app.

#### 7. Other Main Files
- `version.ts`: The structure where the application's version number is managed.
- `App.tsx` & `MainLayout.tsx`: The root wrapper of the app. The entry point where the background theme and global context providers (`Context.Provider`) are defined, and `MainMenu` or inner game screens are integrated.
- `index.css`: The global CSS setting of the project required by Tailwind.

### Data Privacy and Persistence (Local Storage)
Through `SettingsContext` and `AppContext`, all user data is stored on the device. To make the user experience smooth, statistics, translation preferences, and audio preferences are kept saved on `localStorage`.

### Model-View-Controller (MVC) Pattern Usage
- **Model:** `src/model/GameModel.ts` (Game logic) and database (localStorage) functions within Context structures.
- **View:** `.tsx` files under `src/views/`. Pure interface elements visible to the user.
- **Controller:** State functions, Context methods (e.g., `navigateWithAds` or `loginWithGoogle`), ad management functions.

*Author: Onur KOL.*

---

## 🇹🇷 Türkçe Rehber

Bu dökümantasyon, Onur KOL tarafından geliştirilen "Taş Kağıt Makas" oyununun kod mimarisini, dizin yapısını ve kullanılan teknolojileri açıklar. Uygulama React, Vite, TypeScript, Tailwind CSS ve Capacitor kullanılarak geliştirilmiş bir mobil uyumlu web/hibrit uygulamadır.

### Kullanılan Teknolojiler
- **React (v18+) & Vite:** Hızlı derleme ve bileşen tabanlı kullanıcı arayüzü.
- **TypeScript:** Tip güvenliği ve ölçeklenebilirlik.
- **Tailwind CSS:** Modern ve hızlı arayüz stil optimizasyonları.
- **Capacitor:** Yazılan web uygulamasının Native (Android) mobil uygulamaya dönüştürülmesi ve Native API'lerin (örn: Google Play Sign in) kullanılması için.
- **i18next:** Çoklu dil (Türkçe / İngilizce) desteği.
- **Framer Motion:** Arayüzdeki pürüzsüz geçişler ve animasyonlar.

### Dizin Yapısı ve Modüller

Proje, Sorumluluğun Ayrılması (Separation of Concerns) prensibi referans alınarak ölçeklenebilir ve yönetilebilir bir yapıda `src` dizini altında organize edilmiştir.

#### 1. `src/views` (Görünümler / Sayfalar)
Oyunun tüm ekranlarının barındırıldığı kısımdır.
- `MainMenu.tsx`: Ana menü. Oyun modlarının, istatistiklerin ve ayarların seçildiği bölüm. (Ayrıca üst kısmında banner reklam gösterilmektedir).
- `SinglePlayerGame.tsx`: Tek Oyunculu (Oyuncu vs. CPU) modunun arayüzü.
- `TwoPlayerGame.tsx`: İki Oyunculu (Bölünmüş ekran) modunun arayüzü.
- `SettingsMenu.tsx`: Ayarlar ekranı. Ses ayarları, dil seçimi vb. işlemler buradan yönetilir.
- `StatsMenu.tsx`: İstatistikler menüsü. Oyuncunun galibiyet, mağlubiyet veya beraberlik verilerini yansıtır.

#### 2. `src/contexts` (State Management / Genel Durum Yönetimi)
React Context API kullanılarak uygulamanın global değişkenleri ve ayarları modüler olarak yönetilir.
- `AppContext.tsx`: Tüm ekranlar arası gezinme (Navigation), geçerli aktif ekran state'i, Google Play Sign-In işlemleri ve oyuncu bilgilerinin tutulduğu merkez.
- `SettingsContext.tsx`: Tema, oyun içi ses efektlerinin çalınması veya durdurulması, titreşim ve yerel depolama özelliklerinin yönetildiği dosya.

#### 3. `src/model` (Oyun Mantığı - MVC Model)
- `GameModel.ts`: Oyun kurallarını işleyen sınıftır. Hangi hamlenin hangisini yeneceği, kazanma mekaniği, skorların hesaplanması gibi veriyi (Model) yöneten kod bölümüdür.

#### 4. `src/components` (Yeniden Kullanılabilir Parçalar)
- `AlertModal.tsx`: Hata mesajlarını veya basit bildirimleri göstermek için tasarlanan popup.
- `ConfirmModal.tsx`: Menüye dönme veya oyundan çıkış işlemlerinde kullanıcıya "Emin misiniz?" sorusunu soran popup.

#### 5. `src/utils` (Araçlar / Yardımcı Kodlar)
- `ads.ts`: Start.io reklamlarının yüklenmesini, yönetilmesini (Banner ve Interstitial reklam) kapsar. Native olmayan cihazlarda güvenli bir şekilde iptal edilmesi için platform korumaları da içerir.

#### 6. `src/locales` & `src/i18n.ts` (Dil Yönetimi)
Platformun "Türkçe-İngilizce çeviri" gereksinimini sağlayan bölümdür. JSON bazlı yerelleştirme (localization) dosyaları okunur ve uygulama genelinde kullanıcıya yansıtılır.

#### 7. Diğer Ana Dosyalar
- `version.ts`: Uygulamanın versiyon numarasının yönetildiği yapı.
- `App.tsx` & `MainLayout.tsx`: Uygulamanın root sarıcısı. Arka plan temasının, genel bağlam sağlayıcılarının (Context.Provider) tanımlandığı ve `MainMenu` veya iç oyun ekranlarının entegre edildiği giriş noktası.
- `index.css`: Tailwind için gerekli olan projenin global CSS ayarı.

### Veri Gizliliği ve Kalıcılık (Local Storage)
`SettingsContext` ve `AppContext` aracılığıyla, tüm kullanıcı verileri cihazda saklanır. Kullanıcı deneyimini pürüzsüz hale getirmek amacıyla istatistikler, çeviri tercihleri ve ses tercihleri `localStorage` üzerinde kayıtlı tutulur.

### Model-View-Controller (MVC) Pattern Kullanımı
- **Model:** `src/model/GameModel.ts` (Oyun mantığı) ve Context yapılarındaki veritabanı (localStorage) işlevleri.
- **View:** `src/views/` altındaki `.tsx` dosyaları. Kullanıcıya görünen salt arayüz elemanları.
- **Controller:** State fonksiyonları, Context metodları (örneğin `navigateWithAds` veya `loginWithGoogle`), reklam yönetim fonksiyonları.

*Yazar: Onur KOL.*