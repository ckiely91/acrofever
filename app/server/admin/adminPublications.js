Meteor.publish('adminHallOfFame', function() {
	if (!isAdminUser(this.userId))
		return [];
	return HallOfFame.find();
});

function isAdminUser(userId) {
	return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}