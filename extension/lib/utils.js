/**
 * @fileOverview Contains convenient utilities for content scripts and popup page.
 */

/**
 * Evaluate an xpath.
 * @param  {string} path The xpath string.
 * @param  {object?} doc The node to evaluate the xpath in. Defaults to document.
 * @return {[objects]} A list of DOM element objects.
 */
function evalXpath(path, doc) {
  var eval_doc = document;
  if (doc) {
    eval_doc = doc;
  }

  var nodes = document.evaluate(path, eval_doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
  var results = [];
  for (var i = 0; i < nodes.snapshotLength; i++) {
    results.push(nodes.snapshotItem(i));
  }
  return results;
}


/**
 * Gets the value for an url parameter.
 * @param {string} name The name of the parameter.
 * @param {string?} url The url to fetch parameter in, default to location.href.
 * @returns {Object} The value of the parameter.
 */
function getUrlParameter(name, url) {
  url = url ? url : window.location.href;
  name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]');
  var regexS = '[\\?&]' + name + '=([^&#]*)';
  var regex = new RegExp(regexS);
  var results = regex.exec(url);
  if (results === null) {
    return null;
  } else {
    return results[1];
  }
}

/**
 * Performs the async GET request.
 * @param {string} url The URL.
 * @returns {Promise} Resolve argument: response; reject argument: error.
 */
function GET(url) {
  return new Promise(function(resolve, reject) {
    var request = new XMLHttpRequest();
    request.addEventListener('load', function() {
        resolve(request.response);
    });
    request.addEventListener('error', function(err) {
        reject(err);
    });
    request.open('GET', url, true);
    request.send();
  });
}

/*
 * Copy text to clipboard.
 */
function copyText(text /* string */) {
  return new Promise(function(resolve, reject) {
    chrome.runtime.sendMessage(
        {msg: 'copyText', text: text}, function(response) {
          if (response) {
            resolve(response);
          } else {
            reject(response);
          }
        });
  });
}

/**
 * Saves content for the given key using chrome.storage.sync.
 * @param {type} key The key used to save.
 * @param {type} content The content to save.
 * @returns {Promise} arg: none.
 */
function syncSave(key, content) {
  return new Promise(function(resolve, reject) {
    var toSave = {};
    toSave[key] = content;
    chrome.storage.sync.set(toSave, function() {
      resolve();
    });
  });
}

/**
 * Loads content for the given key using chrome.storage.sync.
 * @param {type} key The key used to load.
 * @returns {Promise} arg: {Object} saved content or null.
 */
function syncLoad(key) {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(key, function(record) {
      if (key in record) {
        resolve(record[key]);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Saves content for the given key using chrome.storage.local.
 * @param {type} key The key used to save.
 * @param {type} content The content to save.
 * @returns {Promise} arg: none.
 */
function localSave(key, content) {
  return new Promise(function(resolve, reject) {
    var toSave = {};
    toSave[key] = content;
    chrome.storage.local.set(toSave, function() {
      resolve();
    });
  });
}

/**
 * Loads content for the given key using chrome.storage.local.
 * @param {type} key The key used to load.
 * @returns {Promise} arg: {Object} saved content or null.
 */
function localLoad(key) {
  return new Promise(function(resolve, reject) {
    chrome.storage.local.get(key, function(record) {
      if (key in record) {
        resolve(record[key]);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Registers a callback function when that will be called when the DOM is (relatively) stable.
 * Note: The DOM can be ever-changing, and this function provides a way to call the callback when the DOM is relatively
 * stable (no DOM mutations for a period).
 * @param {Object} doSomthingCallback The argument-less callback function to call when the DOM is stable
 */
function whenDOMIsStable(doSomthingCallback) {
  setAggregatedEventsListener($(document), 'DOMSubtreeModified', 0.6, doSomthingCallback);

  // Force triggering an event in case that the DOM is already stable by the
  // time this function is called.
  $(document).trigger('DOMSubtreeModified');
}

/**
 * Set an listener for an event. If the event if fired multiple times within the given time period, then only calls the
 * callback for the last event.
 * @param {Object} element A jQuery element whose event will be listened to.
 * @param {string} event The event to listen to. For example "DOMSubtreeModified".
 * @param {number} timePeriodSec Multiple events fired within this period only triggers one callback call.
 * @param {Object} callback The callback function.
 */
function setAggregatedEventsListener(element, event, timePeriodSec, callback) {
  timePeriodSec = timePeriodSec ? timePeriodSec : 0.5;
  callback = callback ? callback : function() {
    console.log('Event ' + event + ' triggered.');
  };

  var timeout = null;
  (function() {
    element.bind(event, function() {
      clearTimeout(timeout);
      timeout = setTimeout(callback, timePeriodSec * 1000);
    });
  })();
}

/**
 * Convenience function used to log out content as callback function.
 * @param {Object} obj Any object.
 */
function logMe(obj) {
  console.log(obj);
}
