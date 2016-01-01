Template.home.helpers({
	playersOnline: function() {
		var players = [];
		Lobbies.find().forEach(function(lobby) {
			players = players.concat(lobby.players);
		});
		players = _.uniq(players);
		return (players.length > 0) ? players.length : false;
	}
});

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

Template.home.onCreated(function() {
	lobbySubs.subscribe('lobbies');
});