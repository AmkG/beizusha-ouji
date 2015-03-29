/* screen/credits.js - credits screen entry.  */
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
define(['pixi'], function (PIXI) {
"use strict";

var programmerPage =
  { name: "Design and Coding"
  , lines:
      [ {size: "big", text: "Design"}
      , {size: "normal", text: "Alan Manuel K. Gloria"}
      , {size: "small", text: " "}
      , {size: "big", text: "Programming"}
      , {size: "normal", text: "Alan Manuel K. Gloria"}
      , {size: "small", text: " "}
      , {size: "small", text: "Program source code Copyright 2015 Alan Manuel K. Gloria"}
      ]
  };
var charArtistPage =
  { name: "Character Art"
  , lines:
    [ {size: "big", text: "Universal LPC Spritesheet"}
    , {size: "normal", text: "Matthew Krohn"}
    , {size: "normal", text: "Luke Mehl"}
    , {size: "normal", text: "Johannes Sjölund"}
    , {size: "normal", text: "Marcel van de Steeg"}
    , {size: "normal", text: "Manuel Riecke"}
    , {size: "normal", text: "Thane Brimhall"}
    , {size: "normal", text: "Lori Angela Nagel"}
    , {size: "normal", text: "Lanea Zimmerman (\"Sharm\")"}
    , {size: "normal", text: "Stephen Challener (\"Redshrike\")"}
    , {size: "normal", text: "Daniel Eddeland"}
    , {size: "normal", text: "Shaun Williams"}
    , {size: "normal", text: "Joe White"}
    , {size: "normal", text: "Barbara Rivera"}
    , {size: "normal", text: "JRConway3"}
    , {size: "normal", text: "JaidynReiman"}
    , {size: "normal", text: "Nila122"}
    , {size: "normal", text: "neo4cat6"}
    , {size: "big", text: "Char Generator based on Universal LPC Spritesheet"}
    , {size: "normal", text: "Gaurav Munjal"}
    , {size: "small", text: " "}
    , {size: "small", text: "Liberated Pixel Cup was an event hosted by OpenGameArt.org"}
    , {size: "small", text: "LPC Assets are licensed under CC-BY-SA 3.0 and GPLv3"}
    ]
  };

/* Accepts a page object and creates a PIXI display object
   containing the page's contents.  */
function makeCreditPage(page, number, total) {
  var pageTop = new PIXI.DisplayObjectContainer();
  var lineTop = null;
  var txt = null;
  var lines = [];
  var line = null;
  var font = "";
  var i = 0;
  var y = 0.0;

  /* Page title.  */
  txt = new PIXI.Text(page.name, {
    font: "56px sans-serif"
  });
  txt.scale.x = 0.5;
  txt.scale.y = 0.5;
  txt.x = 5;
  txt.y = 5;
  pageTop.addChild(txt);

  /* Content lines.  */
  lines = page.lines;
  lineTop = new PIXI.DisplayObjectContainer();
  y = 0.0;
  for (i = 0; i < lines.length; ++i) {
    line = lines[i];
    switch (line.size) {
      case "big":    font = "bold 28px sans-serif"; break;
      case "small":  font = "14px serif"; break;
      case "normal":
      default:       font = "18px serif"; break;
    }
    if (line.size === "big") y += 4;
    txt = new PIXI.Text(line.text, {
      font: font,
      wordWrap: true,
      wordWrapWidth: 1000
    });
    txt.scale.x = 0.5;
    txt.scale.y = 0.5;
    txt.y = y;
    txt.x = Math.floor((640 - txt.width) / 2);
    lineTop.addChild(txt);
    y += txt.height;
  }
  lineTop.x = 0;
  lineTop.y = Math.floor((360 - lineTop.height) / 2);
  pageTop.addChild(lineTop);

  /* Page Number.  */
  txt = new PIXI.Text(number + " / " + total, {
    font: "28px sans-serif"
  });
  txt.scale.x = 0.5;
  txt.scale.y = 0.5;
  txt.x = 640 - txt.width - 5;
  txt.y = 360 - txt.height - 5;
  pageTop.addChild(txt);
  
  return pageTop;
}

var pages =
  [ programmerPage
  , charArtistPage
  ];

var pixiPages =
(function () {
var pixiPages = [];
var i;
for (i = 0; i < pages.length; ++i) {
  pixiPages.push(makeCreditPage(pages[i], i + 1, pages.length));
}
return pixiPages;
})();

/* Variables used when transitioning between pages.  */
var transitioning = false;
var progress = 0.0;
var dir = 0;

var transitionSpeed = 0.12;

var screen = {};
screen.enter = function (api) {
  /* Update state.  */
  var state = api.state;
  if (typeof state.creditsPageNo === "undefined") {
    state.creditsPageNo = 0;
  }
  if (state.creditsPageNo >= pages.length) {
    state.creditsPageNo = 0;
  }
  api.top.removeChildren();
  api.top.addChild(pixiPages[state.creditsPageNo]);
  pixiPages[state.creditsPageNo].alpha = 1.0;
  pixiPages[state.creditsPageNo].x = 0;
  pixiPages[state.creditsPageNo].y = 0;
  transitioning = false;
};

screen.update = function (api) {
  var state = api.state;
  if (api.input.esc || api.input.enter) {
    api.setScreen("screen/mainMenu");
    return;
  }
  if (transitioning) {
    var oldPage = pixiPages[state.creditsPageNo];
    var newPage = pixiPages[state.creditsPageNo + dir];
    if (!newPage.parent) {
      api.top.addChild(newPage);
    }

    progress += transitionSpeed;
    if (progress >= 1.0) {
      progress = 1.0;
      transitioning = false;
      api.top.removeChild(oldPage);
      newPage.alpha = 1.0;
      newPage.x = 0;
      state.creditsPageNo += dir;
      api.saveState();
    } else {
      oldPage.alpha = 1 - progress;
      oldPage.x = (-dir * 640) * progress;
      newPage.alpha = progress;
      newPage.x = (dir * 640) * (1 - progress);
    }
    return;
  }
  if (api.input.left) {
    if (state.creditsPageNo === 0) return;
    transitioning = true;
    progress = 0.0;
    dir = -1;
    return;
  }
  if (api.input.right) {
    if (state.creditsPageNo === pages.length - 1) return;
    transitioning = true;
    progress = 0.0;
    dir = 1;
    return;
  }
};
screen.leave = function(api) {
  delete api.state.creditsPageNo;
};

return screen;
});

