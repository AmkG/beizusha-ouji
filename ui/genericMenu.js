/* ui/genericMenu.js - a generic menu handler.  */
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

/*
var menu = new genericMenu.Class({
  stageBackgroundColor: 0xFFFFFF,
  items: [
    "Item 1",
    "Item 2",
    "Item 3"
  ],
  backgroundColor: 0x000000,
  backgroundAlpha: 0.5,
  selectColor: 0x80C080,
  textColor: 0xFFFFFF,
  selectTextColor: 0xFFFFFF,
  minWidth: 200
});
- Construct a new menu.
- stageBackgroundColor: the color to set as the stage background
  color on entry.  If not specified, the stage background color
  is not modified.
- items: An array of strings specifying the options.  If not
  specified, call the .setItems() method below before calling
  any of the API methods.
- backgroundColor: the color of the menu's background.  Default
  black.
- backgroundAlpha: the alpha of the menu's background.  Default
  0.5.
- selectColor: the background color of the selected item.
  Default 0x80C080.
- textColor: the color of unselected items.  Default 0xFFFFFF.
- selectTextColor: the color of selected items.  Default
  0xFFFFFF.
- minWidth: the minimum width of the menu.  Default 200.

menu.setItems(["Item 1", "Item 2"]);
- Sets the items.
- NOTE!  Should not be used while the menu is displayed.

menu.enter(api);
- Enters the menu (displays the menu).
- The API given should be the engine API for entry.
- This should be called after the background elements
  have been put.

var result = menu.update(api);
- Updates the menu.
- The API given should be the engine API for update.
- Returns -1 if no item selected yet, or the numeric index of
  the user's selection.  Note that if the result is 0 or
  positive, the menu has been removed already.

menu.leave(api);
- Removes the menu if it is still connected.
*/

var menuSidePadding = 20;
var menuVertPadding = 20;
var itemPadding = 5;

var fadeInStep = 0.09;
var blinkingStep = 0.105;
var fadeOutStep = 0.15;

// Converts a numeric RGB value to a "#000000" equivalent.
var hexes = [ '0', '1', '2', '3', '4', '5', '6', '7'
            , '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];
function num2hex(rgb) {
  function hex2(n) {
    return "" + hexes[(n >>> 4) & 0xF] + hexes[n & 0xF];
  }
  return "#" + hex2(rgb >>> 16) + hex2(rgb >>> 8) + hex2(rgb);
}

function Class(options) {
  this._sbgcSet = false;
  this._sbgc = 0xFFFFFF;
  if (typeof options.stageBackgroundColor !== "undefined") {
    this._sbgcSet = true;
    this._sbgc = options.stageBackgroundColor;
  }

  this._items = [];
  if (typeof options.items !== "undefined") {
    this._items = options.items;
  }

  this._bgc = 0x000000;
  if (typeof options.backgroudnColor !== "undefined") {
    this._bgc = options.backgroundColor;
  }
  this._bga = 0.5;
  if (typeof options.backgroundAlpha !== "undefined") {
    this._bga = options.backgroundAlpha;
  }
  this._selc = 0x80C080;
  if (typeof options.selectColor !== "undefined") {
    this._selc = options.selectColor;
  }
  this._txtc = "#FFFFFF";
  if (typeof options.textColor !== "undefined") {
    this._txtc = num2hex(options.textColor);
  }
  this._stxtc = "#FFFFFF";
  if (typeof options.selectTextColor !== "undefined") {
    this._stxtc = num2hex(options.selectTextColor);
  }
  this._minWidth = 200;
  if (typeof options.minWidth !== "undefined") {
    this._minWidth = options.minWidth;
  }

  /* The PIXI.Text objects for each item.  */
  this._itemTexts = [];
  this._itemSelectTexts = [];
  /* The menu's container.  */
  this._menuTop = null;
  /* The selector graphic.  */
  this._selector = null;

  /* State of the generic menu.  */
  this._sel = 0;
  this._state = "fadein";
  this._progress = 0;
}
Class.prototype.setItems = function (items) {
  this.leave(null);
  this._items = items;
  this._itemTexts = [];
  this._itemSelectTexts = [];
  this._menuTop = null;
  this._selector = null;
  return this;
};
Class.prototype.enter = function (api) {
  var i;
  var width;
  var height;
  var textheight;

  var t;
  var ts;
  var item;

  var menuBak;
  var selector;

  if (this._sbgcSet) {
    api.stage.setBackgroundColor(this._sbgc);
  }
  if (!this._menuTop) {
    // Construct the menu's top object.
    this._menuTop = new PIXI.DisplayObjectContainer();

    // The initial width is the minimum width.
    width = this._minWidth;
    // The initial height is some padding.
    height = menuVertPadding / 2;

    // Construct the texts.
    this._itemTexts = [];
    this._itemSelectTexts = [];
    for (i = 0; i < this._items.length; ++i) {
      item = this._items[i];

      t = new PIXI.Text(item, {
        font: "28px serif",
        fill: this._txtc,
        stroke: this._txtc
      });
      t.scale.x = 0.5;
      t.scale.y = 0.5;
      t.y = height; // Position the text.
      this._itemTexts.push(t);

      ts = new PIXI.Text(item, {
        font: "28px serif",
        fill: this._stxtc,
        stroke: this._stxtc
      });
      ts.scale.x = 0.5;
      ts.scale.y = 0.5;
      ts.y = height; // Position the text.
      this._itemSelectTexts.push(ts);

      if (t.width + 20 > width) {
        width = t.width + 20;
      }
      height += t.height + itemPadding;

      textheight = t.height;
    }
    // Compensate extra item padding.
    height -= itemPadding;
    // Adjust height.
    height += menuVertPadding / 2;

    // Center the location of the items.
    for (i = 0; i < this._itemTexts.length; ++i) {
      t = this._itemTexts[i];
      t.x = (width - t.width) / 2;
      ts = this._itemSelectTexts[i];
      ts.x = (width - ts.width) / 2;
    }

    // Construct the background.
    menuBak = new PIXI.Graphics();
    menuBak.beginFill(this._bgc, this._bga);
    menuBak.lineStyle(0, this._bgc, this._bga);
    menuBak.drawRect(0,0, width, height);
    menuBak.endFill();
    // Construct the selector.
    selector = new PIXI.Graphics();
    selector.beginFill(this._selc, 1.0);
    selector.lineStyle(0, this._selc, 1.0);
    selector.drawRect(0,0, width, textheight);
    selector.endFill();
    this._selector = selector;

    // Add the items in the correct draw order.
    this._menuTop.addChild(menuBak);
    this._menuTop.addChild(selector);
    for (i = 0; i < this._itemTexts.length; ++i) {
      this._menuTop.addChild(this._itemTexts[i]);
      this._menuTop.addChild(this._itemSelectTexts[i]);
    }

    // Center the menu.
    this._menuTop.x = (640 - this._menuTop.width) / 2;
    this._menuTop.y = (360 - this._menuTop.height) / 2;
  }

  /* Set visibilities.  */
  this._selector.visible = false;
  for (i = 0; i < this._itemTexts.length; ++i) {
    this._itemTexts[i].visible = true;
    this._itemSelectTexts[i].visible = false;
  }

  api.top.addChild(this._menuTop);
  this._menuTop.alpha = 0.0;

  this._sel = 0;
  this._state = "fadein";
  this._progress = 0.0;
};
/* Used to update the selection.  */
function select(self, i) {
  // Clear the old selection.
  self._itemTexts[self._sel].visible = true;
  self._itemSelectTexts[self._sel].visible = false;
  // Set the new selection.
  self._sel = i;
  self._selector.y = self._itemTexts[i].y;
  self._selector.visible = true;
  self._itemTexts[i].visible = false;
  self._itemSelectTexts[i].visible = true;
}
Class.prototype.update = function (api) {
  var nsel;
  if (this._state === "fadein") {
    this._progress += fadeInStep;
    if (this._progress >= 1.0) {
      this._menuTop.alpha = 1.0;
      this._progress = 0.0;
      this._state = "selecting"
      select(this, 0);
    } else {
      this._menuTop.alpha = this._progress;
    }
    return -1;
  } else if (this._state === "selecting") {
    if (api.input.up) {
      nsel = this._sel - 1;
      if (nsel < 0) nsel = this._itemTexts.length - 1;
      select(this, nsel);
    } else if (api.input.down) {
      nsel = this._sel + 1;
      if (nsel >= this._itemTexts.length) nsel = 0;
      select(this, nsel);
    } else if (api.input.enter) {
      this._state = "blinking";
      this._progress = 0.0;
    }
    return -1;
  } else if (this._state === "blinking") {
    this._progress += blinkingStep;
    if (this._progress < 0.16 ||
        (0.33 < this._progress && this._progress < 0.5) ||
        (0.66 < this._progress && this._progress < 0.83)) {
      this._selector.visible = false;
    } else {
      this._selector.visible = true;
    }
    if (this._progress >= 1.0) {
      this._state = "fadeout";
      this._progress = 0.0;
    }
    return -1;
  } else if (this._state === "fadeout") {
    this._progress += fadeOutStep;
    if (this._progress >= 1.0) {
      this._menuTop.parent.removeChild(this._menuTop);
      this._progress = 0.0;
      this._state = "finish";
    } else {
      this._menuTop.alpha = 1.0 - this._progress;
    }
    return -1;
  } else {
    return this._sel;
  }
};
Class.prototype.leave = function (api) {
  if (this._menuTop.parent) {
    this._menuTop.parent.removeChild(this._menuTop);
  }
  this._state = "fadein";
  return this;
};

return { Class      : Class
       };
});
