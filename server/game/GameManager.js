GameManager = {};
var performanceNow = Meteor.npmRequire('performance-now');

GameManager.makeGameActive = function(gameId) {
	//this function assumes that checks have already been made to ensure this game SHOULD go active
	var game = Games.findOne(gameId);

	console.log('Making game ' + gameId + ' active');

	if (!game || game.active) {
		Logger.warn('GameManager.makeGameActive was called on a nonexistent or already active game', {gameId: gameId});
		console.error('GameManager.makeGameActive was called on a nonexistent or already active game: ' + gameId);
		return;
	}

	//check if the time has passed the game's activeTimeout. If so, create a new game.
	var activeTimeout = game.activeTimeout;

	if (game.currentPhase === "endgame" || !activeTimeout || moment().isAfter(activeTimeout)) {
		//create a new game!!
		GameManager.startNewGame(game.lobbyId);
	} else {
		//reactivate this game in a new round
		GameManager.startNewRound(game.lobbyId, true);
	}
}

GameManager.makeGameInactive = function(gameId) {
	var game = Games.findOne(gameId);

	console.log('Making game' + gameId + 'inactive');

	if (!game || !game.active) {
		Logger.warn('GameManager.makeGameInactive was called on a nonexistent or already inactive game', {gameId: gameId});
		console.log('GameManager.makeGameInactive was called on a nonexistent or already inactive game: ' + gameId);
		return;
	}

	var activeTimeout = moment().add(Meteor.settings.gameActiveTimeout, 'milliseconds').toDate();

	Games.update(gameId, {$set: {activeTimeout: activeTimeout, active: false}});
}

GameManager.startNewGame = function(lobbyId, type) {
	//start a new game in this lobby
	//assume checks have already been made and just go ahead and create a new game
	if (!type)
		var type = 'acrofever';

	try {
		var newGame = {
			type: type,
			lobbyId: lobbyId,
			active: true,
			currentPhase: 'category',
			currentRound: 0,
			scores: {},
			created: new Date(),
			lastUpdated: new Date()
		};

		var players = Lobbies.findOne(lobbyId).players;

		_.each(players, function(playerId) {
			newGame.scores[playerId] = 0;
		});

		var gameId = Games.insert(newGame);

		Logger.info('New game started', {lobbyId: lobbyId, gameId: gameId});

		Lobbies.update(lobbyId, {$push: {games: gameId}, $set: {currentGame: gameId}, $currentDate: {lastUpdated: true}});
		GameManager.startNewRound(lobbyId);

	} catch(err) {
		console.error(err);
		Logger.error('Error starting new game', {
			error: err,
			lobbyId: lobbyId
		});
	}
}

GameManager.startNewRound = function(lobbyId, setActive) {
	//start new round stuff
	try {
		var lobby = Lobbies.findOne(lobbyId),
			game = Games.findOne(lobby.currentGame);

		if (!game.active && !setActive) {
			//game is inactive, we can't start a new round. Making a game active will start the new round when it can.
			return;
		}

		var players = lobby.players;

		//Select a random player to choose a category
		var categoryChooser = _.sample(players);

		var round = {
			acronym: Acrofever.generateAcronym(),
			players: {},
			categoryChooser: categoryChooser
		};

		_.each(players, function(playerId) {
			round.players[playerId] = {
				votes: 0,
				votePoints: 0,
				votedForWinnerPoints: 0,
				notVotedNegativePoints: 0,
				winnerPoints: 0
			}
		});

		var categoryTimeout = lobby.config.categoryTimeout,
			setObj = {
				currentPhase: 'category',
				endTime: moment().add(categoryTimeout, 'milliseconds').toDate()
			};

		if (setActive)
			setObj.active = true;

		console.log(setObj);

		Games.update(lobby.currentGame, {$set: setObj, $push: {rounds: round}, $inc: {currentRound: 1}, $currentDate: {lastUpdated: true}});

		Logger.info('New round started', {lobbyId: lobbyId, gameId: lobby.currentGame});

		Meteor.setTimeout(function() {
			// Advance to acro phase
			GameManager.advancePhase(lobby.currentGame, 'acrofever', 'category');
		}, categoryTimeout);

	} catch(err) {
		console.error(err);
		Logger.error('Error starting new round', {
			error: err,
			lobbyId: lobbyId,
			gameId: lobby.currentGame
		});
	}
}

GameManager.advancePhase = function(gameId, type, currentPhase, category) {
	var game = Games.findOne(gameId, {fields: {
		currentPhase: true
	}});

	if (game.currentPhase !== currentPhase)
		return;

	Logger.info('Advancing game phase', {
		gameId: gameId,
		type: type,
		currentPhase: currentPhase
	});
	console.log('Advancing game phase for ' + gameId);

	switch (type) {
		case 'acrofever':
			switch (currentPhase) {
				case 'category':
					Acrofever.goToAcroPhase(gameId, category);
					break;
				case 'acro':
					Acrofever.goToVotingPhase(gameId);
					break;
				case 'voting':
					Acrofever.goToEndRoundPhase(gameId);
					break;
				default:
					console.error('Unknown phase ' + currentPhase);
			}
			break;
		default:
			//Future game types
			console.error('Only acrofever game type is implemented yet');
	}
}