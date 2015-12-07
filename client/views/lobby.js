Template.lobby.helpers({
	ready: function() {
		return lobbySubs.ready();
	},
	lobby: function() {
		var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
		return lobby;
	},
	scores: function(lobby) {
		var game = Games.findOne(lobby.currentGame);
		if (game) {
			var array = [];
			_.each(game.scores, function(score, userId) {
				array.push({
					id: userId,
					score: score
				});
			});
			return array;
		}
	},
	inLobby: function() {
		return (this.players && this.players.indexOf(Meteor.userId()) > -1);
	}
});

Template.lobby.events({
	'click #joinLobby': function(event) {
		var lobbyId = FlowRouter.getParam('lobbyId');
		$(event.currentTarget).addClass('loading');
		Meteor.call('joinOrLeaveOfficialLobby', lobbyId, true);
	},
	'click #leaveLobby': function(event) {
		var lobbyId = FlowRouter.getParam('lobbyId');
		$(event.currentTarget).addClass('loading');
		Meteor.call('joinOrLeaveOfficialLobby', lobbyId, false);
	}
})

Template.lobby.onCreated(function() {
	var self = this;
	self.autorun(function() {
		lobbySubs.subscribe('lobbies');
		var currentLobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
		if (currentLobby) {
			Meteor.subscribe('otherPlayers', currentLobby.players);
		}
	});
});

Template.game.helpers({
	ready: function() {
		return Template.instance().ready.get();
	},
	game: function() {
		var currentGame = Lobbies.findOne(FlowRouter.getParam('lobbyId')).currentGame;
		return Games.findOne(currentGame);
	},
	gamePhase: function(game) {
		return game.type + '-' + game.currentPhase;
	}
});

Template.game.onCreated(function() {
	var self = this;
	self.ready = new ReactiveVar();
	self.autorun(function() {
		var lobbyId = FlowRouter.getParam('lobbyId'),
			currentGame = Lobbies.findOne(lobbyId).currentGame;
		var	handle = Meteor.subscribe('currentGame', currentGame);
		self.ready.set(handle.ready());
	});
});

Template.scoresPlayerRow.helpers({
	leader: function(id) {
		var game = Games.findOne(Lobbies.findOne(FlowRouter.getParam('lobbyId')).currentGame);
		var highPoints = 0;
		var leaders = [];

		if (game) {
			_.each(game.scores, function(score, playerId) {
				if (score > highPoints) {
					highPoints = score;
					leaders = [playerId];
				} else if (score === highPoints) {
					leaders.push(playerId);
				}
			});

			if (leaders.indexOf(id) > -1) {
				if (leaders.length > 1) {
					return "Tied for leader";
				} else {
					return "Current leader";
				}
			}
		}
	}
});

Template.lobbyChat.onCreated(function() {
	var self = this;
	self.autorun(function() {
		Meteor.subscribe('lobbyChat', FlowRouter.getParam('lobbyId'));
	});
});

Template.lobbyChat.events({
	'submit #chat-input-form' : function (evt, template) {
		evt.preventDefault();
		var message = $("#chat-input-box").val();
		var lobbyId = FlowRouter.getParam('lobbyId');
		Meteor.call('addLobbyChatMessage', lobbyId, message);
		$("#chat-input-form").trigger('reset');
	}
});

Template.lobbyChat.helpers({
	ready: function() {
		return Template.instance().ready.get();
	},
	chats : function() {
		var lobbyId = FlowRouter.getParam('lobbyId');
		var lobby = LobbyChat.findOne({lobbyId:lobbyId});
		if (lobby)
			return lobby.chats.reverse();
		else
			return [];
	}
});