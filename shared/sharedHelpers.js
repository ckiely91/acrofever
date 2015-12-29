displayname = function(id, capitalise) {
	var user = Meteor.users.findOne(id);
	if (!user) {
		return;
	}

	if (user.profile) {
		var displayname = user.profile.name;
	} else {
		var displayname = user.username;
	}
	
	if (capitalise == true) {
		return s(displayname).capitalize().value();
	}
	return displayname;
}