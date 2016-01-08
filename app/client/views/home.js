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

	//SEO stuff
	var title = 'Acrofever';
	var description = 'Acrofever is an Acrophobia clone for the modern web. If you never played Acrophobia, it\'s a fun, zany word game in which players create phrases from a randomly generated acronym, then vote for their favourites.';
	var metadata = {
		'description': description,
		'og:description': description,
		'og:title': title,
		'og:image': 'https://acrofever.com/images/fb-image.png',
		'twitter:card': 'summary'
	};

	DocHead.setTitle(title);
	_.each(metadata, function(content, name) {
		DocHead.addMeta({name: name, content: content})
	});
});