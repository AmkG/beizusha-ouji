/* spritesheet.js - various classes that transform our LPC
   spritesheets into usable objects.  Each class generally
   has a consistent common interface.  */
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
define(function(require) {
"use strict";
var exports = {};

/* Each spritesheet object has a consistent interface.
var ss = new spritesheet.FullSheet("img/spritesheet.png");
ss = new spritesheet.WalkCycle("img/walkcycleonly.png");
- Construct a spritesheet.

stage.addChild( ss.pixiObj() );
- .pixiObj() returns the PIXI drawing object for the sprite.
- the PIXI drawing object is not assured of having a usable
  "anchor" property.  Instead, consider that the position of
  the sprite is based on the upper-left corner.  The spritesheets
  used in the game always have 64x64 sprites.

ss.update();
- Call to update any animation.

ss.face("north"); // "south", "east", "west"
ss.face(); // return current facing.
- Change the facing of the character.

ss.walk(function () { ... });
ss.thrust(function () { ... });
ss.slash(function () { ... });
ss.spellcast(function () { ... });
ss.shoot(function () { ... });
ss.hurt(function () { ... });
ss.reverseHurt(function () { ... });
- Animate the character.  The given function is called at the
  *end* of the animation.  The finish function is called during
  the .update() call; if you want to defer, use setImmediate()
  in the function you pass in.
- During the hurt animation, the character faces south
  regardless of its current facing.
- If the spritesheet does not have the given animation, throw
  an Error.
- The character is left in the last frame of the animation.
  Call .stop() below to put the character in an idle frame.

ss.walk({
  progress: function (num) {
  },
  finish: function () {
  }
});
- For the walk animation, you can provide an object with two
  functions, progress and finish.
- The progress function is passed a number from 0.0 to 1.0,
  indicating how much of the animation is being displayed.
- The progress and finish functions are called during the
  .update() call.

ss.speed = 1.0;
- The animation speed.  1.0 indicates that all animations
  will take one second in total.  Lower numbers mean slower
  animations, higher numbers mean faster.

ss.stop();
- Stop any animation.
- Put the character in an idle state.

ss.stopHurt();
- Stop any animation.
- Put the character in the lying-down "hurt" frame.
- If the spritesheet does not have the hurt animation, throw
  an Error.

var ss2 = ss.clone();
- Create a new spritesheet object with a different state.
- The new spritesheet is facing south and is idle.
*/

exports.FullSheet = require("spritesheet/FullSheet");
exports.WalkCycle = require("spritesheet/WalkCycle");

return exports;
});
