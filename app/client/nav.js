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

Template.userNavDropdown.helpers({
	notificationsSupported: function() {
		if (typeof Notification !== 'undefined')
			return true;
		else
			return false;
	},
	notificationsEnabled: function() {
		var user = Meteor.user();
		if (user.profile.notificationsEnabled === false)
			return false;

		return (Notification.permission === 'granted');
	}
})

Template.userNavDropdown.events({
	'click #signOut': function() {
		Meteor.logout();
	},
	'click #turnOnNotifications': function() {
		Meteor.call('toggleNotifications', true);

		if (Notification.permission === 'denied') {
			$('#notificationInfoModal').modal('show');
		} else if (Notification.permission !== 'granted') {
			Notification.requestPermission();
		}

	},
	'click #turnOffNotifications': function() {
		Meteor.call('toggleNotifications', false);
	}
});

Template.userNavDropdown.onRendered(function() {
	this.$('.dropdown').dropdown();
});