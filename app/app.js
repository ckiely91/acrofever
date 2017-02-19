import lodash from 'lodash';

// Global version vars
appVersion = require('./package.json').version;
appLastUpdated = "20 Feb 2016";

// Replace global underscore with lodash
_ = lodash;