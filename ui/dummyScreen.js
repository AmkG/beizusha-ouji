/* ui/dummyScreen.js - Generic dummy screen for stubbing
   purposes.  */
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
define(['pixi'], function(PIXI) {

function Class(text, returnScreen) {
  this._text = new PIXI.Text(text, {
    font: "60px sans-serif",
    wordwrap: true,
    wordwrapwidth: 630
  });
  this._text.scale.x = 0.5;
  this._text.scale.y = 0.5;
  this._text.x = (640 - this._text.width) / 2;
  this._text.y = (360 - this._text.height) / 2;
  this._returnScreen = returnScreen;
}
Class.prototype.assets = [];
Class.prototype.enter = function (api) {
  api.top.removeChildren();
  api.top.addChild(this._text);
  api.stage.setBackgroundColor(0xFFFFFF);
};
Class.prototype.update = function (api) {
  if (api.input.enter || api.input.esc) {
    api.setScreen(this._returnScreen);
  }
};
Class.prototype.leave = function (api) {
  if (this._text.parent) {
    this._text.parent.removeChild(this._text);
  }
};

return { Class: Class };
});
