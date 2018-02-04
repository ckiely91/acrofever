export function displayName(user) {
  if (!user) {
      return;
  }

  let displayname;

  if (user.username) {
      displayname = user.username;
  } else if (user.profile && user.profile.name) {
      //just show first name for privacy reasons
      displayname = user.profile.name.split(' ')[0];
  } else {
      // shouldn't happen
      displayname = 'Anonymous';
  }

  return displayname;
}

const addSearch = (url, obj) => {
  if (url.indexOf("?") > -1) {
    url += "&";
  } else {
    url += "?";
  }

  Object.keys(obj).forEach((key) => {
    url += `${key}=${encodeURIComponent(obj[key])}&`
  });

  return url;
}

export function profilePicture(user, size) {
  if (!user || !user.profile || !user.profile.profilePicture)
      return 'https://acrofever.com/images/no-profile-pic.png';

  if (!size)
      size = 100;

  const type = user.profile.profilePicture.type,
      url = user.profile.profilePicture.url;
  let newUrl;

  switch (type) {
      case 'gravatar':
          newUrl = addSearch(url, { size });
          break;
      case 'facebook':
          newUrl = addSearch(url, { height: size, width: size });
          break;
      case 'google':
          newUrl = addSearch(url, { sz: size });
          break;
      case 'twitter':
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
          newUrl = 'https://acrofever.com/images/no-profile-pic.png';
  }
  return newUrl;
}

export const getUserById = (users, userId) => {
  if (!users || !userId) return null;

  for (let i = 0; i < users.length; i++) {
    if (users[i]._id === userId) {
      return users[i];
    }
  }

  return null;
}