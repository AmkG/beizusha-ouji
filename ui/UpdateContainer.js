/* ui/UpdateContainer.js - An object that calls .update()
   methods on its children.  */
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
(function (factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof require !== 'undefined') {
    module.exports = factory();
  }
})(function () {
"use strict";

function UpdateContainer() {
  this._children = [];
}
UpdateContainer.prototype.addChild = function (ch) {
  this._children.push(ch);
  return this;
};
UpdateContainer.prototype.update = function () {
  if (this._children.length === 0) {
    return this;
  }
  var args = Array.prototype.slice.call(arguments);
  var i = 0;
  for (i = 0; i < this._children.length; ++i) {
    var child = this._children[i];
    child.update.apply(child, args);
  }
  return this;
};

return UpdateContainer;
});
