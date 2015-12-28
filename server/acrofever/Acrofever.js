Acrofever = {};

/* HELPER FUNCTIONS */

Acrofever.generateAcronym = function() {
	try {
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
	} catch(err) {
		console.error(err);
		Logger.error('Error generating acronym', {
			error: err
		});
	}
}


/* MAIN GAME PHASES */

Acrofever.goToAcroPhase = function(gameId, category) {
	var game = ensureCorrectPhase(gameId, 'category');

	if (!game) return;

	var lobby = Lobbies.findOne(game.lobbyId),
		roundIndex = game.currentRound - 1,
		round = game.rounds[roundIndex],
		acroTimeout = lobby.config.acronymTimeout;

	if (!category) {
		var category = Random.choice(DefaultCategories);
	}

	var setObj = {};
	setObj['rounds.' + roundIndex + '.category'] = category;
	setObj.currentPhase = 'acro';
	setObj.endTime = moment().add(acroTimeout, 'milliseconds').toDate();

	/* ie.
		{
			"rounds.2.category": "Category",
			currentPhase: "acro",
			endTime: 2015-11-23 01:09:41.788Z
		}
	*/

	Games.update(gameId, {$set: setObj, $currentDate: {lastUpdated: true}});

	Meteor.setTimeout(function() {
		GameManager.advancePhase(gameId, 'acrofever', 'acro');
	}, acroTimeout);
}

Acrofever.goToVotingPhase = function(gameId) {
	var game = ensureCorrectPhase(gameId, 'acro');

	if (!game) return;

	var lobby = Lobbies.findOne(game.lobbyId),
		votingTimeout = lobby.config.votingTimeout;

	//shuffle the players array
	var players = _.shuffle(game.players);

	Games.update(gameId, {$set: {
		currentPhase: 'voting',
		endTime: moment().add(votingTimeout, 'milliseconds').toDate(),
		players: players
	}});

	Meteor.setTimeout(function() {
		GameManager.advancePhase(gameId, 'acrofever', 'voting');
	}, votingTimeout);
}

Acrofever.goToEndRoundPhase = function(gameId) {
	/*	This needs to:
		1. Get the round winner and award points
		2. Determine if there is a game winner
		3. If there is a game winner, go to End Game, otherwise set the currentPhase to 'endround'
		4. Determine if there are still enough active players to start a new round
		5. If we can start a new round, set a timeout to do so
	*/

	var game = ensureCorrectPhase(gameId, 'voting');
	if (!game) return;

	var isWinner = getWinnerAndAwardPoints(game);

	/*if (isWinner) {
		//go to end game
	} else {
		//determine if there are still enough active players to start a new round
		var lobby = Lobbies.findOne(game.lobbyId),
			players = lobby.players,
			timeout = lobby.config.endOfRoundTimeout;

		Games.update(gameId, {$set: {
			currentPhase: 'endround',
			endTime: moment().add(timeout, 'milliseconds').toDate()
		}});

		if (players.length < Meteor.settings.acrofever.minimumPlayers) {
			GameManager.makeGameInactive(gameId);
			return;
		}

		Meteor.setTimeout(function() {
			GameManager.startNewRound(gameId);
		}, timeout);
	}*/
}







function ensureCorrectPhase(gameId, phase) {
	/*	This returns the game object only if it is in the correct phase
		Useful for making sure the game is in the correct phase and getting the game object at the same time */

	var game = Games.findOne(gameId);

	if (!game) {
		Logger.error('ensureCorrectPhase called on nonexistent game', {
			gameId: gameId
		});
		console.error('ensureCorrectPhase called on nonexistent game');
		return;
	}

	if (game.currentPhase === phase) {
		return game;
	}

	console.log('ensureCorrectPhase failed - game should be in ' + phase + ' phase');
}

function getWinnerAndAwardPoints(game) {
	/*	1.	Find player with highest number of votes and set as round winner
			- If there is a tie, break the tie with the player who had the most time left
		2.	Get the current scores
		3.	Update each object in scores array with each player's score for the round
			- points for being the winner
			- points for each person who voted for your acro
		4. 	Add this round's winning acro to winnerList for use in hall of fame vote later
		5.	See if there is an ultimate winner by comparing highest scores to winner score threshold
			- If there is one ultimate winner, go to end game with winner user(s)
	*/

	var lobby = Lobbies.findOne(game.lobbyId);

	var round = game.rounds[game.currentRound - 1],
		highestVotes = 0,
		winners = [];

	//Add to each player's votes for each one they received
	_.each(round.players, function(player, playerId) {
		var votedFor = player.vote;
		if (votedFor) {
			round.players[player.vote].votes++
		} else if (player.submission) {
			//player submitted an acro but didn't vote! dock 'em
			player.notVotedNegativePoints = lobby.config.notVotedNegativePoints;
		}
	});

	//Calculate each player's votePoints and also find the winner(s)
	_.each(round.players, function(player, playerId) {
		var votePoints = player.votes * lobby.config.votedPoints;
		player.votePoints += votePoints;

		if (player.votes > highestVotes) {
			winners = [{id: playerId, timeLeft: player.submission.timeLeft}];
			highestVotes = player.votes;
		} else if (player.votes === highestVotes) {
			winners.push({id: playerId, timeLeft: player.submission.timeLeft});
		}
	});

	//find the winner of this round
	var winner;
	if (winners.length === 1) {
		winner = winners[0];
	} else {
		//break the tie with timeLeft
		winner = _.last(_.sortBy(winners, 'timeLeft')).id;
	}

	round.winner = winner;

	//give points to people for voting for the winner (and give the winner points too)
	var ultimateWinners = [],
		ultimateHighScore = 0,
		endGamePoints = lobby.config.endGamePoints;
	_.each(round.players, function(player, playerId) {
		if (winner === playerId)
			player.winnerPoints = lobby.config.winnerPoints;

		if (winner === player.vote)
			player.votedForWinnerPoints = lobby.config.votedForWinnerPoints;

		var score = player.votePoints + player.winnerPoints + player.votedForWinnerPoints - player.notVotedNegativePoints;

		game.scores[playerId] += score;

		var newScore = game.scores[playerId];
		if (newScore >= endGamePoints) {
			if (newScore > ultimateHighScore) {
				ultimateWinners = [{id: playerId, score: newScore}];
			} else if (newScore === ultimateHighScore) {
				ultimateWinners.push({id: playerId, score: newScore});
			}
		}
	});

	//set the game object with new info
	var setObj = {};
	setObj['rounds.' + (game.currentRound - 1)] = round;
	setObj.scores = game.scores;
	setObj.currentPhase = 'endround';
	setObj.endTime = moment().add(lobby.config.endOfRoundTimeout, 'milliseconds').toDate();

	var winnerAcro = {
		round: game.currentRound,
		acro: round.players[round.winner].submission.acro,
		acronym: round.acronym,
		userId: round.winner,
		category: round.category
	};

	Games.update(game._id, {$set: setObj, $push: {winnerList: winnerAcro}, $currentDate: {lastUpdated: true}});

	// Is there anyone over gameEndPoints?
	if (ultimateWinners.length > 0) {
		goToEndGame(game._id, ultimateWinners);
	} else {
		//No winners yet, start a new round
		Meteor.setTimeout(function() {
			//refresh the lobby
			lobby = Lobbies.findOne(game.lobbyId);
			if (lobby.players.length < Meteor.settings.acrofever.minimumPlayers) {
				GameManager.makeGameInactive(game._id);
			} else {
				GameManager.startNewRound(game.lobbyId);
			}
		}, lobby.config.endOfRoundTimeout);
	}
}

function goToEndGame(gameId, winners) {
	/*	If there is more than one overall winner, resolve the tie:
		1. Go through all the rounds and add up total votes for each user, the one with the most wins the tie
		2. If still tied, go through and find the average time they took to submit acros, fastest one wins
		3. If still tied, go home, it's all over
	*/
	var game = Games.findOne(gameId),
		winner;

	winners = winners.map(function(thisWinner) {
		return thisWinner.id;
	});

	if (winners.length > 1) {
		// tiebreaks!
		// 1. Go through all the rounds and add up total votes for each user, the one with the most wins the tie
		var newWinners = [],
			highScore = 0;

		_.each(winners, function(id) {
			var totalVotes = 0;
			_.each(game.rounds, function(round) {
				totalVotes += round.players[id].votes;
			});
			if (totalVotes >= highScore) {
				newWinners.push(id);
				highScore = totalVotes;
			} else {
				var thisPlayerIndex = newWinners.indexOf(id);
				if (thisPlayerIndex > -	1)
					newWinners.splice(thisPlayerIndex, 1);
			}
		});

		if (newWinners.length === 1) {
			//winner found by first tiebreak
			winner = newWinners[0];
		} else {
			//2. If still tied, go through and find the average time they took to submit acros, fastest one wins
			var newNewWinners = [], // I know, I know
				lowestTime = Infinity; // space time continuum

			_.each(newWinners, function(id) {
				var timeLefts = [];
				_.each(game.rounds, function(round) {
					timeLefts.push(round.players[id].submission.timeLeft);
				});

				var avarageTime = 0;
				_.each(timeLefts, function(timeLeft) {
					averageTime += timeLeft;
				});
				avarageTime = avarageTime / timeLefts.length;

				if (averageTime <= lowestTime) {
					newNewWinners.push(id);
					lowestTime = averageTime;
				} else {
					var thisNewPlayerIndex = newNewWinners.indexOf(id);
					if (thisNewPlayerIndex > -	1)
						newNewWinners.splice(thisNewPlayerIndex, 1);
				}
			});

			if (newNewWinners.length === 1) {
				//winner found by second tiebreak
				winners = newNewWinners[0];
			} else {
				// either go buy a lottery ticket right now, or something fucked up
				winner = _.sample(newNewWinners);
			}
		}
	} else {
		// no tiebreak necessary
		winner = winners[0];
	}

	// we have a single winner
	var lobby = Lobbies.findOne(game.lobbyId, {fields: {
		config: true,
		players: true
	}});

	var endTime = moment().add(lobby.config.hallOfFameTimeout, 'milliseconds').toDate();

	Games.update(gameId, {$set: {
		currentPhase: 'endgame',
		endTime: endTime,
		gameWinner: winner
	}, $currentDate: {lastUpdated: true}});

	Meteor.setTimeout(function() {
		lobby = Lobbies.findOne(game.lobbyId);
		if (lobby.players.length < Meteor.settings.acrofever.minimumPlayers) {
			GameManager.makeGameInactive(gameId);
		} else {
			GameManager.startNewGame(game.lobbyId);
		}
	}, lobby.config.hallOfFameTimeout);
}