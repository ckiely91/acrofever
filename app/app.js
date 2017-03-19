import lodash from 'lodash';

// Global version vars
appVersion = require('./package.json').version;
appLastUpdated = "19 Mar 2016";

// Replace global underscore with lodash
_ = lodash;