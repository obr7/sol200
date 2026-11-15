// =====================================================================
//  BOOT
// =====================================================================
window.addEventListener("DOMContentLoaded", () => {
  Game.init();
  Intro.init();
  Intro.showStart();
  // Test hooks (used by the automated play-test; harmless for players)
  window.__sol = { Intro, G, Game, Story, UI, Minigames, Scenes, Sound, SpaceWeather, PROPS, propById, MarsGlobe, MarsTex, PhotoAlbum, MarsWindow };
  if (/[?&]debug/.test(location.search)) Game.debugKeys = true;
});
