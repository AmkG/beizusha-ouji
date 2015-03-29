/* spritesheet/Common.js - Common spritesheet code, base
   class for other spritesheet classes.  */
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

/* The base Common class implements all animation and display
   tasks.  However, it requires a complex object to keep track
   of the actual PIXI.Sprite objects.

cfg.north
cfg.south
cfg.east
cfg.west
- Objects for each facing.

cfg.north.walk
cfg.north.spellcast
cfg.north.thrust
cfg.north.slash
cfg.north.shoot
cfg.south.hurt
- Arrays containing the animation.
*/
function Common(cfg) {
  this._cfg = cfg;
  this._cfgFace = cfg.south;
  this._face = "south";

  this._pixiObj = new PIXI.DisplayObjectContainer();
  this._curSprite = this._cfgFace.walk[0];
  this._pixiObj.addChild(this._curSprite);

  this._animate = false;
  this._animation = [];
  this._animateObj = null;
  this._animateStartTime = 0;
  this._animateReverse = false;

  this.speed = 1.0;
}
Common.prototype.pixiObj = function () {
  return this._pixiObj;
};
Common.prototype.face = function (nface) {
  if (!nface) {
    return this._face;
  } else {
    if (this._animate) {
      throw new Error("spritesheet: Cannot change direction while animating.");
    }
    switch (nface) {
    case "north":
    case "south":
    case "east":
    case "west":
      break;
    default:
      throw new Error("spritesheet: Invalid direction: " + nface);
    }
    this._face = nface;
    this._cfgFace = this._cfg[nface];
    this._setSprite(this._cfgFace.walk[0]);
    return this;
  }
};
Common.prototype._setSprite = function (sprite) {
  this._pixiObj.removeChild(this._curSprite);
  this._pixiObj.addChild(sprite);
  this._curSprite = sprite;
  return this;
};
Common.prototype.update = function () {
  if (this._animate) {
    var now = (new Date()).getTime();
    var diff = now - this._animateStartTime;
    var diffV = (this.speed * diff) / 1000;
    var n = Math.floor(this._animation.length * diffV);

    if (diffV >= 1.0) {
      n = this._animation.length - 1;
    }

    if (this._animateReverse) {
      n = this._animation.length - 1 - n;
    }

    this._setSprite(this._animation[n]);
    if (diffV >= 1.0) {
      var obj;
      // Finish animation.
      this._animate = false;
      obj = this._animateObj;
      this._animateObj = null;
      this._animateStartTime = 0;

      if (obj.finish) obj.finish();
    } else {
      if (this._animateObj.progress) {
        this._animateObj.progress(diffV);
      }
    }
  }
  return this;
};
Common.prototype._startAnimation = function (key, obj) {
  var animation;
  if (key === "hurt") {
    animation = this._cfg.south.hurt;
    this._animateReverse = false;
  } else if (key === "reverseHurt") {
    animation = this._cfg.south.hurt;
    this._animateReverse = true;
  } else {
    animation = this._cfgFace[key];
    this._animateReverse = false;
  }
  if (typeof animation === "undefined") {
    throw new Error("spritesheet: Animation '" + key + "' not available.");
  }
  if (typeof obj === "function") {
    obj = {finish: obj};
  }
  this._setSprite(animation[0]);
  this._animate = true;
  this._animation = animation;
  this._animateObj = obj;
  this._animateStartTime = (new Date()).getTime();
  return this;
};
var animations =
  [ 'walk'
  , 'thrust'
  , 'slash'
  , 'spellcast'
  , 'shoot'
  , 'hurt'
  , 'reverseHurt'
  ];
(function () {
var i;
var k;
for (i = 0; i < animations.length; ++i) {
  k = animations[i];
  (function(k) {
    Common.prototype[k] = function (obj) {
      return this._startAnimation(k, obj);
    };
  })(k);
}
})();
Common.prototype._stop = function (s) {
  this._animate = false;
  this._animateObj = null;
  this._setSprite(s);
  return this;
};
Common.prototype.stop = function () {
  return this._stop(this._cfgFace.walk[0]);
};
Common.prototype.stopHurt = function () {
  if (typeof this._cfg.south.hurt === "undefined") {
    throw new Error("spritesheet: No hurt animation, cannot stop at hurt.");
  }
  var hurt = thus._cfg.south.hurt;
  return this._stop(hurt[hurt.length - 1]);
};

return Common;
});
