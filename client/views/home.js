Template.home.events({
	'click .playNow': function(evt) {
		evt.preventDefault();
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
	'click .howToPlay': function(evt) {
		evt.preventDefault();
		$('#howToPlayModal').modal('show');
	}
});