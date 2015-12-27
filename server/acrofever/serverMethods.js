Meteor.methods({
	acrofeverChooseCategory: function(gameId, category) {
		var userId = this.userId;
		var game = standardAcrofeverMethodChecks(gameId, userId, 'category', true, category);

		var currentRound = game.rounds[game.currentRound - 1];

		if (currentRound.categoryChooser !== userId)
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		//set the category and advance game round
		GameManager.advancePhase(gameId, 'acrofever', 'category', category);
	},
	acrofeverSubmitAcro: function(gameId, acro) {
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

		console.log(submittedPlayers);
		console.log(totalPlayers);

		if (submittedPlayers === totalPlayers) {
			//everyone has submitted! advance the game phase
			console.log("Everyone has submitted");
			GameManager.advancePhase(gameId, 'acrofever', 'acro');
		}
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
}