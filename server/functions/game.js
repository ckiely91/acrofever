GameFunctions = {};

GameFunctions.makeGameActive = function(gameId) {
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
		GameFunctions.startNewRound(gameId, function(err) {
			if (err) {
				//notify admin cos what the F
				console.error('Error starting a new round: ' + err);
			} else {
				Games.update(gameId, {$set: {active: true}});
			}
		});
	}
}

GameFunctions.makeGameInactive = function(gameId) {
	var game = Games.findOne(gameId);

	console.log('Making game' + gameId + 'inactive');

	if (!game || !game.active)
		return console.error('Cannot make game ' + gameId + 'active. Aborting');

	var activeTimeout = moment().add(Meteor.settings.gameActiveTimeout, 'milliseconds');

	Games.update(gameId, {$set: {activeTimeout: activeTimeout, active: false}});
}

GameFunctions.startNewGame = function(lobbyId) {
	//start a new game in this lobby
	//assume checks have already been made and just go ahead and create a new game

}

GameFunctions.startNewRound = function(gameId, callback) {
	//start new round stuff
	//callback(err) for errors
	//callback() for success
}

