/* screen/loading.js - Handle loading screen.  */
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
define(['pixi'], function(PIXI) {
"use strict";

/* Loading screens don't have an assets field.  */

var loadingText;

loadingText = new PIXI.Text("Loading...", {
  font: "bold 60px sans-serif",
});
loadingText.position.x = 20;
loadingText.position.y = 20;
loadingText.scale.x = 0.5;
loadingText.scale.y = 0.5;

var loading = {};

loading.enter = function (api) {
  api.top.removeChildren();
  api.top.addChild(loadingText);
  api.stage.setBackgroundColor(0xffffff);
}

return loading;
});
