/* ui/CombatScreen/LifeMeter.js - life meter for characters to
   use in-combat.  */
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
var lm = new LifeMeter();
- Create a lifemeter view.

lm.pixiObj();
- Return the PIXI Drawing Object of the life meter.

lm.setLife(100);
- Set life.  0.0 is dead, 100.0 is max life.

lm.animateSetLife(100, function () {
  // ...
});
- Animate the life bar going to the target life.
- Call the given continuation function after the
  animation finishes.

lm.update();
- Call at each update point to update animation.
*/

var bakColor = 0xFF8080;
var lifeColor = 0xA0FFA0;

var meterWidth = 64;
var meterHeight = 8;

var animateSpeed = 1.0;

function nullFun() {}

function LifeMeter() {
  this._pixi = new PIXI.DrawingObjectContainer();

  this._bak = new PIXI.Graphics();
  this._bak.beginFill(bakColor, 1.0);
  this._bak.lineStyle(0, bakColor, 1.0);
  this._bak.drawRect(0,0, 1,1);
  this._bak.endFill();
  this._bak.width = meterWidth;
  this._bak.height = meterHeight;
  this._pixi.addChild(this._bak);

  this._lbar = new PIXI.Graphics();
  this._lbar.beginFill(lifeColor, 1.0);
  this._lbar.lineStyle(0, lifeColor, 1.0);
  this._lbar.drawRect(0,0, 1,1);
  this._lbar.endFill();
  this._lbar.width = meterWidth;
  this._lbar.height = meterHeight;
  this._pixi.addChild(this._lbar);

  this._life = 100.0;
  this._targetLife = 100.0;
  this._dir = 0.0;
  this._callback = nullFun;
}

LifeMeter.prototype.pixiObj = function () {
  return this._pixi;
};

function updateBar(self) {
  self._lbar.width = self._life * meterWidth / 100.0;
}

LifeMeter.prototype.setLife = function (v) {
  this._life = v;
  this._targetLife = v;
  this._dir = 0.0;
  this._callback = nullFun;
  updateBar(this);
  return this;
};
LifeMeter.prototype.animateSetLife = function (v, k) {
  this._callback = k;
  this._targetLife = v;
  if (this._life < v) {
    this._dir = 1.0;
  } else {
    this._dir = -1.0;
  }
  return this;
};
LifeMeter.prototype.update = function () {
  if (this._dir == 0.0) return this;
  this._life += this._dir * animateSpeed;
  if (this._life * this._dir >= this._life * this._dir) {
    // Limit reached.
    var toCall = this._callback;
    this._life = this._targetLife;
    this._dir = 0.0;
    this._callback = nullFun;
    toCall();
  }
  updateBar(this);
  return this;
};

return LifeMeter;
});
