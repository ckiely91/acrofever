import {HallOfFame, Nags, Events, Categories} from '../../imports/collections';

Meteor.publish('adminHallOfFame', function(limit) {
	if (!isAdminUser(this.userId))
		return [];

	return HallOfFame.find({}, {
	    sort: {created: -1},
        limit: limit || 0
    });
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

Meteor.publish('adminCategories', function(limit) {
	if (!isAdminUser(this.userId))
		return [];

	return Categories.find({custom: true}, {
	    sort: {createdAt: -1},
        limit: limit || 0
    });
});

function isAdminUser(userId) {
	return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}