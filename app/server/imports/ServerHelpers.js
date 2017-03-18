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

export function isShadowbanned(userId) {
    const user = Meteor.users.findOne(userId, { fields: { 'profile.shadowbanned': true }});
    return _.get(user, 'profile.shadowbanned', false);
}