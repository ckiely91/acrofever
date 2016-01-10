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
		return user.profile.notificationsEnabled;
	},
	soundDisabled: function() {
		return (Meteor.user().profile.soundsEnabled === false);
	}
})

Template.userNavDropdown.events({
	'click #signOut': function() {
		Meteor.logout();
	},
	'click #turnOnNotifications': function() {
		if (Notification.permission === 'granted') {
			Meteor.call('toggleNotifications', true);
			return;
		}

		if (Notification.permission === 'denied') {
			$('#notificationInfoModal').modal('show');
			return;
		}

		Notification.requestPermission(function(result) {
			if (result === 'granted') {
				Meteor.call('toggleNotifications', true);
			}
		});
	},
	'click #turnOffNotifications': function() {
		Meteor.call('toggleNotifications', false);
	},
	'click #toggleSound': function() {
		if (Meteor.user().profile.soundsEnabled === false)
			Meteor.call('toggleSounds', true);
		else
			Meteor.call('toggleSounds', false);
	}
});

Template.userNavDropdown.onCreated(function() {
	if (typeof Notification !== 'undefined') {
		this.tracker = Tracker.autorun(function(c) {
			var permission = Meteor.user().profile.notificationsEnabled;
			if (permission === true && Notification.permission !== 'granted') {
				console.log('set to false');
				Meteor.call('toggleNotifications', false);
			} else if (typeof permission === 'undefined' && Notification.permission === 'granted') {
				console.log('set to true');
				Meteor.call('toggleNotifications', true);
			}
		});
	}
});

Template.userNavDropdown.onDestroyed(function() {
	if (this.tracker)
		this.tracker.stop();
});

Template.userNavDropdown.onRendered(function() {
	this.$('.dropdown').dropdown();
});