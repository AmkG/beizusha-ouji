/* ssdb.js - spritesheet database.  */
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
define(['spritesheet', 'pixi', 'util/Table'], function (ss, PIXI, Table) {
"use strict";

/*
var prince = ssdb("prince");
- Returns a spritesheet object for the given string key.
- Note that the spritesheet might not be ready for actual
  usage if you use this interface.

var princeAssets = ssdb.assets("prince");
- Returns an Array containing the assets for the given
  spritesheet object.

ssdb.async("prince", function (prince) {
  // ...
});
- Asynchronously get spritesheets.

*/

var FullSheet = ss.FullSheet;
var WalkCycle = ss.WalkCycle;

/* The main table.  */
var tb = new Table();

function withAsset(assets, obj) {
  obj.assets = assets;
  return obj;
}
function fromFullSheet(asset) {
  return withAsset([asset], new FullSheet(asset));
}
function fromFullCycle(asset) {
  return withAsset([asset], new WalkCycle(asset));
}

/*-----------------------------------------------------------------------------
Main Characters
-----------------------------------------------------------------------------*/

/* Main 4.  */
tb.set('prince',       fromFullSheet('img/prince.png'));
tb.set('priestess',    fromFullSheet('img/priestess.png'));
tb.set('elvenarcher',  fromFullSheet('img/elvenarcher.png'));
tb.set('sidekick',     fromFullSheet('img/sidekick.png'));

/* Other important characters.  */
tb.set('oldprior',     fromFullSheet('img/oldprior.png'));
tb.set('barbarian',    fromFullSheet('img/barbarian.png'));

/*-----------------------------------------------------------------------------
API
-----------------------------------------------------------------------------*/

function ssdb(key) {
  if (tb.has(key)) {
    return tb.get(key).clone();
  } else {
    throw new Error("ssdb: Unknown spritesheet: '" + key + "'");
  }
}
ssdb.assets = function (key) {
  if (tb.has(key)) {
    return tb.get(key).assets;
  } else {
    throw new Error("ssdb.assets: Unknown spritesheet: '" + key + "'");
  }
};
ssdb.async = function (key, k) {
  if (tb.has(key)) {
    var assets = ssdb.assets(key);
    var loader = newPIXI.AssetLoader(assets);
    loader.onComplete = function () {
      k(ssdb(key));
    };
    loader.load();
  } else {
    throw new Error("ssdb.async: Unknown spritesheet: '" + key + "'");
  }
};

return ssdb;
});
