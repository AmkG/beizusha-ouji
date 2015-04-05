/* mechanics/skills.js - combat skill descriptions.  */
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
(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(['mechanics/element'], factory);
  } else if (typeof require !== 'undefined') {
    module.exports = factory(require('mechanics/element'));
  }
})(function(element) {
"use strict";

var skills = Object.create(null);

/*
Each slot of the skills object is a skill descriptor object.

Skill descriptor objects have the following slots.  Unless indicated
otherwise, each slot is required.

.name
- The in-game name of the skill.

.desc
- A description of what the skill does.

.element
- A string, one of the element types.
- Can only be learned by characters with that element, or an
  allied element.

.charClass
- A string, one of the character classes.
- 'any' if no character class restriction.
- Can only be learned by characters with the given class,
  unless 'any'.

.target
- One of the following strings: 'enemy', 'enemies', 'ally',
  'allies', 'all', 'self'.
- Indicates what the skill targets.

.singleUse
- Optional.
- A boolean.
- If present and true, indicates that the skill can only
  be used once per combat.

.turns
- Optional.
- A natural.
- If present and non-zero, indicates that the skill consumes
  more than one turn, and indicates the number of extra turns
  to consume.
- The skill is applied on its last turn.

.animation
- One of the following strings: 'slash', 'shoot', 'spellcast'.
- Note that various character classes might not have useful
  animations.  For example, fighter classes might not have a
  useful 'shoot' animation.

.onScroll
- Optional.
- A boolean.
- if present and true, the skill can be found on scrolls.

.onSkillbook
- Optional.
- A boolean.
- if present and true, the skill can be found on skillbooks.

.apply()
- A function that determines the skill's effect when applied.
- Given two arguments.  The first argument is always a
  character interface to the caster.  The second argument is
  the target, whose type depends on the .target field of the
  skill descriptor.
- The target argument is an Array of character interfaces if
  the .target field is 'allies', 'enemies', or 'all', and is
  a character interface to the target if the .target field is
  'ally', 'enemy', or 'self'.

Character interfaces

The .apply() function is provided character interfaces.  These
are objects whose public slots are the following methods:

.resists()
- Returns an object containing the resistances of the character.
- The resistances object has a slot for each element.  For
  example, .light is the Light resistance.
- Do not modify the object.  Change the resistances via the
  .changeResists() method.

.changeResists(obj)
- Given an object, add the object's element name slots to
  the character's resists.
- A slot may be negative to indicate reduction of resistances.
- Takes effect after the call to apply().
- Only affects the current combat.

.stats()
- Returns an object containing the stats of the character.
- The stats object has the following slots: .strength,
  .dexterity, .magic, .vitality
- Do not modify the object.  Change the stats via the
  .changeStats() method.

.changeStats(obj)
- Given an object, add the object's stat name slots to
  the character's stats.
- A slot may be negative to reduce a stat.
- Takes effect after the call to apply().
- Only affects the current combat.

.element()
- Returns an element string, the character's aligned element.

.dealDamage(num)
- Given a natural, deals that amount of damage to the
  character's life.
- Should not be negative.

.heal(num)
- Given a natural, heal that amount of damage to the
  character's life.
- Should not be negative.

.delay(num)
- Given a positive or zero number, delay the character's
  next turn by that amount.
- Delays are generally scaled around the base delay of 100.

.speedUp(num)
- Given a positive or zero number, improves the character's
  speed by that amount.
- The value is added to the current speed.
- speed ups are generally a percentage of how many more turns
  over an indefinitely long amount of time the character
  gets.
- This also affects the character's next turn.

.slowDown(num)
- Given a positiveo or zero number, reduces the character's
  speed by that amount.
- The value is subtracted from the current speed.

*/

/*-----------------------------------------------------------------------------
Get attack damage from character
-----------------------------------------------------------------------------*/

function getAttackCommon(caster, strFactor, dexFactor) {
  var stats = caster.stats();
  var attackDamage = caster.attackDamage();

  var bonusBase = stats.strength * strFactor + stats.dexterity * dexFactor;
  var bonusNormal = bonusBase;
  var bonusElem = bonusBase / 2;
  var rv = {};

  var i = 0;
  var el = '';

  for (i = 0; i < element.types.length; ++i) {
    el = element.types[i];
    if (!attackDamage[el]) continue;
    if (el !== 'normal') {
      bonus = bonusElem;
    } else {
      bonus = bonusNormal;
    }
    rv[el] = attackDamage[el] * (1.0 + bonus);
  }

  return rv;
}

function meleeAttack(caster) {
  /* In melee, the character's str has a greater effect than dex.  */
  return getAttackCommon(caster, 0.012, 0.006);
}
function rangedAttack(caster) {
  /* In ranged, the character's dex has a greater effect than str.  */
  return getAttackCommon(caster, 0.006, 0.012);
}

/*-----------------------------------------------------------------------------
Normal attack
-----------------------------------------------------------------------------*/

skills.slash =
{ name: "Slash"
, desc: "Hit an opponent with a melee weapon"
, element: 'normal'
, charClass: 'fighter'
, target: 'enemy'
, singleUse: false
, turns: 0
, animation: 'slash'
, onScroll: false
, onSkillbook: false
, apply: function (caster, target) {
  var attack = meleeAttack(caster);
  var dmg = element.computeDamage(target.resists(), attack);
  target.dealDamage(dmg);
}
};

skills.shoot =
{ name: "Shoot"
, desc: "Hit an opponent with a ranged weapon"
, element: 'normal'
, charClass: 'archer'
, target: 'enemy'
, singleUse: false
, turns: 0
, animation: 'shoot'
, onScroll: false
, onSkillbook: false
, apply: function (caster, target) {
  var attack = rangedAttack(caster);
  var dmg = element.computeDamage(target.resists(), attack);
  target.dealDamage(dmg);
}
};

/*-----------------------------------------------------------------------------
Light
-----------------------------------------------------------------------------*/

skills.lightarrow =
{ name: "Arrow of Light"
, desc: "A magic arrow whose blinding effect " +
        "delays an opponent; the higher the light damage, " +
        "the longer the effect."
, element: 'light'
, charClass: 'archer'
, target: 'enemy'
, animation: 'shoot'
, onSkillbook: true
, apply: function (caster, target) {
  var attack = rangedAttack(caster);
  attack.light = (attack.light || 0) + 8;
  if (caster.element() == 'light') {
    attack.light += 8;
  }
  var blind = {light: attack.light * 2};
  var dmg = element.computeDamage(target.resists(), attack);
  var blindTime = element.computeDamage(target.resists(), blind);
  target.dealDamage(dmg);
  target.delay(blindTime);
}
};

skills.flash =
{ name: "Flash"
, desc: "A short sharp blinding flash of light that deals a " +
        "little damage to all opponents and delays them."
, element: 'light'
, charClass: 'mage'
, target: 'enemies'
, onSkillbook: true
, onScroll: true
, animation: 'spellcast'
, apply: function (caster, targets) {
  var attack = {light: caster.stats().magic * 0.25};
  var i = 0;
  var target = null;
  if (element.areAllied('light', caster.element())) {
    attack.light *= 1.2;
  }
  if (caster.element() === 'light') {
    attack.light *= 1.2;
  }
  for (i = 0; i < targets.length; ++i) {
    target = targets[i];
    target.dealDamage(
       element.computeDamage(target.resists(), attack)
    );
    target.delay(40);
  }
}
};

skills.prismatic =
{ name: "Prismatic Slash"
, desc: "A slash of light that deals all elements " +
        "of damage."
, element: 'light'
, charClass: 'mage'
, target: 'enemy'
, animation: 'slash'
, onSkillbook: true
, apply: function (caster, target) {
  var baseAttack = meleeAttack(caster);
  var total = 0.0;
  var i = 0;
  var el = '';
  for (i = 0; i < element.types.length; ++i) {
    el = element.types[i];
    if (!baseAttack[el]) continue;
    total += baseAttack[el];
  }
  total += 8;
  if (caster.element() === 'light') {
    total *= 1.2;
  }

  var attack = {};
  attack.light = total * 0.4;
  attack.life = total * 0.2;
  attack.order = total * 0.2;
  attack.dark = total * 0.1;
  attack.chaos = total * 0.1;
  var dmg = element.computeDamage(target.resists(), attack);
  target.dealDamage(dmg);
}
};

/*-----------------------------------------------------------------------------
Order
-----------------------------------------------------------------------------*/

skills.justice =
{ name: "Slash of Justice"
, desc: "Convert all damage to Order, increasing the damage " +
        "tremendously, but deal some damage to yourself."
, element: 'order'
, charClass: 'fighter'
, target: 'enemy'
, animation: 'slash'
, onSkillbook: true
, apply: function (caster, target) {
  var attack = meleeAttack(caster);
  var totalAttack = 0.0;
  var i = 0;
  var el = '';

  for (i = 0; i < element.types.length; ++i) {
    el = element.types[i];
    totalAttack += attack[el];
  }
  if (caster.element() == 'order') {
    totalAttack *= 1.05;
  }
  totalAttack *= 1.5;
  var dmg = element.computeDamage(target.resists(), {order: totalAttack});

  target.dealDamage(dmg);
  caster.dealDamage(dmg / 8);
}
};

skills.impositionoforder =
{ name: "Imposition of Order"
, desc: "Impose a slow down on all opponents."
, element: 'order'
, charClass: 'any'
, target: 'enemies'
, singleUse: true
, animation: 'spellcast'
, onSkillbook: true
, onScroll: true
, apply: function (caster, targets) {
  var baseSlow = 30;
  if (caster.element() === 'order') {
    baseSlow += 10;
  }
  var i = 0;
  var target = null;
  var attack = {order: baseSlow};
  for (i = 0; i < targets.length; ++i) {
    target = targets[i];
    var slow = element.computeDamage(target.resists(), attack);
    target.slowDown(slow);
  }
}
}

/*-----------------------------------------------------------------------------
Dark
-----------------------------------------------------------------------------*/

skills.terrify =
{ name: "Terrify"
, desc: "Scare all opponents, delaying their next turn."
, element: 'dark'
, charClass: 'any'
, target: 'enemies'
, singleUse: true
, animation: 'spellcast'
, onScroll: true
, onSkillbook: true
, apply: function (caster, targets) {
  var time = caster.stats().magic * 2;
  var i = 0;
  var target = null;
  if (caster.element() == 'dark') {
    time *= 2.5;
  }
  for (i = 0; i < targets.length; ++i) {
    target = targets[i];
    if (target.element() != 'dark') {
      target.delay(time);
    } else {
      target.delay(time * 0.2);
    }
  }
}
};

skills.blackblade =
{ name: "Black Blade"
, desc: "A dark slash that slows down the target; the higher " +
        "the Dark damage, the greater the slowdown."
, element: 'dark'
, charClass: 'fighter'
, target: 'enemy'
, singleUse: true
, animation: 'slash'
, onSkillbook: true
, apply: function (caster, target) {
  var attack = meleeAttack(caster);
  var slow = (attack.dark || 0) + 2;
  if (caster.element() === 'dark') {
    slow += 5;
  }
  var dmg = element.computeDamage(target.resists(), attack);
  target.dealDamage(dmg);
  target.slowDown(slow);
}
};

skills.arrowofdeath =
{ name: "Arrow of Death"
, desc: "Focus into the Dark, keeping a single " +
        "target in sight for long enough to shoot a powerful " +
        "arrow of darkness, and slowing you down in combat " +
        "afterwards."
, element: 'dark'
, charClass: 'archer'
, target: 'enemy'
, singleUse: true
, turns: 1                      ///////
, animation: 'shoot'
, onSkillbook: true
, apply: function (caster, target) {
  var attack = rangedAttack(caster);
  var i = 0;
  var totalDamage = 0.0;
  var el = '';

  for (i = 0; i < element.types.length; ++i) {
    el = element.types[i];
    if (!attack[el]) continue;
    totalDamage += attack[el];
  }
  totalDamage *= 2;

  var dmg = element.computeDamage(target.resists(), {dark: totalDamage});
  target.dealDamage(dmg);

  caster.slowDown(20);
}
};

/*-----------------------------------------------------------------------------
Chaos
-----------------------------------------------------------------------------*/

skills.berserk =
{ name: "Berserk"
, desc: "Convert all damage to Chaos and hit all opponents, then " +
        "speed yourself up afterwards."
, element: 'chaos'
, charClass: 'fighter'
, target: 'enemies'
, animation: 'slash'
, singleUse: true
, onSkillbook: true
, apply: function (caster, targets) {
  var attack = meleeAttack(caster);
  var totalAttack = 0.0;
  var i = 0;
  var el = '';
  var finAttack = {};
  var target = null;

  for (i = 0; i < element.types.length; ++i) {
    el = element.types[i];
    totalAttack += attack[el];
  }
  if (caster.element() == 'chaos') {
    totalAttack *= 1.05;
  }
  finAttack.chaos = totalAttack / 5;

  for (i = 0; i < targets.length; ++i) {
    target = targets[i];
    var dmg = element.computeDamage(target.resists(), finAttack);
    target.dealDamage(dmg);
  }

  caster.speedUp(20);
}
};

skills.chaoticbolt =
{ name: "Chaotic Bolt"
, desc: "An erratic bolt that deals random damage " +
        "of various types, mostly Chaos, to all opponents."
, element: 'chaos'
, charClass: 'mage'
, target: 'enemies'
, animation: 'spellcast'
, onScroll: true
, onSkillbook: true
, apply: function (caster, targets) {
  var i = 0;
  var maxDamage = caster.stats().magic * 1.2;
  var target = null;
  var e = 0;
  var el = '';
  var attack = null;
  var dmg = 0.0;

  if (caster.element() === 'chaos') {
    maxDamage *= 1.2;
  }

  for (i = 0; i < targets.length; ++i) {
    target = targets[i];
    if (Math.random() > 0.25) {
      el = 'chaos';
    } else {
      e = Math.floor(element.types.length * Math.random());
      el = element.types[e];
    }
    attack = {};
    attack[el] = Math.floor(maxDamage * Math.random()) + 1;
    dmg = element.computeDamage(target.resists(), attack);
    target.dealDamage(dmg);
  }
}
};

skills.multishoot =
{ name: "Multiple Shot"
, desc: "Hit all opponents with a ranged weapon, with a " +
        "damage penalty except for Chaos damage."
, element: 'chaos'
, charClass: 'archer'
, target: 'enemies'
, animation: 'shoot'
, onSkillbook: true
, apply: function (caster, targets) {
  var attack = rangedAttack(caster);
  var i = 0;
  var el = '';
  for (i = 0; i < element.types.length; ++i) {
    el = element.types[i];
    if (!attack[el]) continue;
    if (el === 'chaos') continue;
    attack[el] *= 0.25;
  }
  var target = null;
  for (i = 0; i < targets.length; ++i) {
    target = targets[i];
    var dmg = element.computeDamage(target.resists(), attack);
    target.dealDamage(dmg);
  }
}
};

/*-----------------------------------------------------------------------------
Life
-----------------------------------------------------------------------------*/

skills.heal =
{ name: "Heal"
, desc: "Heal an ally."
, element: 'life'
, charClass: 'mage'
, target: 'ally'
, animation: 'spellcast'
, onSkillbook: true
, onScroll: true
, apply: function (caster, target) {
  var healing = caster.stats().magic / 2;
  if (caster.element() === 'life') {
    healing *= 1.2;
  }
  if (element.areAllied('life', target.element())) {
    healing *= 1.2;
  }
  target.heal(healing);
}
};

skills.drain =
{ name: "Drain"
, desc: "Deal Life damage magically to an opponent, and heal " +
        "yourself."
, element: 'life'
, charClass: 'any'
, target: 'enemy'
, animation: 'spellcast'
, onSkillbook: true
, onScroll: true
, apply: function (caster, target) {
  var baseDamage = caster.stats().magic * 0.75;
  if (caster.element() === 'life') {
    baseDamage *= 1.1;
  }
  var attack = {life: baseDamage};
  var dmg = element.computeDamage(target.resists(), attack);
  target.dealDamage(dmg);
  caster.heal(dmg / 4);
}
};


return skills;
});
