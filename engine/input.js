/* engine/input.js - Input handler for the game engine.  */
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
define(['engine/inputKeys'], function (keys) {
"use strict";

var input = {};
input.x = 0;
input.y = 0;
input.upState = false;
input.downState = false;
input.leftState = false;
input.rightState = false;
input.enterState = false;
input.escState = false;
input.oldUpState = false;
input.oldDownState = false;
input.oldLeftState = false;
input.oldRightState = false;
input.oldEnterState = false;
input.oldEscState = false;
input.up = false;
input.down = false;
input.left = false;
input.right = false;
input.enter = false;
input.esc = false;

input.initialize = function () {
  keys.initialize();
};
input.update = function () {
  keys.update();

  /* Update old state.  */
  input.oldUpState      = input.upState;
  input.oldDownState    = input.downState;
  input.oldLeftState    = input.leftState;
  input.oldRightState   = input.rightState;
  input.oldEnterState   = input.enterState;
  input.oldEscState     = input.escState;
  /* Set the states from the sub-component values.  */
  input.upState         = keys.up;
  input.downState       = keys.down;
  input.leftState       = keys.left;
  input.rightState      = keys.right;
  input.enterState      = keys.enter;
  input.escState        = keys.esc;
  /* Set the keypress values from the old and new values.  */
  input.up              = !input.oldUpState && input.upState;
  input.down            = !input.oldDownState && input.downState;
  input.left            = !input.oldLeftState && input.leftState;
  input.right           = !input.oldRightState && input.rightState;
  input.enter           = !input.oldEnterState && input.enterState;
  input.esc             = !input.oldEscState && input.escState;

  /* Set the x and y from the new values.  */
  input.x               = (input.leftState ? -1 : 0) +
                          (input.rightState ? 1 : 0) ;
  input.y               = (input.upState ? -1 : 0) +
                          (input.downState ? 1 : 0) ;
};

return input;
});

