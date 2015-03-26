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

var progressStep = 0.025;
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

function setByProgress() {
  blurFilter.blurX = progress * maxBlurX;
  blurFilter.blurY = progress * maxBlurY;
  title.alpha = 1.0 - (progress / 3);
  engTitle.alpha = progress;
  engTitle.position.x = 640 - engTitle.width - (32 * Math.sqrt(progress));
}

var actualMenu = new genericMenu.Class({
  items: ["Tutorial", "Play Game", "Credits"]
});

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
  setByProgress();

  api.stage.setBackgroundColor(0xFFFFFF);

  actualMenu.enter(api);
};
mainMenu.update = function(api) {
  var sel;
  if (progress < 1.0) {
    progress += progressStep;
    if (progress >= 1.0) {
      progress = 1.0;
    }
    setByProgress();
  }
  sel = actualMenu.update(api);
};
mainMenu.leave = function(api) {
  actualMenu.leave(api);
};

return mainMenu;
});

