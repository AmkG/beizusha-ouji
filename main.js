/* main.js - main source.  */
/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2015  Alan Manuel K. Gloria
 *
 *
 * The JavaScript code in this page is free software: you can
 * redistribute it and/or modify it under the terms of the GNU
 * General Public License (GNU GPL) as published by the Free Software
 * Foundation, either version 3 of the License, or (at your option)
 * any later version.  The code is distributed WITHOUT ANY WARRANTY;
 * without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.
 *
 * As additional permission under GNU GPL version 3 section 7, you
 * may distribute non-source (e.g., minimized or compacted) forms of
 * that code without the copy of the GNU GPL normally required by
 * section 4, provided you include this license notice and a URL
 * through which recipients can access the Corresponding Source.
 *
 * @licend  The above is the entire license notice
 * for the JavaScript code in this page.
 *
 */
define(["engine", "screen/loading"], function(engine, screenLoading) {

function main() {
  // ignore mouse events.
  function ignoreMouseEvent(e) {
    e = e || window.event;
    e.preventDefault();
    e.stopPropagation();
  }
  window.addEventListener('mousedown', ignoreMouseEvent, true);

  /* Initialize engine.  */
  engine.initialize("Prince of the Rationality");

  engine.loadingScreen(screenLoading);

  engine.preload([]);

  engine.initialState({});
  engine.initialScreen("screen/mainMenu");

  /* Enter engine loop.  */
  engine.loop();
}

function initialize() {
  var called = false;

  function nullFun() {}
  function onDOMContentLoaded() {
    if (!called) {
      called = true;
      document.removeEventListener("DOMContentLoaded", onDOMContentLoaded, false);
      window.removeEventListener("load", onDOMContentLoaded, false);
      document.onreadystatechange = nullFun;
      main();
    }
  }
  function onreadystatechange() {
    if (document.readyState === 'complete') {
      onDOMContentLoaded();
    }
  }

  if (document.readyState === 'complete') {
    main(PIXI, requestAnimFrame, document, window);
  } else {
        document.addEventListener('DOMContentLoaded', onDOMContentLoaded, false);
        window.addEventListener('load', onDOMContentLoaded, false);
        document.onreadystatechange = onreadystatechange;
  }
}

return initialize;
});
