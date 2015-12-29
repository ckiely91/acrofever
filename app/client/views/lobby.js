Template.lobby.helpers({
	ready: function() {
		return lobbySubs.ready();
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
			return array.sort(function(a, b) {
				return b.score - a.score;
			});
		}
	},
	inLobby: function() {
		return (this.players && this.players.indexOf(Meteor.userId()) > -1);
	},
	currentRound: function() {
		var game = Games.findOne(this.currentGame);
		if (game)
			return game.currentRound;
	},
	timeFormat: function(milliseconds) {
		return moment(milliseconds).format('m:ss');
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
			var playerIds = currentLobby.players;
			var game = Games.findOne(currentLobby.currentGame);
			if (game) {
				if (game.scores)
					playerIds = playerIds.concat(_.keys(game.scores));
				Meteor.subscribe('otherPlayers', playerIds);
			}
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
	},
	lobbyPlayers: function(parentContext) {
		var lobby = parentContext;
		if (lobby.players.length) {
			return lobby.players;
		} else {
			return false;
		}
	},
	newGameStarting: function(parentContext) {
		var lobby = parentContext;
		return lobby.newGameStarting;
	},
	newGameCountdown: function(parentContext) {
		var endTime = parentContext.endTime;
		var diff = moment(endTime).diff(mo.now.get());
		if (diff >= 0)
			return moment(diff).format('m:ss');
		else
			return '0:00';
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
			if (game.gameWinner) {
				if (game.gameWinner === id)
					return "Game winner";
				else
					return;
			}

			_.each(game.scores, function(score, playerId) {
				if (score > highPoints) {
					highPoints = score;
					leaders = [playerId];
				} else if (score === highPoints) {
					leaders.push(playerId);
				}
			});

			if (highPoints === 0)
				return;

			if (leaders.indexOf(id) > -1) {
				if (leaders.length > 1) {
					return "Tied for leader";
				} else {
					return "Current leader";
				}
			}
		}
	},
	isInactive: function(id) {
		var lobby = Lobbies.findOne(FlowRouter.getParam('lobbyId'));
		return (lobby.players.indexOf(id) === -1);
	}
});