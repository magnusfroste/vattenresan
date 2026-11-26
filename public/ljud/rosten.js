/* Röst från Shipholm: färdiga MP3-filer i /ljud, med webbläsarens röst som reserv.
 *
 * ljud/lines.js fyller window.__ROST = { "exakt mening": "filnamn" }.
 * speak()-funktionen i appen frågar först __rost(text) och hoppar över
 * webbläsarens talsyntes när filen finns.
 *
 *   window.__rost(text)      -> true om en fil spelades
 *   window.__rost(text, true) -> samma, men stoppar det som spelas först
 *   window.__rostStopp()      -> stoppar pågående fil
 *   window.__rostFinns(text)  -> true om texten har en fil
 */
(function () {
  var ROST = (window.__ROST = window.__ROST || {});
  var inne = null, senast = 0;

  function stopp() {
    if (inne) {
      try { inne.pause(); } catch (e) {}
      try { inne.currentTime = 0; } catch (e) {}
      inne = null;
    }
  }
  window.__rostStopp = stopp;
  window.__rostFinns = function (text) { return !!(text && ROST[text.trim()]); };

  window.__rost = function (text, nu) {
    if (!text) return false;
    var id = ROST[String(text).trim()];
    if (!id) return false;
    stopp(); /* en röst i taget – annars pratar två filer i munnen på varandra */
    try {
      var a = new Audio('ljud/' + id + '.mp3');
      a.preload = 'auto';
      inne = a;
      senast = Date.now();
      var p = a.play();
      if (p && p.catch) p.catch(function () { /* tyst: ljud kräver ett tryck först */ });
      return true;
    } catch (e) {
      return false;
    }
  };

  /* Ett tryck på sidan låser upp ljudet i iOS/Safari: spela en tyst fil en gång. */
  function ljudStart() {
    try {
      var a = new Audio('ljud/' + (window.__ROST_TYST || Object.keys(ROST)[0] && ROST[Object.keys(ROST)[0]] || '') + '.mp3');
      a.volume = 0;
      var p = a.play();
      if (p && p.catch) p.catch(function () {});
      setTimeout(function () { try { a.pause(); } catch (e) {} }, 60);
    } catch (e) {}
    window.removeEventListener('pointerdown', ljudStart);
  }
  window.addEventListener('pointerdown', ljudStart, { once: true });
})();