/* ui/CombatScreen.js - Handles the combat screen.  */
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
define(function (require) {
"use strict";
/*
var uic = new CombatScreen(
{ spritesheets: function (spritename, kont) { ... }
, skills: function (skillname) { ... }
, items: function (itemname) { ... }
, background: pixiObject
, onWin: 'screenName'
, onLose: 'screenName'
, onExit: 'screenName'
});
- Create a CombatScreen UI.
- CombatScreen provides a gamescreen interface.  Its
  enter(), update(), and leave() methods expect an engine
  API object with a .gameState field.  CombatScreen only
  uses .gameState, not .state, of the API, so it can be
  wrapped by any screen that provides an appropriate
  .gameState field.
- The CombatScreen UI expects a .combat field in the
  api.gameState, containing a combat status object.

The CombatScreen constructor expects a configuration object
with the following fields:

.spritesheets(spritename, function (sprite) { .... })
- A function that asynchronously loads the designated
  sprite name.
- The sprite must have the same interface as that
  indicated in spritesheet.js.

.skills(skillname)
- A function that returns the indicated skill.
- Must not return null.

.items(itemname)
- A function that returns the indicated item.
- Must not return null.

.background
- A PIXI drawing object to be used as combat background.
- The object is positioned at 0,0 and not scaled or
  alphaed.
- Optional.

.onWin
.onLose
.onExit
- Strings indicating the screen names to transition to
  when the player wins, loses, or elects to enter the
  main menu.
- On winning or going to the main menu, the display is
  blanked to white.
- On losing, the display is blanked to black.
- The combat state is expected to be retained; the game
  may then extract additional information (like
  remaining player life and items) from the combat
  state.
*/

/*
The combat state api.gameState.combat contains the
following fields:

.players
- An Array of player character states.  Must be 1 to 4
  in length.

.enemies
- An Array of enemy character states.  Must be 1 to 4
  in length.

.playerItems
- An Array of Strings indicating the item names that
  the player characters currently possess.
- Only combat items should be indicated.

Player/enemy character states have the following fields:

.life
- The current life of the character, scaled from 0 to 100.
- If life is 0, the character is dead.

.nextTurn
- The time to the next turn of the character.
- Time units are arbitrary.
- At speed 0, 100 time units between turns.
- Should not be filled in when initializing combat.  When
  initializing combat, the CombatScreen will set a random
  .nextTurn based on time-between-turns, which is based on
  speed.

.speed
- The speed of the character.  Speed 0 is the default.
  Negative speed is slower, positive speed is faster.
- Negative speed increases time between turns.
- Positive speed decreases time between turns.

.resists
- An Object whose fields contain the resistances of the
  character.
- Field names are element types, field values are resist
  values.

.damage
- An Object whose fields contain the damage of the
  character.
- Field names are element types, field values are damage
  values.

.element
- A String indicating the central element of the character.

.name
- A String containing the in-game name of the character

.spritesheet
- A String referring to the spritesheet for the character.

.skills
- An Array containing Strings identifying the skills of
  the character.
- The Array should be unique; single-use skills are
  implemented by removing the entry from the .skills
  Array.

*/

var PIXI = require('pixi');
var UC = require('ui/UpdateContainer');
var Curtain = require('ui/Curtain');

var GetReady = require('ui/CombatScreen/GetReady');

function CombatScreen(cfg) {
  // Get configuration.
  this._spritesheets = cfg.spritesheets.bind(cfg);
  this._skills = cfg.skills.bind(cfg);
  this._items = cfg.items.bind(cfg);
  this._onWin = cfg.onWin;
  this._onLose = cfg.onLose;
  this._onExit = cfg.onExit;

  // Components.
  var uc = new UC();
  this._allUpdate = uc.update.bind(uc);

  this._pixi = new PIXI.DrawingObjectContainer();

  // Background layer.
  if (cfg.background) {
    cfg.background.x = 0;
    cfg.background.y = 0;
    this._pixi.addChild(cfg.background);
  }

  // TODO: actual combat interface.

  // Curtain layer.
  this._curtain = new Curtain();
  uc.addChild(this._curtain);
  this._pixi.addChild(this._curtain.pixiObj());

  // GetReady layer.
  this._getready = new GetReady();
  uc.addChild(this._getready);
  this._pixi.addChild(this._getready.pixiObj());

  // Reference to combat state.
  this._cs = null;

  // A slot for number of animations still pending.
  this._number = 0;

  // Flag whether to call saveState or not.
  this._saveState = false;
}

/*-----------------------------------------------------------------------------
State machine
-----------------------------------------------------------------------------*/

function init(self) {
  var i = 0;
  function next() {
    --self._number;
    if (self._number !== 0) return;
    reveal(self);
  }

  self._curtain.setWhite();
  self._curtain.hide();

  var cs = self._cs;

  self._number = cs.players.length +
                 cs.enemies.length +
                 1 ;
  for (i = 0; i < 4; ++i) {
    (function (i) {
    if (i < cs.players.length) {
      var player = cs.players[i];
      var life = player.life;
      if (typeof player.nextTurn === 'undefined' &&
          player.life > 0) {
        // TODO: set a random next-turn.
      }
      self._spritesheets(player.spritesheet, function (ss) {
        // TODO: show player view, install spritesheet.
        next();
      });
    } else {
      // TODO: hide player view.
    }

    if (i < cs.enemies.length) {
      var enemy = cs.enemies[i];
      var life = enemy.life;
      if (typeof enemy.nextTurn === 'undefined' &&
          enemy.life > 0) {
        // TODO: set a random next-turn.
      }
      self._spritesheets(enemy.spritesheet, function (ss) {
        // TODO: show enemy view, install spritesheet.
        next();
      });
    } else {
      // TODO: hide enemy view.
    }
    })(i);
  }

  self._getready.show(next);
}
function reveal(self) {
  function next() {
    --self._number;
    if (self._number !== 0) return;
    // TODO.
  }

  self._number = 2;
  self._curtain.fadeIn(next);
  self._getready.hide(next);
}

/*-----------------------------------------------------------------------------
Public API
-----------------------------------------------------------------------------*/

CombatScreen.prototype.enter = function (api) {
  this._cs = api.gameState.combat;

  api.top.addChild(this._pixi);

  init(this);

  return this;
};
CombatScreen.prototype.update = function (api) {
  this._cs = api.gameState.combat;
  this._allUpdate(api);
  if (this._saveState) {
    this._saveState = false;
    api.saveState();
  }
  return this;
};
CombatScreen.prototype.leave = function (api) {
  api.top.removeChild(this._pixi);
  // TODO
  return this;
};

return CombatScreen;
});
