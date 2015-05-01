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

.stats
- An Object whose fields contain the stats of the character.
- .stats.strength, .stats.dexterity, .stats.magic, .stats.vitality

.skills
- An Array containing Strings identifying the skills of
  the character.
- The Array should be unique; single-use skills are
  implemented by removing the entry from the .skills
  Array.

*/

var PIXI = require('pixi');
var UC = require('ui/UpdateContainer');

var MenuAsync = require('ui/genericMenu').AsyncClass;
var CharModels = require('ui/CombatScreen/CharModels');
var CharView = require('ui/CombatScreen/CharView');
var CharMenu = require('ui/CombatScreen/CharMenu');
var Curtain = require('ui/Curtain');
var GetReady = require('ui/CombatScreen/GetReady');

var speed = require('ui/CombatScreen/speed');
var timeFromSpeed = speed.timeFromSpeed;
var changeNextTurn = speed.changeNextTurn;

function CombatScreen(cfg) {
  var i = 0;

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

  this._pixi = new PIXI.DisplayObjectContainer();

  // Background layer.
  if (cfg.background) {
    cfg.background.x = 0;
    cfg.background.y = 0;
    this._pixi.addChild(cfg.background);
  }

  /* Character views.  */
  this._pviews = [];
  this._eviews = [];
  for (i = 0; i < 4; ++i) {
    var pview = new CharView(48 - (i * 16));
    uc.addChild(pview);
    pview.pixiObj().x = 192 - (i * 64);
    this._pixi.addChild(pview.pixiObj());
    this._pviews.push(pview);

    var eview = new CharView(48 - (i * 16));
    uc.addChild(eview);
    eview.pixiObj().x = 384 + (i * 64);
    this._pixi.addChild(eview.pixiObj());
    this._eviews.push(eview);
  }

  // Curtain layer.
  this._curtain = new Curtain();
  uc.addChild(this._curtain);
  this._pixi.addChild(this._curtain.pixiObj());

  // GetReady layer.
  this._getready = new GetReady();
  uc.addChild(this._getready);
  this._pixi.addChild(this._getready.pixiObj());

  // Menu.
  this._menu = new MenuAsync({});
  uc.addChild(this._menu);

  // Character selection menus.
  this._pmenu = new CharMenu(
    { viewArray: this._pviews
    , side: 'players'
    });
  this._emenu = new CharMenu(
    { viewArray: this._eviews
    , side: 'enemies'
    });
  uc.addChild(this._pmenu);
  uc.addChild(this._emenu);

  // Character models.
  this._charmodels = new CharModels();

  // Reference to combat state.
  this._cs = null;

  // A slot for number of animations still pending.
  this._number = 0;

  // Flag whether to call saveState or not.
  this._saveState = false;

  // Slot for holding screen to go to.
  this._goto = '';
}

/*-----------------------------------------------------------------------------
State machine
-----------------------------------------------------------------------------*/

function init(self) {
  var i = 0;

  var cs = self._cs;

  // Chain to the next function.
  function next() {
    --self._number;
    if (self._number !== 0) return;
    reveal(self);
  }

  // Initialize the curtain.
  self._curtain.setWhite();
  self._curtain.hide();

  // The number of continuations that must finish.
  // We have a continuation for each player and
  // enemy character, and a continuation for the
  // GET READY! animation.
  self._number = cs.players.length +
                 cs.enemies.length +
                 1 ;

  // Loads character spritesheets.
  function loadSpritesheet(type, i, facing) {
    var chr = cs[type][i];
    var life = chr.life;
    var speed = chr.speed;
    if (typeof chr.nextTurn === 'undefined' &&
        chr.life > 0) {
      var maxTime = timeFromSpeed(speed);
      chr.nextTurn = maxTime * Math.random();
    }
    var nt = chr.nextTurn;
    var views =
      (type === 'players') ?   self._pviews :
      /*otherwise*/            self._eviews ;
    var view = views[i];
    self._spritesheets(chr.spritesheet, function (ss) {
      view.enable();
      view.setSprite(ss);
      view.lifemeter.setLife(life);
      if (life == 0) {
        ss.face('south');
        ss.stopHurt();
        view.timeline.hide();
      } else {
        ss.face(facing);
        ss.stop();
        view.timeline.show();
        view.timeline.setSpeed(speed);
        view.timeline.setNextTurn(nt);
      }

      next();
    });
  }

  for (i = 0; i < 4; ++i) {
    if (i < cs.players.length) {
      loadSpritesheet('players', i, 'east');
    } else {
      // Not enough player characters.
      self._pviews[i].disable();
    }

    if (i < cs.enemies.length) {
      loadSpritesheet('enemies', i, 'west');
    } else {
      // Not enough enemy characters.
      self._eviews[i].disable();
    }
  }

  self._getready.show(next);
}
function reveal(self) {
  function next() {
    --self._number;
    if (self._number !== 0) return;
    judgeWinLose(self);
  }

  // Two continuations, one for the curtain, one
  // for fading out the GET READY!
  self._number = 2;
  self._curtain.fadeIn(next);
  self._getready.hide(next);
}

/* Main loop.  */
function judgeWinLose(self) {
  /* Determines if the player has already won or lost.  */

  var cs = self._cs;
  var i = 0;

  var eLose = true;
  var pLose = true;
  for (i = 0; i < 4; ++i) {
    if (i < cs.players.length) {
      if (cs.players[i].life > 0) pLose = false;
    }
    if (i < cs.enemies.length) {
      if (cs.enemies[i].life > 0) eLose = false;
    }
  }

  if (pLose) {
    self._curtain.setBlack();
    self._curtain.fadeOut(function () {
      this._goto = this._onLose;
    });
  } else if (eLose) {
    self._curtain.setWhite();
    self._curtain.fadeOut(function () {
      this._goto = this._onWin;
    });
  } else {
    advanceTime(self);
  }
}

function advanceTime(self) {
  /* Advances the time.  */
  var i = 0;

  var cs = self._cs;

  function next() {
    --self._number;
    if (self._number !== 0) return;
    determineTurn(self);
  }

  /* Fix the display and determine how much to advance. */
  var animations = 0;
  var shortestTime = Infinity;
  function process(chr, view) {
    /* Fix the times.  */
    view.timeline.setSpeed(chr.speed);
    view.timeline.setNextTurn(chr.nextTurn);
    /* Fix the lives.  */
    view.lifemeter.setLife(chr.life);
    /* Determine number of animations and how much to advance.  */
    if (chr.nextTurn < shortestTime) {
      shortestTime = chr.nextTurn;
    }
    ++animations;
  }
  for (i = 0; i < 4; ++i) {
    if (i < cs.players.length &&
        cs.players[i].life > 0) {
      process(cs.players[i], self._pviews[i]);
    }
    if (i < cs.enemies.length &&
       cs.enemies[i].life > 0) {
      process(cs.enemies[i], self._eviews[i]);
    }
  }

  /* Initiate the animations.  */
  self._number = animations;
  function animate(chr, view) {
    chr.nextTurn -= shortestTime;
    view.timeline.animateAdvance(shortestTime, function () {
      view.timeline.setNextTurn(chr.nextTurn);
      next();
    });
  }
  for (i = 0; i < 4; ++i) {
    if (i < cs.players.length &&
        cs.players[i].life > 0) {
      animate(cs.players[i], self._pviews[i]);
    }
    if (i < cs.enemies.length &&
        cs.enemies[i].life > 0) {
      animate(cs.enemies[i], self._eviews[i]);
    }
  }
  self._saveState = true;
}

function determineTurn(self) {
  /* Determine whose turn is next.  */
  var i = 0;
  var cs = self._cs;

  var selected = false;

  /* Go through enemies first.  */
  for (i = 0; i < 4 && !selected; ++i) {
    if (i < cs.enemies.length &&
        cs.enemies[i].life > 0 &&
        cs.enemies[i].nextTurn === 0) {
      selected = true;
      break;
    }
  }
  if (selected) {
    self._eviews[i].selector.blink(function () {
      self._eviews[i].selector.show();
      enemyTurn(self, i);
    });
    // Stop selection.
    return;
  }

  /* Now go through players.  */
  for (i = 0; i < 4 && !selected; ++i) {
    if (i < cs.players.length &&
        cs.players[i].life > 0 &&
        cs.players[i].nextTurn === 0) {
      selected = true;
      break;
    }
  }
  self._pviews[i].selector.blink(function () {
    playerTurn(self, i);
  });
}

//-----------------------------------------------------------------------------

function enemyTurn(self, en) {
  /* Enemy turn.  */
  console.log("enemyTurn");
}

//-----------------------------------------------------------------------------

// Used to handle player skill based on skill .target slot
var playerSkillHandle = {};

function playerTurn(self, pn) {
  /* Player turn.  Prepare menu.  */
  var cs = self._cs;

  var chr = cs.players[pn];
  var skills = chr.skills;

  var skillDefs = [];
  var menuItems = [];

  var i = 0;

  for (i = 0; i < skills.length; ++i) {
    var skillKey = skills[i];
    var skill = self._skills(skillKey);
    skillDefs.push(skill);
    menuItems.push(skill.name);
  }

  var hasItems = cs.playerItems.length !== 0;
  var itemSel = -1;
  if (hasItems) {
    itemSel = menuItems.length;
    menuItems.push("Use Item");
  }

  var escSel = menuItems.length;
  menuItems.push("Game Menu");

  self._pviews[pn].selector.show();

  self._menu.setEsc(escSel);
  self._menu.setItems(menuItems);
  self._menu.getSelection(function (sel) {
    if (sel === escSel) {
      playerGameMenu(self, pn);
    } else if (sel === itemSel) {
      // TODO.
    } else {
      var skill = skillDefs[sel];
      var target = skill.target;
      playerSkillHandle[target](self, pn, sel);
    }
  });
}

function playerGameMenu(self, pn) {
  /* Handle the game menu.  */
  self._menu.setItems(["Resume Combat", "Exit to Main Menu"]);
  self._menu.setEsc(0);
  self._menu.getSelection(function (sel) {
    if (sel === 0) {
      playerTurn(self, pn);
    } else {
      self._curtain.setWhite();
      self._curtain.fadeOut(function () {
        self._goto = self._onExit;
      });
    }
  });
}

playerSkillHandle.enemy = function (self, pn, sn) {
  /* Select an enemy target.  */

  // Remove selector on player character to prevent
  // user confusion.
  self._pviews[pn].selector.hide();

  self._emenu.getSelection(function (en) {
    if (en === -1) {
      playerTurn(self, pn);
    } else {
      skillInitiate(self, 'players', pn, sn, en);
    }
  });
};
playerSkillHandle.ally = function (self, pn, sn) {
  /* Select an ally target.  */

  // Remove selector on player character to prevent
  // user confusion.
  self._pviews[pn].selector.hide();

  self._pmenu.getSelection(function (an) {
    if (an === -1) {
      playerTurn(self, pn);
    } else {
      skillInitiate(self, 'players', pn, sn, an);
    }
  });
};
playerSkillHandle.enemies =
playerSkillHandle.allies =
playerSkillHandle.self =
playerSkillHandle.all = function (self, pn, sn) {
  // No need to select, just have skill initiation
  // done immediately.
  skillInitiate(self, 'players', pn, sn, -1);
};

//-----------------------------------------------------------------------------

function skillInitiate(self, cside, cn, sn, tn) {
  /* Initially animate the character performing the
     skill.  */
  /* cside = String, either 'players' or 'enemies'.  The side
             of the character.
     cn = the index number of the character doing
          the skill.
     sn = the index number of the skill.
     tn = the index number of the target of the skill.  If
          the skill is not 'enemy' or 'ally', ignored.
  */

  // Enemy side.
  var eside =
    cside === 'players' ? 'enemies' : 'players' ;

  var cs = self._cs;
  var sviews =
    cside === 'players' ? self._pviews : self._eviews ;
  var eviews =
    eside === 'players' ? self._pviews : self._eviews ;
  var caster = cs[cside][cn];
  var skey = caster.skills[sn];
  var skillDef = self._skills(skey);
  var sname = skillDef.name;

  var i = 0;

  // Clear selectors.
  for (i = 0; i < 4; ++i) {
    self._pviews[i].selector.hide();
    self._eviews[i].selector.hide();
  }

  // --- Count number of animations.

  // One animation for the caster moving.
  self._number = 1;

  // Determine number based on selectors.
  var target = skillDef.target;
  if (target === 'allies' ||
      target === 'all') {
    var smodels = cs[cside];
    for (i = 0; i < smodels.length; ++i) {
      if (smodels[i].life > 0) ++self._number;
    }
  }
  if (target === 'enemies' ||
      target === 'all') {
    var emodels = cs[eside];
    for (i = 0; i < emodels.length; ++i) {
      if (emodels[i].life > 0) ++self._number;
    }
  }
  if (target === 'ally' ||
      target === 'enemy' ||
      target === 'self') {
    ++self._number;
  }

  // --- Apply skill.

  function next() {
    --self._number;
    if (self._number !== 0) return;
    skillApply();
  }
  function skillApply() {
    cs = self._cs;
    var model = self._charmodels.startStep(cs);

    var casterModel =
      cside === 'players' ? model.playerChar(cn) :
      /*otherwise*/         model.enemyChar(cn) ;

    switch(target) {
    case 'all': {
      var amodels = model.livingEnemyChars();
      amodels = amodels.concat(model.livingPlayerChars());
      skillDef.apply(casterModel, amodels);
    } break;
    case 'allies': {
      var amodels =
        cside === 'players' ? model.livingPlayerChars() :
        /*otherwise*/         model.livingEnemyChars() ;
      skillDef.apply(casterModel, amodels);
    } break;
    case 'enemies': {
      var emodels =
        eside === 'players' ? model.livingPlayerChars() :
        /*otherwise*/         model.livingEnemyChars() ;
      skillDef.apply(casterModel, emodels);
    } break;
    case 'self': {
      skillDef.apply(casterModel, casterModel);
    } break;
    case 'ally': {
      var amodel =
        cside === 'players' ? model.playerChar(tn) :
        /*otherwise*/         model.enemyChar(tn) ;
      skillDef.apply(casterModel, amodel);
    } break;
    case 'enemy': {
      var emodel =
        eside === 'players' ? model.playerChar(tn) :
        /*otherwise*/         model.enemyChar(tn) ;
      skillDef.apply(casterModel, emodel);
    } break;
    }

    skillApplyAnimate(self, model);
  }

  // --- Inititate animations.

  // Caster animation.
  var animation = skillDef.animation;
  sviews[cn].sprite[animation](function() {
    sviews[cn].sprite.stop();
    next();
  });

  if (target === 'enemies' ||
      target === 'all') {
    var emodels = cs[eside];
    for (i = 0; i < emodels.length; ++i) {
      if (emodels[i].life > 0) {
        eviews[i].selector.blink(next);
      }
    }
  }
  if (target === 'allies' ||
      target === 'all') {
    var smodels = cs[eside];
    for (i = 0; i < smodels.length; ++i) {
      if (smodels[i].life > 0) {
        sviews[i].selector.blink(next);
      }
    }
  }
  if (target === 'self') {
    sviews[cn].selector.blink(next);
  }
  if (target === 'ally') {
    sviews[tn].selector.blink(next);
  }
  if (target === 'enemy') {
    eviews[tn].selector.blink(next);
  }
}

function skillApplyAnimate(self, model) {
  /* Animate the result of skill application.  */
  console.log("skillApplyAnimate");
}

/*-----------------------------------------------------------------------------
Public API
-----------------------------------------------------------------------------*/

CombatScreen.prototype.enter = function (api) {
  this._cs = api.gameState.combat;

  api.top.removeChildren();
  api.top.addChild(this._pixi);

  this._goto = '';

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
  if (this._goto !== '') {
    var dest = this._goto;
    this._goto = '';
    api.setScreen(dest);
  }
  return this;
};
CombatScreen.prototype.leave = function (api) {
  var i = 0;
  api.top.removeChild(this._pixi);
  // Clear spritesheets.
  for (i = 0; i < 4; ++i) {
    this._pviews[i].clearSprite();
    this._eviews[i].clearSprite();
  }
  return this;
};

return CombatScreen;
});
