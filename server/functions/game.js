GameManager = {};

GameManager.makeGameActive = function(gameId) {
	//this function assumes that checks have already been made to ensure this game SHOULD go active
	var game = Games.findOne(gameId);

	console.log('Making game ' + gameId + 'active');

	if (!game || game.active)
		return console.error('Cannot make game ' + gameId + 'active. Aborting');

	//check if the time has passed the game's activeTimeout. If so, create a new game.
	var activeTimeout = game.activeTimeout;

	if (!activeTimeout || moment().isAfter(activeTimeout)) {
		//create a new game!!
		GameFunctions.startNewGame(game.lobbyId);
	} else {
		//reactivate this game in a new round
		GameFunctions.startNewRound(game.lobbyId, gameId, function(err) {
			if (err) {
				//notify admin cos what the F
				console.error('Error starting a new round: ' + err);
			} else {
				Games.update(gameId, {$set: {active: true}});
			}
		});
	}
}

GameManager.makeGameInactive = function(gameId) {
	var game = Games.findOne(gameId);

	console.log('Making game' + gameId + 'inactive');

	if (!game || !game.active)
		return console.error('Cannot make game ' + gameId + 'active. Aborting');

	var activeTimeout = moment().add(Meteor.settings.gameActiveTimeout, 'milliseconds');

	Games.update(gameId, {$set: {activeTimeout: activeTimeout, active: false}});
}

GameManager.startNewGame = function(lobbyId, type) {
	//start a new game in this lobby
	//assume checks have already been made and just go ahead and create a new game

	var newGame = {
		type: type,
		lobbyId: lobbyId,
		active: true,
		currentPhase: 'category',
		currentRound: 0,
		scores: []
	};

	var players = Lobbies.findOne(lobbyId).players;

	_.each(players, function(playerId) {
		scores.push({
			userId: playerId,
			score: 0
		});
	});

	var gameId = Games.insert(newGame);
	GameManager.startNewRound(lobbyId, gameId, players);
	Lobbies.update(lobbyId, {$push: {games: gameId}, $set: {currentGame: gameId}});
}

GameManager.startNewRound = function(lobbyId, gameId, players) {
	//start new round stuff

	if (!players)
		players = Lobbies.findOne(lobbyId).players;

	var round = {
		acronym: generateAcronym(),
		players: []
	}

	_.each(players, function(playerId) {
		players.push({
			active: true,
			userId: playerId,
			votes: 0,
			bonus: 0
		})
	});

	Games.update(gameId, {$push: {rounds: round}, $inc: {currentRound: 1}});
}

function generateAcronym() {
	var acronymSettings = Meteor.settings.acrofever.acronyms,
		letters = acronymSettings.letters,
		weighting = acronymSettings.weighting;

	//get the number of letters
	var numbersArray = [];
	for (var i = weighting.length - 1; i >= 0; i--) {
		var weight = weighting[i].weight;
		var numberLetters = weighting[i].letters;

		for (var q = weight - 1; q >= 0; q--) {
			numbersArray.push(numberLetters);
		};
	};

	var number = numbersArray[Math.floor(Random.fraction() * numbersArray.length)];
	var acronym = [];

	for (var i = 0; i < number; i++) {
		acronym.push(Random.choice(letters));
	}

	return acronym;
}