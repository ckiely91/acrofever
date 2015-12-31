Meteor.methods({
	isAdminUser: function() {
		return isAdminUser(this.userId);
	},
	adminEditHallOfFameEntry: function(id, options) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		if (options.deactivate)
			HallOfFame.update(id, {$set: {active: false}});
		else if (options.delete)
			HallOfFame.remove(id);
		else if (options.activate)
			HallOfFame.update(id, {$set: {active: true}});
	}
});

function isAdminUser(userId) {
	return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}

