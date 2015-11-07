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
});

Template.lobbyRow.events({
	'click .lobbyRow': function(evt, template) {
		FlowRouter.go(FlowRouter.path('lobby', {lobbyId: template.data._id}));
	}
});

// Template.lobbyRow.onCreated(function() {
// 	var self = this;
// 	self.ready = new ReactiveVar();
// 	self.autorun(function() {
// 		var players = [];
// 		Lobbies.find().forEach(function(lobby) {
// 			players = players.concat(lobby.players);
// 		});
// 		_.uniq(players);
// 		var handle = Meteor.subscribe('otherPlayers', players);
// 		self.ready.set(handle.ready());
// 	});
// });