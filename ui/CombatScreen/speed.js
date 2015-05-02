/* ui/CombatScreen/speed.js - Handles speed computations.  */
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
(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof require !== 'undefined') {
    factory(exports);
  } else {
    factory(global.speed || (global.speed = {}));
  }
})(this, function (exports) {
/* Determine the time units based on speed.  */
function timeFromSpeed(speed) {
  if (speed === 0.0) return 100.0;
  if (speed < 0.0) {
    return 100.0 - speed;
  } else {
    return 10000.0 / (speed + 100.0);
  }
}
/* When a character's speed is changed, that character's
   nextTurn must also change.  */
function changeNextTurn(nextTurn, oldSpeed, newSpeed) {
  var oldTime = timeFromSpeed(oldSpeed);
  var newTime = timeFromSpeed(newSpeed);
  return nextTurn * newTime / oldTime;
}

exports.timeFromSpeed = timeFromSpeed;
exports.changeNextTurn = changeNextTurn;
});
