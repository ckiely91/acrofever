export function getUserEmail(user) {
    if (user.emails && user.emails.length > 0) {
        return user.emails[0].address;
    }

    if (user.services && user.services.facebook) {
        return user.services.facebook.email;
    }

    if (user.services && user.services.google) {
        return user.services.google.email;
    }

    return null;
}