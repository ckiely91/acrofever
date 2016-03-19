import {checkValidChatString} from '../imports/validators';
import {Games, Lobbies, GlobalFeed, LobbyFeed} from '../imports/collections';

Meteor.methods({
	addLobbyFeedChat: function(lobbyId, message) {
		var userId = this.userId;
		if (!userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');
		
		check(message, checkValidChatString);

		LobbyFeed.insert({
			lobbyId: lobbyId,
			user: userId,
			timestamp: new Date(),
			detail: message
		});

        Lobbies.findOne(lobbyId, {$currentDate: {lastUpdated: true}});
	},
	addGlobalFeedChat: function(message) {
		var userId = this.userId;
		if (!userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');
		
		check(message, checkValidChatString);

		GlobalFeed.insert({
			user: userId,
			timestamp: new Date(),
			detail: message
		});
	},
	markNagAsClosed: function(id) {
		if (this.userId)
			Meteor.users.update(this.userId, {$addToSet: {'profile.closedNags': id}});
	},
	toggleNotifications: function(state) {
		if (this.userId) {
			check(state, Boolean);
			Meteor.users.update(this.userId, {$set: {'profile.notificationsEnabled': state}});
		}
	},
	toggleSounds: function(state) {
		if (this.userId) {
			check(state, Boolean);
			Meteor.users.update(this.userId, {$set: {'profile.soundsEnabled': state}});
		}
	},

	/* ACROFEVER METHODS */

	acrofeverVoteForAcro: function(gameId, playerId) {
		var userId = this.userId,
			game;

		if (!this.isSimulation) {
			game = standardAcrofeverMethodChecks(gameId, userId, 'voting');
		} else {
			game = Games.findOne(gameId);
		}

		var currentRoundIndex = game.currentRound - 1;

		if (!game.rounds[currentRoundIndex].players[playerId])
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		var setObj = {};
		setObj['rounds.' + currentRoundIndex + '.players.' + userId + '.vote'] = playerId;

		Games.update(gameId, {$set: setObj});

		//if this is the last vote cast, advance the game phase
		if (!this.isSimulation) {
			var currentRound = game.rounds[currentRoundIndex];
			var totalPlayers = Object.keys(currentRound.players).length - 1;
			var submittedPlayers = 0;
			_.each(currentRound.players, function(player, playerId) {
				if (playerId !== userId && player.vote) {
					submittedPlayers++;
				}
			});
			if (submittedPlayers === totalPlayers) {
				const GameManager = require('../../server/imports/GameManager');
				GameManager.default.advancePhase(gameId, 'acrofever', 'voting', game.currentRound);
			}
		}
	}
});