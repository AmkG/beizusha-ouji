/* ui/CombatScreen/Timeline.js - a timeline on the combat
   screen.  */
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
define(['pixi', 'ui/CombatScreen/speed'], function (PIXI, slib) {
"use strict";

/*
var tl = new Timeline();
- Create a new timeline at the given location.
- Speed defaults to 100 and nextTurn defaults to 100.
- Timelines have width 64 and height 248.

tl.pixiObj();
- Return the PIXI drawing object for this timeline.

tl.hide();
tl.show();
- Hide or show the timeline.
- Default to shown.

tl.setSpeed(120);
tl.getSpeed();
tl.setNextTurn(65);
tl.getNextTurn();
- Access the speed and time to next turn.
- Changing speed via this API does not affect next turn
  time.

tl.getTimeBetweenTurns();
- Return the time between turns given the current speed.

tl.animateChange(deltaSpeed, deltaNextTurn, function () {
  // ...
});
- Animate changing to the new speed and new next turn
  time.
- Provide a delta or change in speed and next turn.
- A delta in speed here implies a delta in next turn, in
  addition to a delta in the given next-turn value.
- Call the given continuation function when animation
  completes.
- At end of animation, the .getSpeed() and .getNextTurn()
  methods will provide the correct values.

tl.animateAdvance(deltaNextTurn, function () {
  // ...
});
- Animate advancing the timeline by the number of time
  units given.
- Call the given continuation function when animation
  completes.

tl.animateHide(function () {
});
- Animate hiding the timeline.
- Call the given continuation function when animation
  completes.

tl.update()
- Update animation status.
*/

// Speeds.
var changeSpeed = 0.08;
var advanceSpeed = 2.0;
var hideSpeed = 0.07;

// Colors.
var timelineSideColor       = 0xC0E0FF;
var timelineCenterColor     = 0xE0F0FF;
var turnpointBorderColor    = 0xC0E0FF;
var turnpointCenterColor    = 0xF0F0F0;
// Dimensions.
var timelineWidth           = 8;
var timelineHeight          = 248;
var timelineSideWidth       = 2;
var turnpointWidth          = 32;
var turnpointHeight         = 10;
var turnpointCornerRadius   = 4.5;
var turnpointBorderWidth    = 2;
// Conversion from time units to pixel coords.
var timePixels              = 0.75;

function nullFun() {}

var timeFromSpeed = slib.timeFromSpeed;
var changeNextTurn = slib.changeNextTurn;

function Timeline() {
  // Core settings.
  this._speed = 100.0;
  this._next = 100.0;

  this._animating = 'none';
  // Use in 'change' animation.  ._targetNext is also
  // used in 'advance' animation.
  this._startSpeed = 100.0;
  this._startNext = 100.0;
  this._targetSpeed = 0.0;
  this._targetNext = 0.0;
  this._progress = 0.0;
  // Used in 'hide' animation.
  this._alpha = 0.0;
  // Callback for animation end.
  this._callback = nullFun;

  // Flag to determine if updating is needed.
  this._updateFlag = true;

  // The PIXI container known by the client.
  this._pixi = new PIXI.DisplayObjectContainer();
  // The actual PIXI container that actually contains
  // the items we need.
  this._top = new PIXI.DisplayObjectContainer();
  this._pixi.addChild(this._top);

  // The timeline background.
  this._timeline = new PIXI.Graphics();
  (function (tl){ // tl = this._timeline
  // Draw center.
  tl.beginFill(timelineCenterColor, 1.0);
  tl.lineStyle(0, timelineCenterColor, 1.0);
  tl.drawRect(0,0, timelineWidth,timelineHeight);
  tl.endFill();
  // Draw sides.
  tl.lineStyle(timelineSideWidth, timelineSideColor, 1.0);
  // Left side
  tl.moveTo(0, 0);
  tl.lineTo(0, timelineHeight - 1);
  // Right side
  tl.moveTo(timelineWidth - 1, 0);
  tl.lineTo(timelineWidth - 1, timelineHeight - 1);
  })(this._timeline);
  this._top.addChild(this._timeline);
  // Position the timeline
  this._timeline.x = (64 - this._timeline.width) / 2;

  // The turn point rectangles.
  this._turnpoints = [];

  updateView(this);
}

Timeline.prototype.pixiObj = function () {
  return this._pixi;
};

Timeline.prototype.hide = function () {
  this._top.visible = false;
  this._alpha = 0.0;
  this._updateFlag = true;
  return this;
};
Timeline.prototype.show = function () {
  this._top.visible = true;
  this._alpha = 1.0;
  this._top.alpha = 1.0;
  this._updateFlag = true;
  return this;
};

Timeline.prototype.getSpeed = function () {
  return this._speed;
};
Timeline.prototype.getNextTurn = function () {
  return this._next;
};
Timeline.prototype.setSpeed = function (s) {
  this._speed = s;
  this._updateFlag = true;
  return this;
};
Timeline.prototype.setNextTurn = function (n) {
  this._next = n;
  this._updateFlag = true;
  return this;
};

Timeline.prototype.getTimeBetweenTurns = function () {
  return timeFromSpeed(this._speed);
};

Timeline.prototype.animateChange = function (dS, dN, k) {
  if (this._animating !== 'none') {
    throw new Error("Timeline: animateChange: " +
                    "Animation on-going.");
  }
  this._animating = 'change';
  if (dS !== 0) {
    // A change in speed also implies a change in
    // next-turn.  Compute an additional change in
    // next-turn.
    var newnt = changeNextTurn( this._next
                              , this._speed
                              , this._speed + dS
                              );
    var changent = newnt - curnt;
    dN += changent;
  }
  this._startSpeed = this._speed;
  this._startNext = this._next;
  this._targetSpeed = this._speed + dS;
  this._targetNext = this._next + dN;
  this._progress = 0.0;
  this._alpha = 1.0;
  this._callback = k;

  return this;
};
Timeline.prototype.animateAdvance = function (dN, k) {
  if (this._animating !== 'none') {
    throw new Error("Timeline: animateAdvance: " +
                    "Animation on-going.");
  }
  if (this._next < dN) {
    throw new Error("Timeline: animateAdvance: " +
                    "Can't go beyond next turn.");
  }
  this._animating = 'advance';
  this._targetNext = this._next - dN;
  this._alpha = 1.0;
  this._callback = k;

  return this;
};
Timeline.prototype.animateHide = function (k) {
  if (this._animating !== 'none') {
    throw new Error("Timeline: animateHide: " +
                    "Animation on-going.");
  }
  this._animating = 'hide';
  this._alpha = 1.0;
  this._callback = k;

  return this;
};

// Private function to actually update the timepoints
// and alpha.
function updateView(self) {
  // Add another turnpoint.
  function makeTurnpoint() {
    var tp = new PIXI.Graphics();
    tp.beginFill(turnpointCenterColor, 1.0);
    tp.lineStyle(turnpointBorderWidth, turnpointBorderColor, 1.0);
    tp.drawRoundedRect(0,0
      , turnpointWidth,turnpointHeight
      , turnpointCornerRadius
    );
    tp.endFill();
    self._top.addChild(tp);
    self._turnpoints.push(tp);
  }
  function setTurnpoint(i, y) {
    var tp = self._turnpoints[i];
    tp.visible = true;
    tp.x = (64 - tp.width) / 2;
    tp.y = y - (tp.height / 2);
  }
  function clearTurnpoint(i) {
    var tp = self._turnpoints[i];
    tp.visible = false;
  }
  // Position turnpoint.
  var betweenTurns = self.getTimeBetweenTurns();
  var distTurns = betweenTurns * timePixels;
  var turns = Math.ceil(timelineHeight / distTurns) + 1;
  var i = 0;
  var y = 0;
  // Fill in turnpoints.
  while(self._turnpoints.length < turns) {
    makeTurnpoint();
  }
  // Position the turnpoints.
  y = self.getNextTurn() * timePixels;
  for (i = 0; i < turns; ++i) {
    setTurnpoint(i, timelineHeight - y);
    y += distTurns;
  }
  // Hide extra turnpoints;
  for (i = turns; i < self._turnpoints.length; ++i) {
    clearTurnpoint(i);
  }
  // Set the alpha.
  self._top.alpha = self._alpha;
}

Timeline.prototype.update = function () {
  var toCall = nullFun;
  if (this._animating === 'none') {
    /* Do nothing.  */
  } else if (this._animating === 'change') {
    this._progress += changeSpeed;
    if (this._progress >= 1.0) {
      this._progress = 1.0;
      toCall = this._callback;
      this._callback = nullFun;
      this._animating = 'none';
      this._speed = this._targetSpeed;
      this._next = this._targetNext;
    } else {
      this._speed = this._startSpeed +
        (this._targetSpeed - this._startSpeed) * this._progress;
      this._next = this._startNext +
        (this._targetNext - this._startNext) * this._progress;
    }
    this._updateFlag = true;
  } else if (this._animating === 'advance') {
    this._next -= advanceSpeed;
    if (this._next <= this._targetNext) {
      this._next = this._targetNext;
      toCall = this._callback;
      this._callback = nullFun;
      this._animating = 'none';
    } else {
      /* Do nothing.  */
    }
    this._updateFlag = true;
  } else if (this._animating === 'hide') {
    this._alpha -= hideSpeed;
    if (this._alpha <= 0.0) {
      this._alph = 0.0;
      toCall = this._callback;
      this._callback = nullFun;
      this._animating = 'none';
    } else {
      /* Do nothing.  */
    }
    this._updateFlag = true;
  }
  if (this._updateFlag) {
    this._updateFlag = false;
    updateView(this);
  }
  toCall();
  return this;
};

return Timeline;
});
