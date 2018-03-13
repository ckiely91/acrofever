import lodash from 'lodash';

// Global version vars
appVersion = require('./package.json').version;
appLastUpdated = "13 Mar 2018";

// Replace global underscore with lodash
_ = lodash;