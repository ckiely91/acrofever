import {HallOfFame, Nags} from '../../imports/collections';

Meteor.publish('adminHallOfFame', function() {
	if (!isAdminUser(this.userId))
		return [];
	return HallOfFame.find();
});

Meteor.publish('adminNags', function() {
	if (!isAdminUser(this.userId))
		return [];
	return Nags.find();
});

function isAdminUser(userId) {
	return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}