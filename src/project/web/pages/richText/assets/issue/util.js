'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

define(function () {
  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  function 用于get请求的时间戳
  * @private
  * @Returns
  */
  /* --------------------------------------------------------------------------*/
  var now = function now() {
    return new Date().getTime();
  };

  /* --------------------------------------------------------------------------*/
  /**
  * @Synopsis  function html标签过滤
  *
    * @Param {string} str
  *
    * @Returns {string}
  */
  /* --------------------------------------------------------------------------*/
  var removeHtmlTag = function removeHtmlTag(str) {
    return str.replace(/<\/?[^>]*>/g, '').replace(/[ | ]*\n/g, '\n').replace(/\n[\s| | ]*\r/g, '\n').replace(/&nbsp;/ig, '');
  };

  var bind = function bind(fn, context) {
    return function () {
      for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      return fn.apply(context, args);
    };
  };

  var windowActive = function windowActive() {

    var hidden = 'hidden';
    // Standards:
    if (hidden in document) {
      document.addEventListener("visibilitychange", onchange);
    } else if ((hidden = "mozHidden") in document) {
      document.addEventListener("mozvisibilitychange", onchange);
    } else if ((hidden = "webkitHidden") in document) {
      document.addEventListener("webkitvisibilitychange", onchange);
    } else if ((hidden = "msHidden") in document) {
      document.addEventListener("msvisibilitychange", onchange);
    } else if ('onfocusin' in document) {
      // IE 9 and lower:
      document.onfocusin = document.onfocusout = onchange;
    } else {
      // All others:
      window.onpageshow = window.onpagehide = window.onfocus = window.onblur = onchange;
    }

    function onchange() {
      var evt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window.event;

      var v = 'visible';
      var h = 'hidden';
      var evtMap = {
        focus: v,
        focusin: v,
        focusout: h,
        pageshow: v,
        pagehide: h
      };
      if (evt.type in evtMap) {
        document.body.className = evtMap[evt.type];
      } else {
        document.body.className = this[hidden] ? "hidden" : "visible";
      }
      if (~document.body.className.indexOf('hidden')) {
        $(document).trigger('winunactived');
      } else {
        $(document).trigger('winactived');
      }
    }
  };

  var dateParse = function dateParse(date) {
    var str = '';
    if (typeof +date === 'number') {
      date = new Date(+date);
    }

    var preZero = function preZero(num) {
      return num > 9 ? num : '0' + num;
    };

    if (Object.prototype.toString.call(date) === '[object Date]') {
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hour = date.getHours();
      var minute = date.getMinutes();
      str = date.getFullYear() + '-' + preZero(month) + '-' + preZero(day) + ' ' + preZero(hour) + ':' + preZero(minute);
    }

    return str;
  };
  var reduce = function reduce(ary, fn, initial) {
    var previous = initial;
    var i = 0;
    if (previous == null) {
      previous = ary[0];
      i = 1;
    }
    for (; i < ary.length; i++) {
      previous = fn(previous, ary[i], i);
    }
    return previous;
  };
  var map = function map(ary, fn) {
    return reduce(ary, function (pre, cur, index) {
      pre.push(fn(cur, index));
      return pre;
    }, []);
  };
  var includes = function includes(ary, item) {
    for (var i = 0; i < ary.length; i++) {
      if (ary[i] === item) {
        return true;
      }
    }
    return false;
  };
  var distinctJson = function distinctJson() {
    var key = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'name';
    var json = arguments[1];

    var ary = [];
    var obj = {};
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = json[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var item = _step.value;

        if (!obj[item[key]]) {
          ary.push(item);
          obj[item[key]] = true;
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    return ary;
  };

  var distinctAry = function distinctAry(ary) {
    if (typeof Set === 'function') {
      return [].concat(_toConsumableArray(new Set(ary)));
    }
    var obj = {};
    var ay = [];
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = ary[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var item = _step2.value;

        if (!obj[item]) {
          ay.push(item);
          obj[item] = true;
        }
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }

    return ay;
  };

  return { now: now, removeHtmlTag: removeHtmlTag, bind: bind, windowActive: windowActive, dateParse: dateParse, reduce: reduce, map: map, includes: includes, distinctJson: distinctJson, distinctAry: distinctAry };
});