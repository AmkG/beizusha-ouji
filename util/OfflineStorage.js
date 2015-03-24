/* OfflineStorage.js - Offline storage based on IndexedDB.  */
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

(function(factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else {
    OfflineStorage = factory();
  }
})(function () {
/*
os = new OfflineStorage("Some Name");

os.access(function (storage) {
  var val = storage.getItem("k");
  val = val + 1;
  storage.setItem("k", val);
});

os.access(function (storage) {
  var val = storage.getItem("k");
  return val;
}).then(function (return_value) {
  // do whatever to val.
});

*/
/*
The offline storage is asynchronous, but within the
function passed to .access() the given storage object
is a proxy that acts synchronously.

The modification function may be called multiple times,
so it should not update closed variables - instead,
have it return the values needed to be known, and the
.then() handler should do the updating of closed
variables.
*/

/* Promises and their handling.  */
function Promise() {
  this._then = function (a) {};
}
Promise.prototype.then = function (f) {
  var prevthen = this._then;
  this._then = function (a) {
    f(a);
    prevthen(a);
  };
};
Promise.prototype._commit = function (a) {
  this._then(a);
};

var hasM = Object.prototype.hasOwnProperty;
function has(o, k) {
  return hasM.call(o, k);
}

/* Synchronous storage type, which wraps the updates on the
   asynchronous calls.  */
function SynchronousStorage(table) {
  this._table = table;
}
SynchronousStorage.prototype.getItem = function (k) {
  if (has(this._table, k)) return this._table[k];
  return undefined;
};
SynchronousStorage.prototype.setItem = function (k, v) {
  this._table[k] = v;
};
SynchronousStorage.prototype.removeItem = function (k) {
  delete this._table[k];
};
SynchronousStorage.prototype.keys = function () {
  return Object.keys(this._table);
};

/* An object that stores the access function and the promise
   returned by .access().  */
function AccessRecord(access, promise) {
  this.access = access;
  this.promise = promise;
}

/* Actual offline storage.  */
function OfflineStorage(name) {
  this._name = name;
  this._running = false;
  this._db = null;
  this._toRun = [];
  this._table = null;
  this._errored = false;
}
/* Private function.  */
function runOfflineStorage(self) {
  self._running = true;

  /* Handle the case where offline storage has errored.  */
  function runErrorMode() {
    while (self._toRun.length > 0) {
      var ar = self._toRun.shift();
      var rv = ar.access.call(null, new SynchronousStorage(self._table));
      setImmediate(function() {
        ar.promise._commit(rv);
      });
    }
    self._running = false;
  }
  function handleErrorMode() {
    setImmediate(runErrorMode);
  }
  function enterErrorMode() {
    self._errored = true;
    if (!self._table) {
      self._table = {};
    }
    handleErrorMode();
  }

  if (self._errored) {
    handleErrorMode();
  }

  /* Handle indexedDB transactions.  */
  function coreNormalRun() {
    if (self._toRun.length > 0) {
      var ar = self._toRun.shift();

      // Initiate transaction.
      var transaction = self._db.transaction(["OfflineStorage"], "readwrite");
      transaction.oncomplete = handleNormalCase;
      transaction.onerror = function () {
        self._toRun.unshift(ar);
        enterErrorMode();
      };

      // Get the data.
      var store = transaction.objectStore("OfflineStorage");
      var request = store.get("OfflineStorage");
      request.onsuccess = function (e) {
        // Determine the returned data.  If no data yet, create the object.
        self._table = e.target.result;
        if (!self._table) {
          self._table = {};
        }

        // Call the update function.
        var rv = ar.access.call(null, new SynchronousStorage(self._table));
        var request = store.put(self._table, "OfflineStorage");
        request.onsuccess = function (e) {
          setImmediate(function () {
            ar.promise._commit(rv);
          });
        };
        request.onerror = function(e) {
          // At this point, the value has been returned and
          // the local copy of the table updated.
          setImmediate(function () {
            ar.promise._commit(rv);
          });
          enterErrorMode();
        };
      };
      request.onerror = function (e) {
        self._toRun.unshift(ar);
        enterErrorMode();
      };
    } else {
      self._running = false;
    }
  }
  function handleNormalCase() {
    setImmediate(coreNormalRun);
  }

  /* If database not open yet, open it.  */
  if (!self._db) {
    if (typeof indexedDB === "undefined") {
      enterErrorMode();
    } else {
      var openRequest = indexedDB.open(self._name, 1);
      openRequest.onupgradeneeded = function (e) {
        self._db = e.target.result;
        var store = self._db.createObjectStore("OfflineStorage", {});
        store.transaction.oncomplete = handleNormalCase;
      };
      openRequest.onerror = function (e) {
        enterErrorMode();
      };
      openRequest.onsuccess = function (e) {
        self._db = e.target.result;
        handleNormalCase();
      };
      self._running = true;
    }
  } else {
    self._running = true;
    handleNormalCase();
  }
}
/* Public function.  */
OfflineStorage.prototype.access = function (f) {
  var promise = new Promise();
  this._toRun.push(new AccessRecord(f, promise));
  if (!this._running) {
    runOfflineStorage(this);
  }
  return promise;
};

return OfflineStorage;
});
