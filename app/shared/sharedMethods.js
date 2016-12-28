import {checkValidChatString} from '../imports/validators';
import {Games, Lobbies, GlobalFeed, LobbyFeed} from '../imports/collections';

Meteor.methods({
	addLobbyFeedChat(lobbyId, message) {
		if (!this.userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');
		
		check(message, checkValidChatString);

		LobbyFeed.insert({
			lobbyId: lobbyId,
			user: this.userId,
			timestamp: new Date(),
			detail: message
		});

        Lobbies.findOne(lobbyId, {$currentDate: {lastUpdated: true}});
	},
	addGlobalFeedChat(message) {
		if (!this.userId)
			throw new Meteor.Error('403', 'You must be logged in to do that');
		
		check(message, checkValidChatString);

		GlobalFeed.insert({
			user: this.userId,
			timestamp: new Date(),
			detail: message
		});
	},
	markNagAsClosed(id) {
		if (this.userId)
			Meteor.users.update(this.userId, {$addToSet: {'profile.closedNags': id}});
	},
	toggleNotifications(state) {
		if (this.userId) {
			check(state, Boolean);
			Meteor.users.update(this.userId, {$set: {'profile.notificationsEnabled': state}});
		}
	},
	toggleSounds(state) {
		if (this.userId) {
			check(state, Boolean);
			Meteor.users.update(this.userId, {$set: {'profile.soundsEnabled': state}});
		}
	},

	/* ACROFEVER METHODS */

	acrofeverVoteForAcro(gameId, playerId) {
		let game;

		if (!this.isSimulation) {
			game = standardAcrofeverMethodChecks(gameId, this.userId, 'voting');
		} else {
			game = Games.findOne(gameId);
		}

		const currentRoundIndex = game.currentRound - 1;

		if (!game.rounds[currentRoundIndex].players[playerId])
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		const setObj = {};
		setObj['rounds.' + currentRoundIndex + '.players.' + this.userId + '.vote'] = playerId;

		Games.update(gameId, {$set: setObj});

		//if this is the last vote cast, advance the game phase
		if (!this.isSimulation) {
			const currentRound = game.rounds[currentRoundIndex],
				totalPlayers = Object.keys(currentRound.players).length - 1;
			let submittedPlayers = 0;
			_.each(currentRound.players, (player, playerId) => {
				if (playerId !== this.userId && player.vote) {
					submittedPlayers++;
				}
			});
			if (submittedPlayers === totalPlayers) {
				const GameManager = require('../server/imports/AcrofeverGameManager');
				GameManager.default.advancePhase(gameId, 'voting', game.currentRound);
			}
		}
	}
});