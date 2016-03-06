'use strict';

exports.__esModule = true;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _ImmutableMapObserver = require('./ImmutableMapObserver');

var _ImmutableMapObserver2 = _interopRequireDefault(_ImmutableMapObserver);

var _ImmutableListObserver = require('./ImmutableListObserver');

var _ImmutableListObserver2 = _interopRequireDefault(_ImmutableListObserver);

exports['default'] = {
  Map: _ImmutableMapObserver2['default'],
  List: _ImmutableListObserver2['default']
};
module.exports = exports['default'];