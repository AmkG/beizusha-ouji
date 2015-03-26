/* engine/inputKeys.js - Handle keyboard input.  */
/**
 *
 * @licstart  The following is the entire license notice for the 
 *  JavaScript code in this page.
 *
 * Copyright (C) 2014, 2015  Alan Manuel K. Gloria
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
define([], function () {
"use strict";

var keys = {
    up: false,
    left: false,
    right: false,
    down: false,
    enter: false,
    esc: false
};
var lastkey = '';

/*
37 left
38 up
39 right
40 down
*/

function onkeydown(e) {
    e = e || window.event;

    if (e.charCode === 0) {
        // special key.
        switch (e.keyCode) {
        case 27:
            lastkey = '\e';
            break;
        case 13:
            lastkey = '\r';
            break;
        case 10:
            lastkey = '\n';
            break;
        case 37:
            keys.left = true;
            lastkey = 'left';
            break;
        case 38:
            keys.up = true;
            lastkey = 'up';
            break;
        case 39:
            keys.right = true;
            lastkey = 'right';
            break;
        case 40:
            keys.down = true;
            lastkey = 'down';
            break;
        default:
            lastkey = String.fromCharCode(e.keyCode);
        }
    } else {
        lastkey = String.fromCharCode(e.charCode);
    }
    if (lastkey === ' ' || lastkey === '\r' || lastkey === '\n') {
        keys.enter = true;
    } else if (lastkey === '\e') {
        keys.esc = true;
    }

    e.stopPropagation();
    e.preventDefault();

    return false;
}
function onkeypress(e) {
}
function onkeyup(e) {
    e = e || window.event;

    switch (e.keyCode) {
    case 37:
        keys.left = false;
        break;
    case 38:
        keys.up = false;
        break;
    case 39:
        keys.right = false;
        break;
    case 40:
        keys.down = false;
        break;
    }
    if (e.keyCode === 32 || e.charCode === 32 ||
        e.keyCode === 13 || e.charCode === 13 ||
        e.keyCode === 10 || e.charCode === 10) {
        keys.fire = false;
    } else if (e.keyCode === 27 || e.charCode === 27) {
        keys.esc = false;
    }

    e.stopPropagation();
    e.preventDefault();

    return false;
}
keys.update = function () {
    lastkey = '';
    return this;
};
keys.initialize = function () {
    document.body.addEventListener('keydown', onkeydown, true);
    document.body.addEventListener('keypress', onkeypress, true);
    document.body.addEventListener('keyup', onkeyup, true);
    return this;
};

return keys;
});
