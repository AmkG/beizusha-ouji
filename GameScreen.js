/* GameScreen.js - adapter from in-game screens (which
   handle game state) to global engine.js screens.  */
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

/*
modules which provide game screens should not return the game
screen directly, but instead return the GameScreen:

define(['GameScreen'], function (GameScreen) {
var screen = {};
screen.assets = // ...
screen.enter = // ...
screen.update = // ...

return new GameScreen('gamescreen/myName', screen);
});

Game screens are provided one additional slot in the api
argument, .gameState.  This .gameState slot contains the
currently-running game's state.

*/

function wrapAPI(api) {
  var rv = Object.create(api);
  if (typeof api.state.gameNum !== "number") {
    api.state.gameNum = 0;
  }
  if (!api.state.game) {
    api.state.game = [];
  }
  while (api.state.game.length <= api.state.gameNum) {
    api.state.game.push({});
  }
  rv.gameState = api.state.game[api.state.gameNum];
  return rv;
}

function GameScreen(name, screen) {
  var self = this || {};
  if (screen.assets) self.assets = screen.assets;
  if (screen.enter) {
    self.enter = function (api) {
      var gameAPI = wrapAPI(api);
      gameAPI.lastScreen = name;
      screen.enter(gameAPI);
      return self;
    };
  } else {
    self.enter = function(api) {
      var gameAPI = wrapAPI(api);
      gameAPI.lastScreen = name;
      return self;
    };
  }
  if (screen.update) {
    self.update = function (api) {
      screen.update(wrapAPI(api));
      return self;
    };
  }
  if (screen.leave) {
    self.leave = function (api) {
      screen.leave(wrapAPI(api));
      return self;
    };
  }

  return self;
}

return GameScreen;
});
