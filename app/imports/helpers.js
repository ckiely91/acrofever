import { Meteor } from "meteor/meteor";
import { Cookies } from "meteor/ostrio:cookies";

export function notify(title, body, image) {
  if (typeof Notification === "undefined") return;

  const user = Meteor.user();
  if (user.profile.notificationsEnabled === false) return;

  if (document.hidden && Notification.permission === "granted") {
    const n = new Notification(title, {
      icon: image || "https://acrofever.com/apple-icon-180x180.png",
      body: body,
      lang: "en-US"
    });
    setTimeout(n.close.bind(n), 4000);
  } else if (Notification.permission === "default") {
    Notification.requestPermission(function(result) {
      if (result === "granted") {
        Meteor.call("toggleNotifications", true);
        acrofeverAnalytics.track("allowNotifications");
      } else if (result === "denied") {
        Meteor.call("toggleNotifications", false);
        acrofeverAnalytics.track("denyNotifications");
      }
    });
  }
}

export function playSound(filename, hiddenOnly) {
  if (
    (hiddenOnly && !document.hidden) ||
    Meteor.user().profile.soundsEnabled === false
  )
    return;

  const sound = new buzz.sound("/sounds/" + filename, {
    formats: ["ogg", "mp3"],
    volume: 50
  });

  sound.play();
}

export function profilePicture(idOrUser, size) {
  const user = _.isString(idOrUser) ? Meteor.users.findOne(idOrUser) : idOrUser;

  if (!user || !user.profile || !user.profile.profilePicture)
    return "/images/no-profile-pic.png";

  if (!size) size = 100;

  const type = user.profile.profilePicture.type,
    url = user.profile.profilePicture.url;
  let newUrl;

  switch (type) {
    case "gravatar":
      newUrl = URI(url)
        .addSearch({ size: size })
        .toString();
      break;
    case "facebook":
      newUrl = URI(url)
        .addSearch({ height: size, width: size })
        .toString();
      break;
    case "google":
      newUrl = URI(url)
        .addSearch({ sz: size })
        .toString();
      break;
    case "twitter":
      if (size <= 24) {
        size = "_mini";
      } else if (size <= 48) {
        size = "_normal";
      } else if (size <= 73) {
        size = "_bigger";
      } else {
        //risky - this file could be massive!
        size = "";
      }
      newUrl = url.replace("_normal", size);
      break;
    default:
      newUrl = "/images/no-profile-pic.png";
  }
  return newUrl;
}

export function displayName(idOrUser, capitalise) {
  const user = _.isString(idOrUser) ? Meteor.users.findOne(idOrUser) : idOrUser;

  if (!user) {
    return;
  }

  let displayname;

  if (user.username) {
    displayname = user.username;
  } else if (user.profile && user.profile.name) {
    //just show first name for privacy reasons
    displayname = user.profile.name.split(" ")[0];
  } else {
    // shouldn't happen
    displayname = "Anonymous";
  }

  if (capitalise == true) {
    return s(displayname)
      .capitalize()
      .value();
  }
  return displayname;
}

export function specialTags(idOrUser) {
  const user = _.isString(idOrUser) ? Meteor.users.findOne(idOrUser) : idOrUser;
  if (user && user.profile && user.profile.specialTags) {
    return user.profile.specialTags;
  }
}

export const acrofeverAnalytics = {
  track(event, obj) {
    if (typeof analytics === "object") analytics.track(event, obj);
  },
  page(page, obj) {
    if (typeof analytics === "object") analytics.page(page, obj);
  }
};

export function checkBanCookie() {
  const cookies = new Cookies();
  if (cookies.get("permabanned") === "true") {
    window.location.href = "http://google.com";
  }
}

export function isUserBanned(userId) {
  if (!userId) return false;

  const user = Meteor.users.findOne(userId, {
    fields: { "profile.shadowbanned": true, "profile.permabanned": true }
  });

  if (!user) return false;

  return (
    _.get(user, "profile.shadowbanned", false) ||
    _.get(user, "profile.permabanned", false)
  );
}

export const findUserById = (users, userId) => {
  if (!userId) {
    return null;
  }

  return _.find(users, u => u._id === userId) || { _id: userId };
};
