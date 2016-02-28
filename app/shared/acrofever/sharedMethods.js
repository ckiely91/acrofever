Meteor.methods({
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