import lodash from "lodash";

// Global version vars
appVersion = require("./package.json").version;
appLastUpdated = "19 May 2018";

// Replace global underscore with lodash
_ = lodash;
