Template.registerHelper("username", function(id, capitalise) {
  return displayname(id, capitalise);
  });

Template.registerHelper("friendlytime", function(time) {
  return moment(time).fromNow();
});

displayname = function(id, capitalise) {
	var user = Meteor.users.findOne(id);
	if (!user) {
		return;
	}

	if (user.profile) {
		var displayname = user.profile.name || user.username;
	} else {
		var displayname = user.username;
	}
	
	if (capitalise == true) {
		return s(displayname).capitalize().value();
	}
	return displayname;
}