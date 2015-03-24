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

define(["util/Table", "util/OfflineStorage", "pixi"],
function(Table      , OfflineStorage       ,  PIXI) {

/*
engine.initialize("game name");
- Initialize the game engine.

engine.setVirtualResolution(640, 360);
- Set the virtual resolution of the game engine.

engine.loadingScreen(function (api) {
  // ...
});
- Define the loading screen.
- The loading screen is displayed whenever a screen and its
  assets are being loaded.
- API: TBD.

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

function defaultLoadingScreen(api) {
}

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
  this._screen = "";
  this._state = {};
  this._toLoad = [];

  /* API objects.  */
  this._api = null; /* Limited API.  */
  this._apiUpdate = null; /* API for update.  */

  /* The virtual width and height.  */
  this._vw = 640;
  this._vh = 360;

  /* Engine state.  */
  this._engineState = "uninitialized";
  /* True if the current screen has been entered.  */
  this._initializedScreen = false;

  this._screenTable = new Table();

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
Engine.prototype.loadingScreen = function (f) {
  this._loadingScreen = f;
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
  /* Saves the state of the game engine to offline storage.  */

  function core() {
    self._offlineStore.access(function (storage) {
      storage.setItem("screen", self._screen);
      storage.setItem("state", JSON.stringify(self._state));
    }).then(function (result) {
      setTimeout(core, 3400);
    });
  }
  setImmediate(core);
}
function enterScreen(self) {
  /* Launches the screen enter function.  */
  var screenDef = self._screenTable.get(self._screen);
  if (screenDef.enter) {
    screenDef.enter(self._api);
  }
  self._initializedScreen = true;
  self._state = "running";
  self._offlineStore.access(function (storage) {
    storage.setItem("screen", self._screen);
    storage.setItem("state", JSON.stringify(self._state));
  });
}
function launchScreenLoading(self) {
  function core() {
    if (self._toLoad.length > 0) {
      var screen = self._toLoad.shift();
      require([screen], function (screenDef) {
        self._screenTable.set(screen, screenDef);
        if (screenDef.assets) {
          var loader = new PIXI.AssetLoader(screenDef.assets);
          loader.onComplete = core;
          loader.load();
        } else {
          setImmediate(core);
        }
      });
    } else {
      enterScreen(self);
    }
  }
  self._state = "loading";
  setImmediate(core);
}
function setScreen(self, screen) {
  if (self._initializedScreen) {
    var screenDef = self._screenTable.get(self._screen);
    if (screenDef.leave) {
      screenDef.leave(self._api);
    }
    self._initializedScreen = false;
  }
  self._screen = screen;
  if (self._screenTable.has(screen)) {
    enterScreen(self);
  } else {
    self._toLoad.push(screen);
    launchScreenLoading(self);
  }
}
/* Actual loop implementation.  */
Engine.prototype.loop = function() {
  var self          = this;

  if (this._engineState !== "initialized") {
    alert("error: engine: cannot start loop now.");
    throw new Error("engine: cannot start loop now.");
  }

  this._engineState = "loading";

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
    }
  };

  /* Game loop.  */
  function onUpdate() {
    if (self._engineState === "loading") {
      self._loadingScreen(self._api);
    } else if (self._engineState === "running") {
      var screenDef = self._screenTable.get(self._screen);
      if (screenDef.update) {
        screenDef.update(self._apiUpdate);
      }
    }
    requestAnimFrame(render);
  }
  function render() {
    self._renderer.render(self._stage);
  }
  setInterval(onUpdate, 40);

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
    setScreen(self, result.screen);

    // Launch the game state saving "thread".
    launchStateSaving(self);
  });

  return this;
};

return new Engine();
});
