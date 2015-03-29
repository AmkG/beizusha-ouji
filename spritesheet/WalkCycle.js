/* spritesheet/WalkCycle.js - Handles a spritesheet containing
   only four directional walk cycles, as commonly used in LPC
   spritesheets.  */
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
define(['spritesheet/Common', 'pixi'], function (Common, PIXI) {
"use strict";

var dirs =
  [ 'north'
  , 'south'
  , 'east'
  , 'west'
  ];
var animations =
  [ 'walk'
  ];
var offset = {}; var num = {};
offset.north = 0;
offset.west = 1;
offset.south = 2;
offset.east = 3;
offset.walk = 0;

function makeCfg(txt) {
  var basetxt = txt.baseTexture;
  var sprite = null;
  var rv = {};
  var dobj = null;
  var d;
  var dir;
  var a;
  var anim;
  var n;
  var rect;
  var x;
  var y;
  for (d = 0; d < dirs.length; ++d) {
    dir = dirs[d];
    dobj = rv[dir] = {};
    for (a = 0; a < animations.length; ++a) {
      anim = animations[a];
      y = (offset[anim] + offset[dir]) * 64;
      dobj[anim] = [];
      for (n = 0; n < num[anim]; ++n) {
        x = n * 64;
        rect = new PIXI.Rectangle(x, y, 64, 64);
        txt = new PIXI.Texture(basetxt, rect);
        sprite = new PIXI.Sprite(txt);
        dobj[anim].push(sprite);
      }
    }
  }
  return rv;
}

function WalkCycle(name) {
  this._ss_fs_name = name;
  var txt = PIXI.Texture.fromImage(name);
  Common.call(this, makeCfg(txt));
}
WalkCycle.prototype = Object.create(Common.prototype);
WalkCycle.prototype.constructor = WalkCycle;
WalkCycle.prototype.clone = function () {
  return new WalkCycle(this._ss_fs_name);
};

return WalkCycle;
});
