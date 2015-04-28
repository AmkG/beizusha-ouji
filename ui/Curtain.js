/* ui/Curtain.js - An object representing the
   curtain used to hide/reveal the screen.  */
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
var Curtain = require('ui/Curtain');

var curtain = new Curtain();
- Create a curtain.

curtain.pixiObj()
- Return the PIXI drawing object of the curtain.

curtain.setWhite()
curtain.setBlack()
- Set the curtain color.
- Default white.

curtain.hide()
- Set alpha to 100%, and abort any fadein/fadeout
  animation.

curtain.show()
- Set alpha to 0%, and abort any fadein/fadeout
  animation.

curtain.setSpeed(1)
- Speed up the fadein/fadeout animation.
- Numbers greater than 1 speed up, numbers smaller
  than 1 slow down.

curtain.fadeIn(function () {
  // ...
});
- Fades in the background (the curtain fades out).
- The given function is called when fully faded in.

curtain.fadeOut(function () {
  // ...
});
- Fades out the background (the curtain fades in).
- The given function is called when fully faded out.

curtain.update()
- Call at each update point to change state.
*/

function nullFun() { }

function Curtain() {
  this._pixi = new PIXI.DisplayObjectContainer();
  this._rect = null;

  // Draw the black and white rectangles.
  function drawRect(color) {
    var rv = new PIXI.Graphics();
    rv.beginFill(color, 1.0);
    rv.lineStyle(0, color, 1.0);
    rv.drawRect(0,0, 1,1);
    rv.endFill();
    rv.scale.x = 640;
    rv.scale.y = 360;
    return rv;
  }
  this._brect = drawRect(0x000000);
  this._wrect = drawRect(0xFFFFFF);

  this._speed = 1.0;

  this._progress = 1.0;
  this._animating = false;
  this._dir = 1.0;
  this._callback = nullFun;
  this.setWhite();
}
Curtain.prototype.pixiObj = function () {
  return this._pixi;
};

/* Private function used by setWhite/setBlack.  */
function setColor(self, nrect) {
  if (self._rect) {
    self._pixi.removeChild(self._rect);
  }
  self._rect = nrect;
  self._pixi.addChild(nrect);
  self._rect.alpha = self._progress;
  return self;
}
Curtain.prototype.setWhite = function () {
  return setColor(this, this._wrect);
};
Curtain.prototype.setBlack = function () {
  return setColor(this, this._brect);
};

Curtain.prototype.hide = function () {
  this._rect.alpha = this._progress = 1.0;
  this._animating = false;
  this._callback = nullFun;
  return this;
};
Curtain.prototype.show = function () {
  this._rect.alpha = this._progress = 0.0;
  this._animating = false;
  this._callback = nullFun;
  return this;
};
Curtain.prototype.setSpeed = function (speed) {
  this._speed = speed;
};
Curtain.prototype.fadeIn = function (kont) {
  this._animating = true;
  this._dir = -1.0;
  this._callback = kont;
  return this;
};
Curtain.prototype.fadeOut = function (kont) {
  this._animating = true;
  this._dir = 1.0;
  this._callback = kont;
  return this;
};
// Determines how fast fadein/fadeout occurs.
var step = 0.05;
Curtain.prototype.update = function () {
  if (this._animating) {
    var step = this._speed * this._dir * step;

    this._progress += step;

    if ((this._dir < 0 && this._progress < 0) ||
        (this._dir > 0 && this._progress > 0)) {
      var cb = this._callback;

      if (this._dir < 0) this._progress = 0.0;
      else               this._progress = 1.0;
      this._rect.alpha = this._progress;

      this._animating = false;
      this._callback = nullFun;

      cb();
    } else {
      this._rect.alpha = this._progress;
    }
  }

  return this;
};

return Curtain;
});
