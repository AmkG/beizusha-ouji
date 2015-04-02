/* mechanics/element.js - Elemental alignments.  */
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
(function(factory){
  if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else if (typeof require !== 'undefined') {
    factory(exports);
  }
})(function(exports) {
"use strict";

var types =
  [ 'normal'
  , 'light'
  , 'order'
  , 'dark'
  , 'chaos'
  , 'life'
  ];
exports.types = types;

/*-----------------------------------------------------------------------------
Allied elements
-----------------------------------------------------------------------------*/

function mkAllyKey(t1, t2) {
  if (t1 > t2) {
    var tmp = t1;
    t1 = t2;
    t2 = tmp;
  }
  return t1 + "_" + t2;
}
var alliedTb = Object.create(null);
(function(){
function allied(t1, t2) {
  alliedTb[mkAllyKey(t1, t2)] = true;
}
/* normal is allied to all non-normal elements.  */
allied('normal', 'light');
allied('normal', 'order');
allied('normal', 'dark');
allied('normal', 'chaos');
allied('normal', 'life');
/* Non-normal elements form a cycle, and an element is
   allied to elements on both sides.  */
allied('light', 'order');
allied('order', 'dark');
allied('dark', 'chaos');
allied('chaos', 'life');
allied('life', 'light');
})();

exports.areAllied = function(t1, t2) {
  return !!alliedTb[mkAllyKey(t1, t2)];
};
exports.areOpposed = function(t1, t2) {
  return !alliedTb[mkAllyKey(t1, t2)];
};

/*-----------------------------------------------------------------------------
Damage and Resist
-----------------------------------------------------------------------------*/
/*
Characters have resistances to each element type, and an attack
may have various element damages.  Resistances usually reduce the
damage received, but there is a cycle of damage types where
higher resistances will increase damage instead of reducing it.

For example, dark is vulnerable to light, so higher dark resistance
means more light damage rather than less.
*/
var resistTB =
           /* nm lt or dk ch lf <-- attack type.  */
/*normal*/ [ [ 1,.5,.5,.5,.5,.5]
/*light*/  , [ 1, 1, 1, 2,-1, 1]
/*order*/  , [ 1, 1, 1, 1, 2,-1]
/*dark*/   , [ 1,-1, 1, 1, 1, 2]
/*chaos*/  , [ 1, 2,-1, 1, 1, 1]
/*life*/   , [ 1, 1, 2,-1, 1, 1]
/* ^ */    ];
/* | */
/* resist type.  */

var hasM = Object.prototype.hasOwnProperty;
function has(o, k) {
  return hasM.call(o, k);
}

exports.computeDamage = function (resists, attack) {
  var a = 0;
  var atype = '';
  var aval = 0.0;
  var r = 0;
  var rtype = '';
  var rval = 0.0;

  var total = 0.0;
  for (a = 0; a < types.length; ++a) {
    atype = types[a];
    if (!has(attack, atype)) continue;
    aval = attack[atype];

    rval = 0.0;
    for (r = 0; r < types.length; ++r) {
      rtype = types[r];
      if (!has(resists, rtype)) continue;
      rval += resists[rtype] * resistTB[r][a];
    }

    if (rval < 0.0) {
      /* If negative resist, add it directly.  */
      total += aval - rval;
    } else {
      total += aval * aval / (aval + rval);
    }
  }
  return total;
};

return exports;
});
