/* ui/CombatScreen/GetReady.js - a dynamic "get ready"
   message.  */
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
var gr = new GetReady();
- Create a new "get ready" message that dynamically
  swoops in.
- The get-ready is initially hidden.

gr.pixiObj()
- Access the PIXI object of the get-ready.

gr.show(function () {
  // ...
});
- Dynamically show the get-ready message.

gr.hide(function () {
  // ...
});
- Dynamically hide the get-ready message.

gr.update()
- Call at each update point.
*/

function nullFun() { }

var speed = 0.09;

function GetReady() {
  this._pixi = new PIXI.DisplayObjectContainer();
  this._top = new PIXI.DisplayObjectContainer();
  this._pixi.addChild(this._top);
  this._txt = new PIXI.Text("GET READY!",
  { font: 'italic 112px sans-serif'
  });
  this._txt.scale.x = 0.25;
  this._txt.scale.y = 0.25;
  this._top.addChild(this._txt);

  this._animating = 'none';
  this._progress = 0.0;
  this._callback = nullFun;

  this._top.visible = false;
}

GetReady.prototype.pixiObj = function () {
  return this._pixi;
};

GetReady.prototype.show = function (k) {
  if (this._animating !== 'none') {
    throw new Error('GetReady: show: ' +
                    "Animation already running.");
  }
  this._animating = 'show';
  this._progress = 0.0;
  this._callback = k;
  return this;
};
GetReady.prototype.hide = function (k) {
  if (this._animating !== 'none') {
    throw new Error('GetReady: hide: ' +
                    "Animation already running.");
  }
  this._animating = 'hide';
  this._progress = 0.0;
  this._callback = k;
  return this;
};

GetReady.prototype.update = function () {
  var toCall = nullFun;
  if (this._animating === 'none') {
    /* Do nothing.  */
  } else if (this._animating === 'show') {
    this._progress += speed;
    if (this._progress >= 1.0) {
      this._progress = 1.0;
      toCall = this._callback;
      this._callback = nullFun;
      this._animating = 'none';
    }
    var scale = 5 - 4 * this._progress;
    this._top.visible = true;
    this._top.scale.x = scale;
    this._top.scale.y = scale;
    this._top.alpha = this._progress;
    this._top.x = (640 - this._top.width) / 2;
    this._top.y = (360 - this._top.height) / 2;
    toCall();
  } else if (this._animating === 'hide') {
    this._progress += speed;
    if (this._progress >= 1.0) {
      this._progress = 1.0;
      toCall = this._callback;
      this._callback = nullFun;
      this._animating = 'none';
      this._top.visible = false;
    }
    this._top.alpha = 1 - this._progress;
  }
  return this;
};

return GetReady;
});
