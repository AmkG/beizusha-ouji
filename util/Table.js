/* Table.js - Wrapper around objects to implement string->any tables.  */
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
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof require !== "undefined") {
    module.exports = factory();
  } else {
    Table = factory();
  }
})(function () {
"use strict";

var hasM = Object.prototype.hasOwnProperty;
function has(o, k) {
  return hasM.call(o, k);
}

function Table(orig) {
  this.length = 0;
  this._t = Object.create(null);
  if (orig) {
    for (var k in orig) {
      if (has(orig, k)) {
        this._t[k] = orig[k];
        ++this.length;
      }
    }
  }
}
Table.prototype.has = function (k) {
  return has(this._t, k);
};
Table.prototype.get = function (k) {
  return has(this._t, k) ? this._t[k] : undefined;
};
Table.prototype.set = function (k, v) {
  if (!has(this._t, k)) {
    ++this.length;
  }
  this._t[k] = v;
  return this;
};
Table.prototype.remove = function (k) {
  if (has(this._t, k)) {
    --this.length;
    delete this._t[k];
  }
  return this;
};
Table.prototype.keys = function () {
  return Object.keys(this._t);
};

return Table;
});
