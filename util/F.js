/* util/F.js - higher-order functional stuff.  */
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
    define(['exports'], factory);
  } else if (typeof require !== 'undefined') {
    factory(exports);
  }
})(function (F) {
"use strict";

/* Copy array-life object.  */
function copyArray(a, s, e) {
  var i = 0;
  var rv = [];
  for (i = s; i < e; ++i) {
    rv.push(a[i]);
  }
  return rv;
}

/* Basemost map.  Map a single function over a single
   array.  */
function map1(f, as) {
  var l = as.length;
  var rv = [];
  var i = 0;
  for (i = 0; i < l; ++i) {
    rv.push(f(as[i]));
  }
  return rv;
}

/* Basemost fold.  Call a reduction function over
   a single array.  */
function fold1(f, z, as) {
  var l = as.length;
  var i = 0;
  for (i = 0; i < l; ++i) {
    z = f(z, as[i]);
  }
  return z;
}

/* Basemost compose.  Compose two functions.
   Call lf on the result of calling rf on the
   argument.  */
function compose2(lf, rf) {
  return function () {
    return lf(rf.apply(null, arguments));
  };
}

/* Basemost filter.  Only allow values where
   f returns a truish value.  */
function filter1(f, as) {
  var rv = [];
  var i = 0;
  var l = as.length;
  for (i = 0; i < l; ++i) {
    var a = as[i];
    if (f(a)) rv.push(a);
  }
  return rv;
}

/* F.call(a0, a1, a2 ...)
- Return a function which expects a single argument.
  That single argument must be a function.
  Return the result of calling that function with
  the arguments.
*/
F.call = function () {
  var args = copyArray(arguments, 0, arguments.length);
  return function (f) {
    return f.apply(null, args);
  };
};
/* F.id
- A function that returns its first argument.
*/
F.id = function (a) { return a; };
/* F.compose(f1, f2, f3 ...)
- Return a function that serves as the composition
  of the function arguments.
*/
F.compose = function () {
  return fold1(compose2, F.id, arguments);
};
/* F.field(k1, k2...)
- Return a function which access the fields in the
  specified order.
- For example, F.field('k', 'j')(obj) = obj.k.j;
*/
F.field = function() {
  var args = arguments;
  var l = args.length;
  return function (obj) {
    var i = 0;
    for (i = 0; i < l; ++i) {
      obj = obj[args[i]];
    }
    return obj;
  };
};
/* F.zip(as1, as2 ...);
- Return a single array, each element is an array
  whose values are from the same index in the
  argument arrays.  The output array's length is
  the shortest input array's length.
- For example:
    F.zip( [a, b, c]
         , [d, e, f]
         )
    = [ [a,d]
      , [b,e]
      , [c,f]
      ]
*/
F.zip = function () {
  var rv = [];
  var i = 0;
  var l = Infinity;
  for (i = 0; i < arguments.length; ++i) {
    var a = arguments[i];
    if (a.length < l) l = a.length;
  }
  for (i = 0; i < l; ++i) {
    rv.push(map1(F.field(i), arguments));
  }
  return rv;
};
/* F.fold(f, z, as1, as2, as3 ...);
- Call f repeatedly on z and the elements of the
  array, with the previous call's result being
  the z of the next.
- For example: F.fold(f, z, [a, b, c])
  = f(f(f(z, a), b), c);
*/
F.fold = function () {
  if (arguments.length < 3) {
    throw new Error("F.fold: At least three arguments required.");
  }
  var f = arguments[0];
  var z = arguments[1];
  if (arguments.length === 3) {
    return fold1(f, z, arguments[2]);
  } else {
    var args = copyArray(arguments, 2, arguments.length);
    return fold1(function (z, as) {
      as.unshift(z);
      return f.apply(null, as);
    }, z, F.zip.apply(null, args));
  }
};
/* F.map(f, as1, as2, as3...)
- Call f on each element of as1, as2, as3...
- Return an array of results of calling f on each
  array element.
- Result array length is shortest array length.
- For example: F.map(f, [a, b], [c, d]) =
    [f(a,c), f(b,d)]
*/
F.map = function () {
  if (arguments.length < 2) {
    throw new Error("F.map: At least two arguments required.");
  }
  var f = arguments[0];
  if (arguments.length === 2) {
    return map1(f, arguments[1]);
  } else {
    var args = copyArray(arguments, 1, arguments.length);
    return map1( f.apply.bind(f, null)
               , F.zip.apply(null, args)
               );
  };
};
/* F.filter(f, as)
- Call f on each element of as.  If f returns
  a truish value, include in return array value.
*/
F.filter = filter1;
/* F.inverse(f)
- A function which returns the opposite of f.
- For example: F.inverse(f)(x) = !f(x);
*/
F.inverse = function (f) {
  return function () {
    var args = copyArray(arguments, 0, arguments.length);
    return !f.apply(null, args);
  };
};


});

