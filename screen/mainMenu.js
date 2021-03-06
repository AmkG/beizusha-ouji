/* screen/mainMenu.js - main menu screen.  */
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
define(['pixi', 'ui/genericMenu'], function(PIXI, genericMenu) {
"use strict";

var fadeinStep = 0.025;
var fadeoutStep = 0.09;
var maxBlurX = 2.0;
var maxBlurY = 15.0;

var title = null;
var blurFilter = new PIXI.BlurFilter();

var engTitle = new PIXI.Text("Prince of the Rationality", {
  font: "italic 112px sans-serif"
});
engTitle.scale.x = 0.25;
engTitle.scale.y = 0.25;
engTitle.position.y = 20;
engTitle.position.x = 640 - engTitle.width - 10;

var progress = 0.0;

function fadeinProgress() {
  blurFilter.blurX = progress * maxBlurX;
  blurFilter.blurY = progress * maxBlurY;
  title.alpha = 1.0 - (progress / 3);
  engTitle.alpha = progress;
  engTitle.position.x = 640 - engTitle.width - (32 * Math.sqrt(progress));
}
function fadeoutProgress() {
  blurFilter.blurX = progress * maxBlurX;
  blurFilter.blurY = progress * maxBlurY;
  title.alpha = (progress * 2 / 3);
  engTitle.alpha = progress;
  engTitle.position.x = 640 - engTitle.width - (32 * Math.sqrt(progress));
}

var exiting = false;

var menu =
  [ { item: "Tutorial"
    , action: function (api) { api.setScreen('screen/tutorial'); }
    }
  , { item: "Play Game"
    , action: function (api) { api.setScreen('screen/playGame'); }
    }
  , { item: "Credits"
    , action: function (api) { api.setScreen('screen/credits'); }
    }
  , { item: "Test Sprites"
    , action: function (api) { api.setScreen('testSprites'); }
    }
  , { item: "Test Combat"
    , action: function (api) { api.setScreen('testCombat'); }
    }
  ];
var menuEsc = -1;
/* If process and process.exit exist, add an 'exit' entry.
   This is primarily for node-webkit. */
if (typeof process !== "undefined" &&
    typeof process.exit === "function") {
  menuEsc = menu.length;
  menu.push(
    { item: "Exit Game"
    , action: function (api) {
        exiting = true;
        setTimeout(function () {
          process.exit();
        }, 500);
      }
    }
  );
}
var menuItems = [];
var menuActions = [];
(function () {
var i;
for (i = 0; i < menu.length; ++i) {
  menuItems.push(menu[i].item);
  menuActions.push(menu[i].action);
}
})();

var actualMenu = new genericMenu.Class({
  items: menuItems,
  minWidth: 100,
  esc: menuEsc
});

var state = "fadein";

var mainMenu = {};
mainMenu.assets = [
  "img/title.png"
];
mainMenu.enter = function(api) {
  api.top.removeChildren();
  if (!title) {
    title = PIXI.Sprite.fromImage("img/title.png");
    title.scale.x = 0.5;
    title.scale.y = 0.5;
    title.position.x = 20;
    title.position.y = (360 - title.height) / 2;
    title.filters = [blurFilter];
  }
  api.top.addChild(title);
  api.top.addChild(engTitle);

  progress = 0.0;
  fadeinProgress();
  state = "fadein";
  exiting = false;

  api.stage.setBackgroundColor(0xFFFFFF);

};
var sel;
mainMenu.update = function(api) {
  if (state === "fadein") {
    progress += fadeinStep;
    if (progress >= 1.0) {
      progress = 1.0;
      state = "menuEnter";
    }
    fadeinProgress();
  } else if (state === "menuEnter") {
    actualMenu.enter(api);
    state = "select";
  } else if (state === "select") {
    sel = actualMenu.update(api);
    if (sel >= 0) {
      state = "fadeout";
      actualMenu.leave(api);
    }
  } else if (state === "fadeout") {
    progress -= fadeoutStep;
    if (progress <= 0.0) {
      progress = 0.0;
      state = "end";
    }
    fadeoutProgress();
  } else {
    if (!exiting)  {
      menuActions[sel](api);
    }
  }
};
mainMenu.leave = function(api) {
  api.top.removeChildren();
};

return mainMenu;
});

