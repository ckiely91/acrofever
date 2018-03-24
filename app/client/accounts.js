import { Cookies } from "meteor/ostrio:cookies";
import { checkBanCookie } from "../imports/helpers";

Accounts.onLogin(function() {
  if (_.get(Meteor.user(), "profile.permabanned", false) === true) {
    // gtfo
    const cookies = new Cookies();
    cookies.set("permabanned", true);
    checkBanCookie();
  }
});
