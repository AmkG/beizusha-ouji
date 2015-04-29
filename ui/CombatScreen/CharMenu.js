/* ui/CombatScreen/CharMenu.js - Handle selection of
   combat character.  */
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
define([], function () {
"use strict";

/*
var menu = new CharMenu(
{ viewArray: [obj, obj, ...]
, side: 'players'
});
- Create a new character menu.
- viewArray is a vector of CharView objects.
- side is 'players' or 'enemies'.

menu.getSelection(function (sel) {
  // ...
});
- Select a character.
- When the user has selected a character, call the given
  function with the index of the character selected.
- If the user presses escape, all the given function with
  -1.

menu.update(api);
- Call at each update point.
- Must pass in the engine API augmented with a .gameState
  field.
*/

function nullFun() {}

function CharMenu(options) {
  this._views = options.viewArray;
  this._side = options.side;
  // Direction of the right-arrow button.
  this._dir = options.side === 'players' ? -1 : 1;

  this._state = 'none';
  this._sel = 0;
  this._cb = nullFun;
}
CharMenu.prototype.getSelection = function (k) {
  this._state = 'start';
  this._cb = k;
  return this;
};
CharMenu.prototype.update = function (api) {
  if (this._state === 'none') return this;
  var self = this;
  var cs = api.gameState.combat;
  var chars = cs[this._side];
  if (this._state === 'start') {
    var i = 0;
    var selected = false;
    for (i = 0; i < 4; ++i) {
      if (!selected && i < chars.length && chars[i].life > 0) {
        this._views[i].selector.show();
        this._sel = i;
        selected = true;
      } else {
        this._views[i].selector.hide();
      }
    }
    this._state = 'select';
  } else if (this._state === 'select') {
    var dir = 0;
    if (api.input.right) {
      dir = this._dir;
    } else if (api.input.left) {
      dir = -this._dir;
    }

    if (dir != 0) {
      this._views[this._sel].selector.hide();
      do {
        this._sel += dir;
        if (this._sel >= 4) this._sel = 0;
        else if (this._sel < 0) this._sel = 3;
      } while (this._sel >= chars.length ||
               chars[this._sel].life <= 0);
      this._views[this._sel].selector.show();
    }

    if (api.input.enter) {
      var cb = this._cb;
      var sel = this._sel;
      this._state = 'none';
      this._cb = nullFun;
      this._views[this._sel].selector.blink(function () {
        cb(sel);
      });
    } else if (api.input.esc) {
      var cb = this._cb;
      this._state = 'none';
      this._cb = nullFun;
      this._views[this._sel].selector.hide();
      cb(-1);
    }
  }
};

return CharMenu;
});

