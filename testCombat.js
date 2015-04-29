/* testCombat.js - A screen for testing ui/CombatScreen.js.  */
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
define(['ui/CombatScreen', 'ssdb', 'mechanics/skills'],
function (CS             ,  ssdb , skills) {
"use strict";

var cs = new CS(
{ spritesheets: function (n, k) {
    ssdb.async(n, k);
  }
, skills: function (n) {
    return skills[n];
  }
, items: function (n) {
    // TODO
    return {};
  }
, onWin: 'testCombatEnd'
, onLose: 'testCombatEnd'
, onExit: 'screen/mainMenu'
});

// Combat scenario.
var combat =
{ players:
  [ { name: "Hector"
    , speed: 10
    , life: 100
    , spritesheet: "prince"
    , resists: { normal: 22, order: 4, light: 4}
    , damage: { normal: 18, order: 5 }
    , element: 'order'
    , skills: [ 'slash', 'prismatic', 'justice', 'blackblade' ]
    }
  , { name: "Eowylle"
    , speed: 15
    , life: 100
    , spritesheet: "elvenarcher"
    , resists: { normal: 18, life: 6}
    , damage: { normal: 20, life: 4 }
    , element: 'life'
    , skills: [ 'shoot', 'multishoot', 'lightarrow' ]
    }
  , { name: "Rand"
    , speed: 0
    , life: 100
    , spritesheet: "sidekick"
    , rests: { normal: 24, dark: 9 }
    , damage: { normal: 18, dark: 22 }
    , element: 'dark'
    , skills: [ 'slash', 'terrify', 'blackblade']
    }
  ]
, playerItems:
  []

, enemies:
  [ { name: "Aura"
    , speed: 0
    , life: 100
    , spritesheet: "priestess"
    , resists: { normal: 30, light: 11 }
    , damage: { }
    , element: 'light'
    , skills: [ 'flash', 'heal', 'impositionoflaw', 'drain' ]
    }
  ]
};

function wrapAPI(api) {
  var rv = Object.create(api);
  rv.gameState = api.state.testCombat;
  return rv;
}

var screen = {};
screen.enter = function (api) {
  if (!api.state.testCombat) {
    api.state.testCombat = {};
  }
  if (!api.state.testCombat.combat) {
    // Install combat scenario.
    api.state.testCombat.combat =
      JSON.parse(JSON.stringify(combat))
      ;
  } else {
    console.log(JSON.stringify(api.state.testCombat.combat));
  }
  cs.enter(wrapAPI(api));
};
screen.update = function (api) {
  cs.update(wrapAPI(api));
};
screen.leave = function (api) {
  cs.leave(wrapAPI(api));
};

return screen;
});
