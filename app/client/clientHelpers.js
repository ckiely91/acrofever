import {profilePicture, displayName} from '../imports/helpers';

Template.registerHelper('profilePicture', (id, size) => {
    return profilePicture(id, size);
});

Template.registerHelper('username', (id, capitalise) => {
    return displayName(id, capitalise);
});

Template.registerHelper('getRoutePath', (pathName) => {
    return FlowRouter.path(pathName);
});

Template.registerHelper('isOnRoute', (routeName) => {
    return (FlowRouter.getRouteName() === routeName);
});

Meteor.startup(() => {
    // Resync server time every 10 minutes
	Meteor.setInterval(() => {
		TimeSync.resync();
	}, 600000);
});