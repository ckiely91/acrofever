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
	},
	adminAddNag: function(fields) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		var nag = {
			timestamp: new Date()
		}

		if (fields.title.length > 0) nag.title = fields.title; 
		if (fields.message.length > 0) nag.message = fields.message; 
		if (fields.icon.length > 0) nag.icon = fields.icon;
		if (fields.colour.length > 0) nag.colour = fields.colour;
		if (fields.active) nag.active = true;

		Nags.insert(nag); 
	},
	adminEditNag: function(id, action) {
		if (!isAdminUser(this.userId))
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		switch (action) {
			case 'activate':
				Nags.update(id, {$set: {active: true}});
				break;
			case 'deactivate':
				Nags.update(id, {$set: {active: false}});
				break;
			case 'delete':
				Nags.remove(id);
				break;
		}
	}
});

function isAdminUser(userId) {
	return (Meteor.settings.adminUsers.indexOf(userId) > -1);
}

