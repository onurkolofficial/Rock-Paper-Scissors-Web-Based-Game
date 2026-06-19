# Socket.IO Server Configuration / Sunucu Yapılandırması

## English

### Overview
This project uses Socket.IO for the online multiplayer game mode. When running the application as a website, it automatically connects to the same origin where the website is hosted. 
However, when building the application as an Android app using Capacitor, the app runs locally on `http://localhost` (or `https://localhost`) inside the device's webview. Because of this, it cannot find the Socket.IO backend application server automatically.

### Solution
To fix the `Unable to open asset URL: https://localhost/socket.io/?EIO=4...` error in Capacitor (Android) builds, you must provide the exact backend server URL to the app before building it.

### How to configure
1. Open the `.env` file located in the root of the project. If you don't have one, create it by copying `.env.example`.
2. Add the `VITE_SERVER_URL` environment variable with your online backend URL (e.g., your Google Cloud Run production URL).
   
```env
# Example .env file
VITE_SERVER_URL="https://ais-pre-your-app-url.run.app"
```

3. Rebuild your web assets using `npm run build` so Vite can inject this variable into the compiled app.
4. Sync the new assets to Android using `npx cap sync android`.
5. Run your application on Android. The socket connection will now point to your remote URL instead of `localhost`.

---

## Türkçe

### Genel Bakış
Bu proje, çevrimiçi çok oyunculu oyun modu için Socket.IO kullanmaktadır. Uygulama bir web sitesi olarak çalışırken, otomatik olarak barındırıldığı kök adrese (origin) bağlanır.
Ancak, uygulamayı Capacitor kullanarak bir Android uygulaması (APK/AAB) olarak derlediğinizde, uygulama cihazın içinde webview üzerinde `http://localhost` (veya `https://localhost`) üzerinden çalışır. Bu nedenle Socket.IO sunucusunu otomatik olarak bulamaz.

### Çözüm
Capacitor (Android) derlemelerinde karşılaşılan `Unable to open asset URL: https://localhost/socket.io/?EIO=4...` hatasını çözmek için, uygulamayı derlemeden önce sunucu (backend) adresinizi uygulamaya tam olarak belirtmeniz gerekir.

### Nasıl Yapılandırılır?
1. Projenin kök dizininde bulunan `.env` dosyasını açın. Eğer bu dosya yoksa, `.env.example` dosyasını kopyalayarak oluşturabilirsiniz.
2. `VITE_SERVER_URL` ortam değişkenini (environment variable) ekleyin ve değerine çalışan genel sunucunuzun (örneğin üretimdeki Cloud Run adresiniz) URL'sini yazın.

```env
# Örnek .env dosyası
VITE_SERVER_URL="https://ais-pre-your-app-url.run.app"
```

3. Web dosyalarını yeniden derlemek için `npm run build` komutunu çalıştırın. Bu sayede Vite, bu URL bilgisini uygulamanın içine gömecektir.
4. Yeni dosyaları Android'e aktarmak için `npx cap sync android` komutunu çalıştırın.
5. Uygulamanızı Android cihazında tekrar başlattığınızda soket bağlantısı `localhost` yerine belirttiğiniz uzak sunucu adresine tanımlanacaktır.
