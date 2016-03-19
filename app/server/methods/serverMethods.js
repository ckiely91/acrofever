import GameManager from '../imports/GameManager';
import {Games, Lobbies, HallOfFame} from '../../imports/collections';

Meteor.methods({
	acrofeverChooseCategory(gameId, category) {
		check(gameId, String);
		check(category, String);

		var userId = this.userId;
		var game = standardAcrofeverMethodChecks(gameId, userId, 'category', true, category);

		var currentRound = game.rounds[game.currentRound - 1];

		if (currentRound.categoryChooser !== userId)
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		//set the category and advance game round
		GameManager.advancePhase(gameId, 'acrofever', 'category', game.currentRound, category);
	},
	acrofeverSubmitAcro(gameId, acro) {
		check(gameId, String);
		check(acro, String);

		//strip new lines from acro string
		acro = acro.replace('\n', ' ');

		var userId = this.userId;
		var game = standardAcrofeverMethodChecks(gameId, userId, 'acro', true, acro);
		var roundIndex = game.currentRound - 1;
		var currentRound = game.rounds[roundIndex];

		// check if this user in the current round
		if (!currentRound.players[userId])
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		var timeLeft = moment(game.endTime) - moment();
		var setObj = {};
		setObj['rounds.' + roundIndex + '.players.' + userId + '.submission'] = {
			acro: acro,
			timeLeft: timeLeft
		};
		console.log(setObj);

		Games.update(gameId, {$set: setObj});

		// has everyone else submitted their acro?
		var totalPlayers = Object.keys(currentRound.players).length - 1;
		var submittedPlayers = 0;
		_.each(currentRound.players, function(player, playerId) {
			if (playerId !== userId && player.submission) {
				console.log(player);
				console.log(playerId);
				submittedPlayers++;
			}
		});

		if (submittedPlayers === totalPlayers) {
			//everyone has submitted! advance the game phase
			console.log("Everyone has submitted");
			GameManager.advancePhase(gameId, 'acrofever', 'acro', game.currentRound);
		}
	},
	voteForHallOfFame(gameId, data) {
		var userId = Meteor.userId();
		if (!userId)
			throw new Meteor.Error('no-permission', 'You must be logged in to do that');

		if (userId === data.id)
			throw new Meteor.Error('no-permission', 'You can\'t vote for your own acro');

		var game = Games.findOne(gameId, {fields: {
			scores: true
		}});

		if (!game || !game.scores[data.id])
			return;

		var created = new Date();

		HallOfFame.upsert({gameId: gameId, userId: data.id, acro: data.acro, acronym: data.acronym}, {
			$setOnInsert: {
				gameId: gameId,
				userId: data.id,
				acronym: data.acronym,
				category: data.category,
				acro: data.acro,
				active: false,
				created: created	
			},
			$addToSet: {
				votes: userId
			}
		});
	},
	findPlayNowLobbyId() {
		var userId = Meteor.userId(),
			lobbies = Lobbies.find({official: true}, {fields: { players: true }});

		if (userId) {
			// if they're already in a lobby, throw them in one
			var inLobby;
			lobbies.forEach(function(lobby) {
				if (lobby.players.indexOf(userId) > - 1)
					inLobby = lobby._id;
			});
			if (inLobby)
				return inLobby;
		}

		// find the lobby with the most players
		var lobbyId,
			inLobby,
			allLobbies = [],
			lobbiesWithPlayers = [],
			mostPlayers = 1;

		// if they're already in a lobby, throw them in one
		lobbies.forEach(function(lobby) {
			allLobbies.push(lobby._id);
			if (userId && lobby.players.indexOf(userId) > - 1)
				inLobby = lobby._id;

			if (lobby.players.length === mostPlayers) {
				lobbiesWithPlayers.push(lobby._id);
			} else if (lobby.players.length > mostPlayers) {
				lobbiesWithPlayers = [lobby._id];
			}
		});

		if (inLobby)
			return inLobby;

		if (lobbiesWithPlayers.length === 1) {
			return lobbiesWithPlayers[0];
		} else if (lobbiesWithPlayers.length > 1) {
			return _.sample(lobbiesWithPlayers);
		}

		return _.sample(allLobbies);
	}
});

standardAcrofeverMethodChecks = function(gameId, userId, phase, inputRequired, inputString) {
	if (inputRequired) {
		check(inputString, String);
		if (inputString.length < 1 || inputString.length > 300)
			throw new Meteor.Error('invalid-input', 'Provided input is too long or too short');
	}

	var game = Games.findOne(gameId);

	if (!userId || !game)
		throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

	checkCorrectPhase(game, phase);

	return game;
};

function checkCorrectPhase(game, phase) {
    if (game.currentPhase !== phase)
        throw new Meteor.Error('wrong-phase', 'You can\'t take that action in the current game phase.');
}