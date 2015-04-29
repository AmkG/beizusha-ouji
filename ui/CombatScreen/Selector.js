/* ui/CombatScreen/Selector.js - Selector for
   character views.  */
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
define(['pixi'], function (PIXI) {
"use strict";
/*
var sel = new Selector();
- Create a new selector.

sel.pixiObj();
- Return the PIXI display object.

sel.show();
sel.hide();
- Hide or show the selector.
- Default hidden.

sel.blink(function () {
  // ...
});
- Blink the selector, then hide it and call the
  given function.

sel.update();
- Update the blink system.
*/

/* Dimensions of the selector.  */
var width = 64;
var height = 360;

/* Color of the selector.  */
var color = 0x80C080;
var alpha = 0.5;

var blinkingStep = 0.105;

function nullFun() {}

function Selector() {
  this._pixi = new PIXI.Graphics();
  this._pixi.beginFill(color, alpha);
  this._pixi.lineStyle(0, color, alpha);
  this._pixi.drawRect(0,0, 1,1);
  this._pixi.endFill();
  this._pixi.width = width;
  this._pixi.height = height;
  this._pixi.visible = false;

  this._animating = false;
  this._progress = 0.0;
  this._cb = nullFun;
}
Selector.prototype.pixiObj = function () {
  return this._pixi;
};
Selector.prototype.hide = function () {
  this._pixi.visible = false;
  this._animating = false;
  this._progress = 0.0;
  this._cb = nullFun;
  return this;
};
Selector.prototype.show = function () {
  this._pixi.visible = true;
  this._animating = false;
  this._progress = 0.0;
  this._cb = nullFun;
  return this;
};
Selector.prototype.blink = function (k) {
  this._pixi.visible = false;
  this._animating = true;
  this._progress = 0.0;
  this._cb = k;
  return this;
};
Selector.prototype.update = function () {
  if (!this._animating) return this;

  this._progress += blinkingStep;
  if (this._progress < 0.16 ||
      (0.33 < this._progress && this._progress < 0.5) ||
      (0.66 < this._progress && this._progress < 0.83)) {
    this._pixi.visible = false;
  } else {
    this._pixi.visible = true;
  }

  if (this._progress >= 1.0) {
    var cb = this._cb;
    this.hide();
    cb();
  }

  return this;
};

return Selector;
});
