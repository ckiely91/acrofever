lobbySubs = new SubsManager();

Template.play.helpers({
	ready: function() {
		return lobbySubs.ready();
	},
	lobbies: function() {
		return Lobbies.find();
	}
});

Template.play.onCreated(function() {
	var self = this;
	self.autorun(function() {
		lobbySubs.subscribe('lobbies');
		var players = [];
		Lobbies.find().forEach(function(lobby) {
			players = players.concat(lobby.players);
		});
		_.uniq(players);
		Meteor.subscribe('otherPlayers', players);
	});

	//SEO stuff
	var title = 'Find Lobbies - Acrofever';
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

Template.lobbyRow.events({
	'click .lobbyRow': function(evt, template) {
		FlowRouter.go(FlowRouter.path('lobby', {lobbyId: template.data._id}));
	}
});

Template.lobbyRow.helpers({
	noPlayers: function(players) {
		return (players.length === 0);
	}
});

Template.lobbyRow.onRendered(function() {
	this.$('img').popup();
});

Template.lobbyRow.onDestroyed(function() {
	this.$('img').popup('hide');
});