/* gamescreen/enterGameMode.js - Enters game mode.  */
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
define([], function () {
"use strict";

var mode = 'game';

var screen = {};
screen.update = function (api) {
  if (api.state.game) {
    if (api.state.game[api.state.gameNum]) {
      if (typeof api.state.game[api.state.gameNum].lastScreen == 'string') {
        api.setScreen(api.state.game[api.state.gameNum].lastScreen);
        return;
      }
    }
  }
  if (mode === 'game') {
    api.setScreen('gamescreen/initGame');
  } else if (mode === 'tutorial') {
    api.setScreen('gamescreen/initTutorial');
  } else {
    throw new Error('gamescreen/enterGameMode: Unknown mode: ' + mode);
  }
};
screen.setMode = function (nmode) {
  mode = nmode;
  return this;
};

return screen;
});
