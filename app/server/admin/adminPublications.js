import {HallOfFame, Nags, Events} from '../../imports/collections';

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


Meteor.publish('adminEvents', function() {
	if (!isAdminUser(this.userId))
		return [];

    const date = moment().subtract(7, 'd').toDate();

	return Events.find({date: {$gte: date}});
});

function isAdminUser(userId) {
	return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}