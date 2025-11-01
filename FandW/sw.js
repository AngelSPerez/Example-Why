const CACHE_NAME = "fire-v1-cache";

const STATIC_ASSETS = [
  "index.html",
  "version.js",
  "sw.js",
  "manifest.json",
  "main.min.js",
  "icon-60x60.png",
  "game.json",
  "img.gamedistribution.com/gamedistributionid-512x512.jpeg",
  "data/forest/levels/temple.json",
  "data/tutorials/levels/forest_01.json",
  "bower_components/requirejs/require.js",
  "assets/atlasses/CharAssets.json",
  "assets/atlasses/CharAssets.png",
  "assets/atlasses/GroundAssets.json",
  "assets/atlasses/GroundAssets.png",
  "assets/atlasses/MechAssets.json",
  "assets/atlasses/MechAssets.png",
  "assets/atlasses/MenuAssets.json",
  "assets/atlasses/MenuAssets.png",
  "assets/atlasses/MenuBackgrounds.json",
  "assets/atlasses/MenuBackgrounds.png",
  "assets/atlasses/PopupAssets.json",
  "assets/atlasses/PopupAssets.png",
  "assets/atlasses/PreloaderAssets.json",
  "assets/atlasses/PreloaderAssets.png",
  "assets/atlasses/Temples/forest/TempleAssets.json",
  "assets/atlasses/Temples/forest/TempleAssets.png",
  "assets/audio/CharToggle1.mp3",
  "assets/audio/CharToggle2.mp3",
  "assets/audio/Clock.mp3",
  "assets/audio/Death.mp3",
  "assets/audio/Diamond.mp3",
  "assets/audio/Door.mp3",
  "assets/audio/EndDiamond.mp3",
  "assets/audio/EndFail.mp3",
  "assets/audio/EndPass.mp3",
  "assets/audio/Freeze.mp3",
  "assets/audio/IceSteps_fb.mp3",
  "assets/audio/IceSteps_wg.mp3",
  "assets/audio/Jump_fb.mp3",
  "assets/audio/Jump_wg.mp3",
  "assets/audio/LevelMusic.mp3",
  "assets/audio/LevelMusicFinish.mp3",
  "assets/audio/LevelMusicFinish_speed.mp3",
  "assets/audio/LevelMusicOver.mp3",
  "assets/audio/LevelMusic_dark.mp3",
  "assets/audio/LevelMusic_speed.mp3",
  "assets/audio/Lever.mp3",
  "assets/audio/LightPusher.mp3",
  "assets/audio/Melt.mp3",
  "assets/audio/MenuMusic.mp3",
  "assets/audio/Platform.mp3",
  "assets/audio/PortalClose.mp3",
  "assets/audio/PortalLoop.mp3",
  "assets/audio/PortalOpen.mp3",
  "assets/audio/PortalTransport.mp3",
  "assets/audio/Pusher.mp3",
  "assets/audio/Slider.mp3",
  "assets/audio/WaterSteps.mp3",
  "assets/audio/Wind.mp3",
  "assets/fonts/fbwg_font_cyrillic.fnt",
  "assets/fonts/fbwg_font_cyrillic.png",
  "assets/fonts/font.fnt",
  "assets/fonts/font.png",
  "assets/images/Beam.png",
  "assets/images/GameNameForest.png",
  "assets/images/TempleHallForest.jpg",
  "assets/images/TOASTER-MINI-new.png",
  "assets/images/branding/branding_logo_kizi.png",
  "assets/images/stores/android.png",
  "assets/images/stores/ios.png",
  "assets/images/stores/microsoft.png",
  "assets/images/stores/steam.png",
  "assets/tilemaps/tilesets/Chars.json",
  "assets/tilemaps/tilesets/Ground.json",
  "assets/tilemaps/tilesets/LargeObjects.json",
  "assets/tilemaps/tilesets/Objects.json",
];

// ---------------------------
// Instalación
// ---------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ---------------------------
// Activación y limpieza de caches antiguos
// ---------------------------
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        // Se elimina la referencia a API_CACHE, solo se conserva el caché principal
        keys.map(key => (key !== CACHE_NAME) ? caches.delete(key) : null)
      )
    ).then(() => self.clients.claim())
  );
});

// ---------------------------
// Fetch
// ---------------------------
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // ---------------------------
  // HTML navegación (modo offline)
  // ---------------------------
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .catch(() => caches.match(request)
          .then(cachedResp => {
            // Si la página específica no está, devuelve 'index.html' como fallback
            return cachedResp || caches.match('index.html'); 
          })
        )
    );
    return;
  }
  
  // ---------------------------
  // Recursos estáticos: cache-first
  // ---------------------------
  event.respondWith(
    caches.match(request).then(cachedResp => {
      // 1. Devuelve desde el caché si existe
      return cachedResp || fetch(request).then(networkResponse => {
        // 2. Si no está en caché, lo busca en la red y lo guarda
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );

});
