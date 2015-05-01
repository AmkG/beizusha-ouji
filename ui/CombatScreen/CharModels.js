/* ui/CombatScreen/CharModels.js - Handles character models
   used in interfacing between the combat screen and
   mechanics/skills.js.  */
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
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define(['util/F'], factory);
  } else if (typeof require !== 'undefined') {
    module.exports = factory(require('util/F'));
  }
})(function (F) {
"use strict";

/*
var cm = new CharModels();
- Create a new character model handler.

var model = cm.startStep(api.gameState.combat);
- Create a model change step handler.
- Only one model change step handler can be active at a time.
- The given combat state object is the state object used.

var playerChar = model.playerChar(i);
- Return the index of the given player character.
- Character interfaces are the same as described in
  mechanics/skills.js

var playerChars = model.playerChars();
var livingPlayerChars = model.livingPlayerChars();
- Return Arrays of player chars.
- .livingPlayerChars() returns only the surviving player
  characters.

var enemyChar = model.enemyChar(i);
var enemyChars = model.enemyChars();
var livingEnemyChars = model.livingEnemyChars();
- Like for the player side, this time for the enemy side.

var playerChangeRecord = model.playerChangeRecord(i);
var enemyChangeRecord = model.enemyChangeRecord(i);
- Returns a "change record" object.
- A change record indicates the changes that occurred to
  a specific character.
- See below for interface of change records.

model.commit();
- Write the changes to the combat state.
- The model may then be discarded and cm.startStep() may
  be called again.
*/

/*
Change Records are used to keep track of what changed so
that the view can be animated.

changeRecord.didLifeChange();
- Return true if life changed.

changeRecord.curLife();
- Return the current value of life.

changeRecord.targetLife();
- Return the target value of life.

changeRecord.didNextTurnChange();
changeRecord.curNextTurn();
changeRecord.targetNextTurn();
- Get change of nextTurn.

changeRecord.didSpeedChange();
changeRecord.curSpeed();
changeRecord.targetSpeed();
- Get change of speed.

*/

/*-----------------------------------------------------------------------------
Change Records
-----------------------------------------------------------------------------*/

/* Actual change record.  Includes
   additional API methods to actually
   indicate changes.

   This is the core object representing
   characters.  The objects exposed to
   clients of CharModels refer to this
   object and call its API methods.
*/
function ChangeRecord() {
  // Current state.
  this._cs = null;
  // Target state.
  this._ts = null;
}
// Start recording.  Use the character combat state.
ChangeRecord.prototype.startStep = function (cs) {
  this._cs = cs;
  // This deep clone is safe because combat states
  // must be simple, JSON-able objects anyway.
  this._ts = JSON.parse(JSON.stringify(cs));
  return this;
};
// End recording.
ChangeRecord.prototype.commit = function () {
  var ks = Object.keys(this._cs);
  var i = 0;
  var l = ks.length;
  if (this._ts.life < 0) this._ts.life = 0;
  if (this._ts.life > 100) this._ts.life = 100;
  for (i = 0; i < l; ++i) {
    var k = ks[i];
    this._cs[k] = this._ts[k];
  }
  this._cs = null;
  this._ts = null;
  return this;
};

// life.
ChangeRecord.prototype.didLifeChange = function () {
  return this.curLife() !== this.targetLife();
};
ChangeRecord.prototype.curLife = function () {
  return this._cs.life;
};
ChangeRecord.prototype.targetLife = function () {
  var life = this._ts.life;
  if (life < 0) return 0;
  if (life > 100) return 100;
  return life;
};
ChangeRecord.prototype.changeLife = function (delta) {
  this._ts.life += delta;
  return this;
};
// nextTurn.
ChangeRecord.prototype.didNextTurnChange = function () {
  return this._cs.nextTurn !== this._ts.nextTurn;
};
ChangeRecord.prototype.curNextTurn = function () {
  return this._cs.nextTurn;
};
ChangeRecord.prototype.targetNextTurn = function () {
  return this._ts.nextTurn;
};
ChangeRecord.prototype.changeNextTurn = function (delta) {
  this._ts.nextTurn += delta;
  return this;
};
// speed.
ChangeRecord.prototype.didSpeedChange = function () {
  return this._cs.speed !== this._ts.speed;
};
ChangeRecord.prototype.curSpeed = function () {
  return this._cs.speed;
};
ChangeRecord.prototype.targetSpeed = function () {
  return this._ts.speed;
};
ChangeRecord.prototype.changeSpeed = function (delta) {
  this._ts.speed += delta;
  return this;
};

// Other changable things.
ChangeRecord.prototype.curResists = function () {
  return this._cs.resists;
};
ChangeRecord.prototype.targetResists = function () {
  return this._ts.resists;
};
ChangeRecord.prototype.changeResists = function (deltas) {
  var ks = Object.keys(deltas);
  var l = ks.length;
  var i = 0;
  for (i = 0; i < l; ++i) {
    var k = ks[i];
    if (this._ts.resists[k]) this._ts.resists[k] += deltas[k];
    else this._ts.resists[k] = deltas[k];
  }
};
ChangeRecord.prototype.curDamage = function () {
  return this._cs.damage;
};
ChangeRecord.prototype.targetDamage = function () {
  return this._ts.damage;
};
ChangeRecord.prototype.changeDamage = function (deltas) {
  var ks = Object.keys(deltas);
  var l = ks.length;
  var i = 0;
  for (i = 0; i < l; ++i) {
    var k = ks[i];
    if (this._ts.damage[k]) this._ts.damage[k] += deltas[k];
    else this._ts.damage[k] = deltas[k];
  }
};
ChangeRecord.prototype.curStats = function () {
  return this._cs.stats;
};
ChangeRecord.prototype.targetStats = function () {
  return this._ts.stats;
};
ChangeRecord.prototype.changeStats = function (deltas) {
  var ks = Object.keys(deltas);
  var l = ks.length;
  var i = 0;
  for (i = 0; i < l; ++i) {
    var k = ks[i];
    if (this._ts.stats[k]) this._ts.stats[k] += deltas[k];
    else this._ts.stats[k] = deltas[k];
  }
};

// Information.
ChangeRecord.prototype.element = function () {
  return this._cs.element;
};

/*-----------------------------------------------------------------------------
Public Change Records
-----------------------------------------------------------------------------*/

/* The public form of change records
   disallows mutation and only exposes
   life, next turn, and speed changes.  */
function PublicChangeRecord(cr)  {
  this._cr = cr;
}
(function () {
var reflect =
  [ 'didLifeChange'
  , 'curLife'
  , 'targetLife'
  , 'didNextTurnChange'
  , 'curNextTurn'
  , 'targetNextTurn'
  , 'didSpeedChange'
  , 'curSpeed'
  , 'targetSpeed'
  ];
var i = 0;
function make(k){
  PublicChangeRecord.prototype[k] = function () {
    return this._cr[k]();
  };
}
for (i = 0; i < reflect.length; ++i) {
  make(reflect[i]);
}
})();

/*-----------------------------------------------------------------------------
Character Interface
-----------------------------------------------------------------------------*/

/* Provides the character interface to
   mechanics/skills.  */
function Char(cr) {
  this._cr = cr;
}
Char.prototype.life = function () {
  return this._cr.curLife();
};
Char.prototype.nextTurn = function () {
  return this._cr.curNextTurn();
};
Char.prototype.speed = function () {
  return this._cr.curSpeed();
};
Char.prototype.resists = function () {
  return this._cr.curResists();
};
Char.prototype.changeResists = function (obj) {
  this._cr.changeResists(obj);
  return this;
};
Char.prototype.stats = function () {
  return this._cr.curStats();
};
Char.prototype.changeStats = function(obj) {
  this._cr.changeStats(obj);
  return this;
};
Char.prototype.element = function() {
  return this._cr.element();
};
Char.prototype.dealDamage = function (v) {
  this._cr.changeLife(-v);
  return this;
};
Char.prototype.heal = function(v) {
  this._cr.changeLife(v);
  return this;
};
Char.prototype.delay = function(v) {
  this._cr.changeNextTurn(v);
  return this;
};
Char.prototype.speedUp = function(v) {
  this._cr.changeSpeed(v);
  return this;
};
Char.prototype.slowDown = function(v) {
  this._cr.changeSpeed(-v);
  return this;
};
Char.prototype.attackDamage = function () {
  return this._cr.curDamage();
};
Char.prototype.changeAttackDamage = function (obj) {
  this._cr.changeDamage(obj);
  return this;
};

/*-----------------------------------------------------------------------------
SteppedModel
-----------------------------------------------------------------------------*/

/* This part of the object handles the
   model on CharModel.prototype.startStep.  */
function SteppedModel() {
  var i = 0;

  /* Construct the core objects.  */
  this._ecores = [];
  this._pcores = [];
  this._eps = [];
  this._pps = [];
  this._ecs = [];
  this._pcs = [];
  for (i = 0; i < 4; ++i) {
    var ecore = new ChangeRecord();
    var pcore = new ChangeRecord();
    this._ecores.push(ecore);
    this._pcores.push(pcore);
    this._eps.push(new PublicChangeRecord(ecore));
    this._pps.push(new PublicChangeRecord(pcore));
    this._ecs.push(new Char(ecore));
    this._pcs.push(new Char(pcore));
  }

  /* Number of actual players/enemies.  */
  this._enum = -1;
  this._pnum = -1;
}
SteppedModel.prototype._startStep = function (cs) {
  var i = 0;
  this._enum = cs.enemies.length;
  this._pnum = cs.players.length;
  for (i = 0; i < 4; ++i) {
    if (i < this._enum) {
      this._ecores[i].startStep(cs.enemies[i]);
    }
    if (i < this._pnum) {
      this._pcores[i].startStep(cs.players[i]);
    }
  }
  return this;
};
SteppedModel.prototype.commit = function () {
  var i = 0;
  for (i = 0; i < 4; ++i) {
    if (i < this._enum) {
      this._ecores[i].commit();
    }
    if (i < this._pnum) {
      this._pcores[i].commit();
    }
  }
  this._enum = -1;
  this._pnum = -1;
};
SteppedModel.prototype.playerChar = function (i) {
  return this._pcs[i];
};
SteppedModel.prototype.playerChars = function () {
  return this._pcs.slice(0, this._pnum);
};
SteppedModel.prototype.livingPlayerChars = function () {
  return F.filter( function (x) {return x.life() > 0}
                 , this.playerChars()
                 );
};
SteppedModel.prototype.enemyChar = function (i) {
  return this._ecs[i];
};
SteppedModel.prototype.enemyChars = function () {
  return this._ecs.slice(0, this._enum);
};
SteppedModel.prototype.livingEnemyChars = function () {
  return F.filter( function (x) {return x.life() > 0}
                 , this.enemyChars()
                 );
};
SteppedModel.prototype.playerChangeRecord = function (i) {
  return this._pps[i];
};
SteppedModel.prototype.enemyChangeRecord = function (i) {
  return this._eps[i];
};

/*-----------------------------------------------------------------------------
CharModels
-----------------------------------------------------------------------------*/

function CharModels() {
  this._core = new SteppedModel();
}
CharModels.prototype.startStep = function (cs) {
  this._core._startStep(cs);
  return this._core;
};

return CharModels;
});
