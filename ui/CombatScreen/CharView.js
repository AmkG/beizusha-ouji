/* ui/CombatScreen/CharView.js - A combat view of a
   character.  This mostly serves as a collection.  */
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
var cview = new CharView(96);
- Create a character combat view.
- Argument is the distance of the sprite from the bottom of the
  timeline.
- This primarily serves as a single access point for view
  components of the character.

cview.pixiObj();
- Return the PIXI drawing object for the view.

cview.setSprite(sprite);
- Set the spritesheet for the character view.

cview.clearSprite();
- Remove the spritesheet for the character view.

cview.enable();
cview.disable();
- Hide or show the entire character view.

cview.sprite
- The spritesheet component.

cview.timeline
- The Timeline component.

cview.lifemeter
- The LifeMeter component.

cview.update()
- Call update on each component.
*/

var PIXI = require('pixi');
var Timeline = require('ui/CombatScreen/Timeline');
var LifeMeter = require('ui/CombatScreen/LifeMeter');

function CharView(charOffset) {
  this._pixi = new PIXI.DisplayObjectContainer();

  this.timeline = new Timeline();
  this._pixi.addChild(this.timeline.pixiObj());

  this._spriteContainer = new PIXI.DisplayObjectContainer();
  this._spriteContainer.y = this.timeline.pixiObj().height +
                            charOffset ;
  this._pixi.addChild(this._spriteContainer);
  this.sprite = null;

  this.lifemeter = new LifeMeter();
  this.lifemeter.pixiObj().y = this.timeline.pixiObj().height +
                               charOffset +
                               64 - this.lifemeter.pixiObj().height ;
  this._pixi.addChild(this.lifemeter.pixiObj());
}
CharView.prototype.pixiObj = function () {
  return this._pixi;
};
CharView.prototype.setSprite = function (sprite) {
  this.sprite = sprite;
  this._spriteContainer.removeChildren();
  this._spriteContainer.addChild(sprite.pixiObj());
  return this;
};
CharView.prototype.clearSprite = function () {
  this.sprite = null;
  this._spriteContainer.removeChildren();
  return this;
};
CharView.prototype.disable = function () {
  this._pixi.visible = false;
  return this;
};
CharView.prototype.enable = function () {
  this._pixi.visible = true;
  return this;
};
CharView.prototype.update = function () {
  this.timeline.update();
  this.lifemeter.update();
  if (this.sprite) this.sprite.update();
};

return CharView;
});
