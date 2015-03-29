/* engine.js - Game engine main module.  */
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

define(["util/Table", "util/OfflineStorage", "pixi", "engine/input"],
function(Table      , OfflineStorage       ,  PIXI , input) {

/*
engine.initialize("game name");
- Initialize the game engine.

engine.setVirtualResolution(640, 360);
- Set the virtual resolution of the game engine.

engine.loadingScreen({
  enter: function (api) {...},
  update: function (api) {...},
  leave: function (api) {...}
});
- Define the loading screen.
- The loading screen is displayed whenever a screen and its
  assets are being loaded.
- API: See the "screen" API below.

engine.preload(["screen", "screen2"]);
- Add the listed screens to the initial loading.

engine.initialScreen("screen");
- Define the first screen to display, when the game is first
  started.

engine.initialState({});
- Define the state at the initial screen.
- The engine retains the current state and current screen;
  when the game is loaded, the state is taken from the
  browser's local storage.

engine.loop();
- Starts the engine's main loop.
*/

/*
Screen API.

Screens are Javascript objects.  In the game engine, screens are
selected by name; that name should be loadable by RequireJS.

Screens may optionally provide the following slots:

screen.assets = ['img/whatever.png'];
- The .assets slot, if present, should be an array of strings.
  The strings are names (paths to) assets, loadable by
  PIXI.AssetsLoader.
- The loading screen's .assets slot is *IGNORED*.  That's because
  the loading screen is displayed while assets are being loaded,
  but screens cannot be displayed until their assets are loaded,
  so if the loading screen has assets itself, then we're in a
  chicken-and-egg situation.  To avoid this, the loading screen's
  .assets are ignored.  You should load the loading screen's
  assets yourself before starting the game engine.

screen.enter(api);
- The .enter() method is called when the screen is entered.
- The API is the "enter/leave" API below.

screen.update(api);
- The .update() method is called every 0.04 seconds (25 per
  second).
- The API is the "update" API below.

screen.leave(api);
- The .leave() method is called when the screen has indicated
  that a new screen will be loaded.
- Te API is the "enter/leave" API below.


Enter/Leave API.

The "enter/leave" API contains the following slots:

api.stage
- The PIXI.Stage object to be used during rendering.

api.top
- The actual top display object container to be used.
- The engine scales this display object container to fit the
  available window space.  Items within this api.top container
  can use a 640x360 screen coordinates (or whatever resolution
  was given in engine.setVirtualResolution()).

api.state
- The game state that gets saved on-disk.
- The game engine tracks this object as well as the current
  screen, and saves the state periodically.  If the game is
  exited, the engine resumes the game at the current screen
  and with the state recovered.
- The game state must be serializable: no functions, just
  plain data.  Basically: if it can be serialized by
  JSON.stringify and recovered by JSON.parse, it will be
  saved safely.


Update API.

The "update" API contains the "enter/leave" API slots, and also
adds the following slots:

api.setScreen('screenName');
- Indicate a transition to a new screen to the engine.
- The current screen's .leave() is called very soon after.
- The target screen and its assets are loaded if necessary,
  then the target screen's .enter() is called and the current
  screen becomes the target screen.
  

api.saveState();
- Indicate to the engine that the state should be saved.
- The engine will save the state every few seconds, but
  you might want to save "important" state transitions.

api.input
- An object containing the current input state.
- The engine only has four direction buttons and 2 action
  buttons (enter and escape).

api.input.x
api.input.y
- Numeric -1, 0, 1 values indicating the current direction
  being pressed by the player.
- x is -1 for left, 1 for right, 0 for neutral.
- y is -1 for up, 1 for down, 0 for neutral.

api.input.left
api.input.right
api.input.up
api.input.down
api.input.enter
api.input.esc
- Boolean flags indicating if the user tapped the
  corresponding button.
- The flags indicate only the initial keypress (i.e. from
  "unpressed" to "pressed" state).  If the button is pressed
  continuously, these flags remain false.

api.input.leftState
api.input.rightState
api.input.upState
api.input.downState
api.input.enterState
api.input.escState
- Boolean flags indicating if the user currently has the
  corresponding key pressed down.

*/

var defaultLoadingScreen = {};

function computeCanvasSize(vw, vh) {
  var w = window.innerWidth ||
          document.documentElement.clientWidth;
  var h = window.innerHeight ||
          document.documentElement.clientHeight;

  var wfactor = w / vw;
  var hfactor = h / vh;

  var factor = 0.0;
  var aw = 0.0;
  var ah = 0.0;
  var ox = 0.0;
  var oy = 0.0;

  if (wfactor < hfactor) {
    factor = wfactor;
    aw = w;
    ah = (vh * w) / vw;
    oy = (h - ah) / 2;
  } else {
    factor = hfactor;
    aw = (vw * h) / vh;
    ah = h;
    ox = (w - aw) / 2;
  }

  return { scale: factor
         , w: aw
         , h: ah
         , ox: ox
         , oy: oy
         };
}

/* Main Engine class.  */
function Engine() {
  this._name = "";

  this._loadingScreen = defaultLoadingScreen;

  /* Screen state.  */
  this._toLoad = [];
  this._screen = "";
  this._state = {};
  this._screenTable = new Table();
  /* Used when updating the screen.  */
  this._screenChanged = false;
  this._targetScreen = "";
  /* Used when indicating that the state should get
     saved.  */
  this._saveNow = false;

  /* API objects.  */
  this._api = null; /* Limited API.  */
  this._apiUpdate = null; /* API for update.  */

  /* The virtual width and height.  */
  this._vw = 640;
  this._vh = 360;

  /* Engine state.  */
  this._engineState = "uninitialized";

  /* PIXI objects.  */
  this._renderer    = null; // The renderer.
  this._stage       = null; // The viewgraph root.
  this._top         = null; // The scaled root.

  /* Offline storage.  */
  this._offlineStore = null;
}
Engine.prototype.initialize = function (name) {
  if (this._engineState !== "uninitialized") {
    alert("error: engine: multiple initialize.");
    throw new Error("engine: multiple initialize.");
  }

  this._name = name;
  document.title = name;

  this._engineState = "initialized";

  return this;
};
Engine.prototype.setVirtualResolution = function (vw, vh) {
  if (this._engineState !== "initialized") {
    alert("error: engine: cannot set virtual resolution now.");
    throw new Error("engine: cannot set virtual resolution now.");
  }
  this._vw = vw;
  this._vh = vh;

  return this;
};
Engine.prototype.loadingScreen = function (o) {
  this._loadingScreen = o;
  return this;
};
Engine.prototype.preload = function(array) {
  if (this._engineState !== "initialized") {
    alert("error: engine: cannot preload now.");
    throw new Error("engine: cannot preload now.");
  }
  this._toLoad = this._toLoad.concat(array);
  return this;
};
Engine.prototype.initialScreen = function(screen) {
  if (this._engineState !== "initialized") {
    alert("error: engine: cannot set initial screen now.");
    throw new Error("engine: cannot set initial screen now.");
  }
  this._screen = screen;
  return this;
};
Engine.prototype.initialState = function(state) {
  if (this._engineState !== "initialized") {
    alert("error: engine: cannot set initial state now.");
    throw new Error("engine: cannot set initial state now.");
  }
  this._state = state;
  return this;
};
/* Private functions used by Engine.prototype.loop.  */
function launchStateSaving(self) {
  /* Saves the state of the game engine to offline storage
     every few seconds.  */

  function core() {
    self._offlineStore.access(function (storage) {
      storage.setItem("screen", self._screen);
      storage.setItem("state", JSON.stringify(self._state));
    }).then(function (result) {
      setTimeout(core, 5000);
    });
  }
  setImmediate(core);
}
function saveState(self) {
  /* Saves the state of the game engine.  */
  self._offlineStore.access(function (storage) {
    storage.setItem("screen", self._screen);
    storage.setItem("state", JSON.stringify(self._state));
  });
}
function loadStep(self) {
  /* Performs a step in loading.  */
  if (self._toLoad.length != 0) {
    var screen = self._toLoad.shift();
    require([screen], function (screenDef) {
      if (screenDef.assets && screenDef.assets.length) {
        var loader = new PIXI.AssetLoader(screenDef.assets);
        loader.onComplete = function () {
          self._screenTable.set(screen, screenDef);
        };
        loader.load();
      } else {
        self._screenTable.set(screen, screenDef);
      }
    });
  }
}
function setScreen(self, screen) {
  /* Changes the screen.  */

  self._screenChanged = true;
  self._targetScreen = screen;
}
/* Actual loop implementation.  */
Engine.prototype.loop = function() {
  var self          = this;

  if (this._engineState !== "initialized") {
    alert("error: engine: cannot start loop now.");
    throw new Error("engine: cannot start loop now.");
  }

  /* Initialize the canvas to display.  */
  var canvasSize = computeCanvasSize(this._vw, this._vh);
  this._renderer = PIXI.autoDetectRecommendedRenderer(
    canvasSize.w, canvasSize.h
  );

  var canvas = this._renderer.view;
  document.body.appendChild(canvas);
  canvas.style.display  = "block";
  canvas.style.position = "absolute";

  document.body.style.backgroundColor = 'gray';

  this._stage = new PIXI.Stage(0x000000);
  this._top = new PIXI.DisplayObjectContainer();
  this._stage.addChild(this._top);

  /* Initialize the resize handler.  */
  function resize() {
    var canvasSize = computeCanvasSize(self._vw, self._vh);
    var w = Math.floor(canvasSize.w);
    var h = Math.floor(canvasSize.h);
    canvas.style.left   = Math.floor(canvasSize.ox) + "px";
    canvas.style.top    = Math.floor(canvasSize.oy) + "px";
    self._top.scale.x   = canvasSize.scale;
    self._top.scale.y   = canvasSize.scale;
    self._renderer.resize(w, h);
  }
  window.addEventListener('resize', resize, false);
  resize();

  /* Initialize the input.  */
  input.initialize();

  /* Setup API.  */
  this._api = {
    stage: this._stage,
    top: this._top,
    state: this._state
  };
  this._apiUpdate = {
    stage: this._stage,
    top: this._top,
    state: this._state,
    setScreen: function (screen) {
      setScreen(self, screen);
      return this;
    },
    saveState: function () {
      self._saveNow = true;
      return this;
    },
    input: input
  };

  /* Game loop.  */
  function onUpdate() {
    var flag = true;

    input.update();

    while (flag) {
      if (self._engineState === "loading") {
        if (self._toLoad.length == 0 &&
            self._screenTable.has(self._screen)) {

          if (self._loadingScreen.leave) {
            self._loadingScreen.leave(self._api);
          }

          self._engineState = "running";
          var screenDef = self._screenTable.get(self._screen);
          if (screenDef.enter) {
            screenDef.enter(self._api);
          }
        } else {
          loadStep(self);
          if (self._loadingScreen.update) {
            self._loadingScreen.update(self._apiUpdate);
          }
          flag = false;
        }
      } else if (self._engineState === "running") {
        var screenDef = self._screenTable.get(self._screen);
        if (screenDef.update) {
          screenDef.update(self._apiUpdate);
        }
        if (self._screenChanged) {
          if (screenDef.leave) {
            screenDef.leave(self._api);
          }
          self._screenChanged = false;
          self._screen = self._targetScreen;

          // Indicate the need to save.
          self._saveNow = true;

          if (self._screenTable.has(self._targetScreen)) {
            /* No need to enter loading state.  */
            screenDef = self._screenTable.get(self._targetScreen);
            if (screenDef.enter) {
              screenDef.enter(self._api);
            }
          } else {
            /* Enter loading state.  */
            self._toLoad.push(self._screen);
            self._engineState = "loading";
            if (self._loadingScreen.enter) {
              self._loadingScreen.enter(self._api);
            }
          }
        } else {
          flag = false;
        }
      }
    }
    if (self._saveNow) {
      self._saveNow = false;
      saveState(self);
    }
    requestAnimFrame(render);
  }
  function render() {
    self._renderer.render(self._stage);
  }

  /* Recover game state from offline storage.  */
  this._offlineStore = new OfflineStorage(this._name);
  this._offlineStore.access(function (storage) {
    var screen = storage.getItem("screen") || self._screen;
    var state = storage.getItem("state");
    if (state) {
      state = JSON.parse(state);
    } else {
      state = self._state;
    }
    return {screen: screen, state: state};
  }).then(function (result) {
    self._state = result.state;
    self._screen = result.screen;
    self._toLoad.push(self._screen);

    self._api.state = self._state;
    self._apiUpdate.state = self._state;

    // Launch the game state saving "thread".
    launchStateSaving(self);
    // Launch the loading screen.
    if (self._loadingScreen.enter) {
      self._loadingScreen.enter(self._api);
    }
    self._engineState = "loading"; 
    // Launch the loop.
    setInterval(onUpdate, 40);
  });

  return this;
};

return new Engine();
});
