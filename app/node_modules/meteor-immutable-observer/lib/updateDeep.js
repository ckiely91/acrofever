'use strict';

exports.__esModule = true;
exports['default'] = updateDeep;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function updateDeep(a, b) {
  if (!(a instanceof _immutable2['default'].Collection) || !(b instanceof _immutable2['default'].Collection) || Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) {
    return a === b ? a : b;
  }
  return a.withMutations(function (result) {
    a.forEach(function (oldValue, key) {
      if (!b.has(key)) {
        result['delete'](key);
      }
    });
    b.forEach(function (newValue, key) {
      if (!a.has(key)) {
        result.set(key, newValue);
      } else {
        result.set(key, updateDeep(a.get(key), newValue));
      }
    });
  });
}

module.exports = exports['default'];