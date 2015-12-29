Template.nav.helpers({
	loggedInUser: function() {
		var userId = Meteor.userId();
		if (userId)
			return Meteor.users.findOne(userId);
		else
			return false;
	}
});

Template.nav.events({
	'click #howToPlay': function(evt) {
		evt.preventDefault();
		$('#howToPlayModal').modal('show');
	}
});

Template.userNavDropdown.events({
	'click #signOut': function() {
		Meteor.logout();
	}
});

Template.userNavDropdown.onRendered(function() {
	this.$('.dropdown').dropdown();
});