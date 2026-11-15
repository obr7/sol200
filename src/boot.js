// =====================================================================
//  BOOT
// =====================================================================
window.addEventListener("DOMContentLoaded", () => {
  Game.init();
  Intro.init();
  Intro.showStart();
  Dev.init();
  // Test hooks (used by the automated play-test; harmless for players)
  window.__sol = { Intro, G, Game, Story, UI, Minigames, Scenes, Sound, SpaceWeather, PROPS, propById, MarsGlobe, MarsTex, PhotoAlbum, MarsWindow, SuitCards, Dev };
  if (/[?&]debug/.test(location.search)) Game.debugKeys = true;
});
