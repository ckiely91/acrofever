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
	},
	'click .playNow': function(evt) {
		evt.preventDefault();
		
		if (FlowRouter.getRouteName() === 'lobby')
			return;

		var dimmer = $('.ui.page.dimmer');
		dimmer.dimmer('show');
		Meteor.call('findPlayNowLobbyId', function(err, res) {
			dimmer.dimmer('hide');
			if (err)
				console.log(err);
			else
				FlowRouter.go(FlowRouter.path('lobby', {lobbyId: res}));
		});
	},
	'click .sidebar.icon': function(evt) {
		$('.slideMenu').transition('slide down');
	},
	'click #mobileNav a': function() {
		if ($('.slideMenu').css('display') === 'block')
			$('.slideMenu').transition('slide down');
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