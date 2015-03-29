/* testSprites.js - A screen for testing the sprite system.  */
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
define(['spritesheet'],
function(spritesheet) {

// Array of spritesheets.
// Will be filled in when first entered.
var ss = [];

// Directions to go to, in order.
// x and y are the starting offset.
// xP and yP and the offset as the animation progresses.
var dirs =
  [ { face: 'south', x: 0, y: 0, xP: 0, yP: 1}
  , { face: 'east' , x: 0, y: 1, xP: 1, yP: 0}
  , { face: 'north', x: 1, y: 1, xP: 0, yP:-1}
  , { face: 'west' , x: 1, y: 0, xP:-1, yP: 0}
  ];

/* Initiate movement in some direction.  */
function initiateMovement(dnum) {
  var dir = dirs[dnum];
  var i;

  for (i = 0; i < ss.length; ++i) {
    (function (i) {
    ss[i].face(dir.face);
    ss[i].walk({
      progress:function (p) {
        ss[i].pixiObj().y = 64 * i + 32 * dir.y + p * 32 * dir.yP;
        ss[i].pixiObj().x = 0      + 32 * dir.x + p * 32 * dir.xP;
      },
      finish: function () {
        var ndnum = dnum + 1;
        if (ndnum >= dirs.length) {
          ndnum = 0;
        }
        setImmediate(function() {
          initiateMovement(ndnum);
        });
      }
    });
    })(i);
  }
}

var screen = {};
screen.assets =
  [ 'img/prince.png'
  , 'img/priestess.png'
  , 'img/elvenarcher.png'
  , 'img/sidekick.png'
  ];
screen.enter = function (api) {
  var i;

  api.stage.setBackgroundColor(0xFFFFFF);
  api.top.removeChildren();
  if (ss.length === 0) {
    // Generate the sheets.
    for (i = 0; i < screen.assets.length; ++i) {
      ss.push(new spritesheet.FullSheet(screen.assets[i]));
    }
  }
  // Put the characters and position them.
  for (i = 0; i < ss.length; ++i) {
    api.top.addChild(ss[i].pixiObj());
    ss[i].pixiObj().x = 0;
    ss[i].pixiObj().y = i * 64;
    ss[i].face('south');
    ss[i].stop();
  }

  initiateMovement(0);
};
screen.update = function (api) {
  if (api.input.esc) {
    api.setScreen('screen/mainMenu');
  } else {
    var i;
    for (i = 0; i < ss.length; ++i) {
      ss[i].update();
    }
  }
}
screen.leave = function (api) {
  for (i = 0; i < ss.length; ++i) {
    ss[i].stop();
  }
}

return screen;
});
