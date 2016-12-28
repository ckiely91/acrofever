import AcrofeverGameManager from './AcrofeverGameManager';
import LobbyManager from './LobbyManager';

import {displayName} from '../../imports/helpers';
import {Games, Lobbies, Categories} from '../../imports/collections';
import {RecalculateRankingForGame} from './Rankings';

const ensureCorrectPhase = (gameId, phase) => {
    /*	This returns the game object only if it is in the correct phase
     Useful for making sure the game is in the correct phase and getting the game object at the same time */

    const game = Games.findOne(gameId);

    if (!game) {
        Logger.error('ensureCorrectPhase called on nonexistent game', {
            gameId: gameId
        });
        console.error('ensureCorrectPhase called on nonexistent game');
        return;
    } else if (game.currentPhase === phase) {
        return game;
    }

    Logger.error('ensureCorrectPhase failed - game should be in ' + phase + ' phase', {
        gameId: gameId
    });
    console.log('ensureCorrectPhase failed - game should be in ' + phase + ' phase');
};

const goToEndGame = (game, winners) => {
    /*	If there is more than one overall winner, resolve the tie:
     1. Go through all the rounds and add up total votes for each user, the one with the most wins the tie
     2. If still tied, go through and find the average time they took to submit acros, fastest one wins
     3. If still tied, go home, it's all over
     */
    let winner, tiebreakText;

    winners = winners.map(w => w.id);

    if (winners.length > 1) {
        // Tiebreaks!
        // 1. Go through all the rounds and add up total votes for each user. The one with the most wins the tie
        let newWinners = [],
            highScore = 0;

        _.each(winners, id => {
            const totalVotes = game.rounds.reduce((val, round) => {
                if (round.players[id]) {
                    return val + round.players[id].votes;
                } else {
                    return val;
                }
            }, 0);

            if (totalVotes >= highScore) {
                newWinners.push(id);
                highScore = totalVotes;
            } else {
                const thisPlayerIndex = newWinners.indexOf(id);
                if (thisPlayerIndex > -1)
                    newWinners.splice(thisPlayerIndex, 1);
            }
        });

        if (newWinners.length === 1) {
            // Winner found by first tiebreak
            winner = newWinners[0];
            tiebreakText = "Tie was broken based on the number of votes received.";
        } else {
            // 2. If still tied, go through and find the average time they took to submit acros, fastest one wins
            let newNewWinners = [],
                lowestTime = Infinity;

            _.each(newWinners, id => {
                let timeLefts = [];
                _.each(game.rounds, function(round) {
                    if (round.players[id] && round.players[id].submission) {
                        timeLefts.push(round.players[id].submission.timeLeft);
                    }
                });

                const averageTime = timeLefts.reduce((sum, time) => sum + time, 0) / timeLefts.length;

                if (averageTime <= lowestTime) {
                    newNewWinners.push(id);
                    lowestTime = averageTime;
                } else {
                    let thisNewPlayerIndex = newNewWinners.indexOf(id);
                    if (thisNewPlayerIndex > -	1)
                        newNewWinners.splice(thisNewPlayerIndex, 1);
                }
            });

            if (newNewWinners.length === 1) {
                //winner found by second tiebreak
                winner = newNewWinners[0];
                tiebreakText = 'We tried to break the tie by the total votes received, but it was still tied! So the player with the fastest average time won.';
            } else {
                // either go buy a lottery ticket right now, or something fucked up
                winner = _.sample(newNewWinners);
            }
        }
    } else {
        // No tiebreak necessary
        winner = winners[0];
    }

    let lobby = Lobbies.findOne(game.lobbyId, {fields: {
        config: true,
        players: true,
        displayName: true
    }});

    const endTime = moment().add(lobby.config.hallOfFameTimeout, 'milliseconds').toDate();

    Games.update(game._id, {$set: {
        currentPhase: 'endgame',
        endTime,
        gameWinner: winner
    }, $currentDate: {lastUpdated: true}});

    LobbyManager.addSystemMessage(game.lobbyId, displayName(winner, true) + ' won the game!', 'star', tiebreakText);
    LobbyManager.addSystemMessage(null, displayName(winner, true) + ' won a game in lobby ' + lobby.displayName, 'star');

    Meteor.setTimeout(function() {
        lobby = Lobbies.findOne(game.lobbyId, {
            fields: {
                players: true,
                config: true
            }
        });
        if (lobby.players.length < Meteor.settings.acrofever.minimumPlayers) {
            AcrofeverGameManager.makeGameInactive(gameId);
        } else {
            AcrofeverGameManager.startNewGame(game.lobbyId);
        }
    }, lobby.config.hallOfFameTimeout);

    //update profiles with games played

    const thoseWhoPlayed = [];
    _.each(game.scores, function(score, player) {
        thoseWhoPlayed.push(player);
    });
    Meteor.users.update({_id: {$in: thoseWhoPlayed}}, {$inc: {'profile.stats.gamesPlayed': 1}}, {multi: true});
    Meteor.users.update(winner, {$inc: {'profile.stats.gamesWon': 1}});

    // Update rankings!
    RecalculateRankingForGame(game, game.created);

};

const getWinnerAndAwardPoints = game => {
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

    let lobby = Lobbies.findOne(game.lobbyId, {fields: {
            config: true
        }}),
        round = game.rounds[game.currentRound - 1];
    let highestVotes = 1,
        hasVoted = 0,
        winners = [];

    _.each(round.players, (player, playerId) => {
        if (player.vote) {
            hasVoted++;
            round.players[player.vote].votes++;
        } else {
            if (player.submission) {
                // Player submitted an acro but didn't vote! dock 'em
                player.notVotedNegativePoints = lobby.config.notVotedNegativePoints;
            } else {
                // Player didn't submit an acro and also didn't vote... how about last round?
                const lastRound = game.rounds[game.currentRound - 2];

                if (!lastRound)
                    return;

                const lastRoundPlayer = lastRound.players[playerId];
                if (lastRoundPlayer && !lastRoundPlayer.vote && !lastRoundPlayer.submission) {
                    // Remove this player from the lobby, they're inactive
                    Lobbies.update(game.lobbyId, {$pull: {players: playerId}});
                    LobbyManager.addSystemMessage(game.lobbyId, displayName(playerId, true) + ' was removed for being inactive');
                }
            }
        }
    });

    // Calculate each player's votePoints and also find the winner(s)
    _.each(round.players, (player, playerId) => {
        player.votePoints += player.votes & lobby.config.votedPoints;

        if (player.votes > highestVotes) {
            winners = [{id: playerId, timeLeft: player.submission.timeLeft}];
            highestVotes = player.votes;
        } else if (player.votes === highestVotes) {
            winners.push({id: playerId, timeLeft: player.submission.timeLeft});
        }
    });

    if (hasVoted === 0) {
        // No one voted? fuck it all
        Lobbies.update(game.lobbyId, {$set: {players: []}});
        LobbyManager.addSystemMessage(game.lobbyId, 'No one voted!', 'warning', 'All players have been removed from the lobby.');
        AcrofeverGameManager.makeGameInactive(game._id);
        return;
    }

    // Find the winner of this round
    let winner;
    if (winners.length === 1) {
        winner = winners[0];
    } else {
        // break the tie with timeLeft
        winner = _.last(_.sortBy(winners, 'timeLeft'));
    }

    round.winner = winner.id;

    LobbyManager.addSystemMessage(game.lobbyId, displayName(round.winner, true) + ' won the round!', 'empty star');

    // Give points to people for voting for the winner (and give the winner points too)
    let ultimateWinners = [],
        ultimateHighScore = 0,
        endGamePoints = lobby.config.endGamePoints;

    _.each(round.players, (player, playerId) => {
        if (round.winner === playerId)
            player.winnerPoints = lobby.config.winnerPoints;

        if (round.winner === player.vote)
            player.votedForWinnerPoints = lobby.config.votedForWinnerPoints;

        game.scores[playerId] += player.votePoints + player.winnerPoints + player.votedForWinnerPoints - player.notVotedNegativePoints;

        const newScore = game.scores[playerId];
        if (newScore >= endGamePoints) {
            if (newScore > ultimateHighScore) {
                ultimateWinners = [{id: playerId, score: newScore}];
                ultimateHighScore = newScore;
            } else if (newScore === ultimateHighScore) {
                ultimateWinners.push({id: playerId, score: newScore});
            }
        }
    });

    const setObj = {};
    setObj[`rounds.${game.currentRound - 1}`] = round;
    setObj.scores = game.scores;
    setObj.currentPhase = 'endround';
    setObj.endTime = moment().add(lobby.config.endOfRoundTimeout, 'milliseconds').toDate();

    const winnerAcro = {
        round: game.currentRound,
        acro: round.players[round.winner].submission.acro,
        acronym: round.acronym,
        userId: round.winner,
        category: round.category
    };

    Games.update(game._id, {$set: setObj, $push: {winnerList: winnerAcro}, $currentDate: {lastUpdated: true}});

    // Is there anyone over gameEndPoints?
    if (ultimateWinners.length > 0) {
        goToEndGame(game, winners);
    } else {
        // No winners yet, start a new round
        Meteor.setTimeout(() => {
            // Refresh the lobby
            lobby = Lobbies.findOne(game.lobbyId, {fields: {
                players: true,
                config: true
            }});
            if (lobby.players.length < Meteor.settings.acrofever.minimumPlayers) {
                AcrofeverGameManager.makeGameInactive(game._id);
            } else {
                AcrofeverGameManager.startNewRound(game.lobbyId);
            }
        }, lobby.config.endOfRoundTimeout);
    }
};


/* EXPORTED METHODS */

const Acrofever = {
    /* HELPER FUNCTIONS */
    generateAcronym() {
        try {
            const acronymSettings = Meteor.settings.acrofever.acronyms,
                letters = acronymSettings.letters,
                weighting = acronymSettings.weighting;

            //get the number of letters
            let numbersArray = [];

            for (let i = weighting.length - 1; i >= 0; i--) {
                const weight = weighting[i].weight,
                    numberLetters = weighting[i].letters;

                for (let q = weight - 1; q >= 0; q--) {
                    numbersArray.push(numberLetters);
                }
            }

            const number = numbersArray[Math.floor(Random.fraction() * numbersArray.length)];
            let acronym = [];

            for (let i = 0; i < number; i++) {
                acronym.push(Random.choice(letters));
            }

            return acronym;
        } catch(err) {
            console.error(err);
            Logger.error('Error generating acronym', {
                error: err
            });
        }
    },

    calculateRemainingTime(base, multiplier, num, max) {
        const val = base + (multiplier * num);
        return (max && val > max) ? max : val;
    },

    /* MAIN GAME PHASES */
    goToAcroPhase(gameId, category) {
        const game = ensureCorrectPhase(gameId, 'category');

        if (!game) return;

        const lobby = Lobbies.findOne(game.lobbyId, {fields: { config: true }}),
            roundIndex = game.currentRound - 1;

        let acroTimeout;

        if (lobby.config.timeouts) {
            const timeouts = lobby.config.timeouts,
                currentAcroLength = game.rounds[roundIndex].acronym.length;

            acroTimeout = this.calculateRemainingTime(timeouts.acroBase, timeouts.acroMultiplier, currentAcroLength);
        } else {
            acroTimeout = lobby.config.acronymTimeout;
        }

        if (!category) {
            // Get a category at random
            category = Categories.aggregate([
                {$match: {active: true}},
                {$sample: {size: 1}}
            ])[0].category;
        }

        let setObj = {};
        setObj['rounds.' + roundIndex + '.category'] = category;
        setObj.currentPhase = 'acro';
        setObj.endTime = moment().add(acroTimeout, 'milliseconds').toDate();

        Games.update(gameId, {$set: setObj, $currentDate: {lastUpdated: true}});

        Meteor.setTimeout(function() {
            AcrofeverGameManager.advancePhase(gameId, 'acro', game.currentRound);
        }, acroTimeout);
    },
    goToVotingPhase(gameId) {
        const game = ensureCorrectPhase(gameId, 'acro');

        if (!game) return;

        let submissions = 0;
        _.each(game.rounds[game.currentRound - 1].players, function(player) {
            if (player.submission)
                submissions++;
        });

        if (submissions === 0) {
            // nobody submitted an acro this round
            // remove all players from lobby and set game inactive
            Lobbies.update(game.lobbyId, {$set: {players: []}});
            LobbyManager.addSystemMessage(game.lobbyId, 'No one submitted an Acro!', 'warning', 'All players have been removed from the lobby.');
            AcrofeverGameManager.makeGameInactive(gameId);
            return;
        }

        const lobby = Lobbies.findOne(game.lobbyId, {fields: { config: true }});

        let votingTimeout;

        if (lobby.config.timeouts) {
            const timeouts = lobby.config.timeouts;
            const numLetters = game.rounds[game.currentRound - 1].acronym.length;
            const numLettersOver4 = numLetters > 4 ? numLetters - 4 : 0;

            votingTimeout = this.calculateRemainingTime(timeouts.votingBase, timeouts.votingMultiplier + numLettersOver4, submissions, 60000);
        } else {
            votingTimeout = lobby.config.votingTimeout;
        }

        //shuffle the players array
        const players = _.shuffle(game.players);

        Games.update(gameId, {$set: {
            currentPhase: 'voting',
            endTime: moment().add(votingTimeout, 'milliseconds').toDate(),
            players: players
        }});

        Meteor.setTimeout(function() {
            AcrofeverGameManager.advancePhase(gameId, 'voting', game.currentRound);
        }, votingTimeout);
    },
    goToEndRoundPhase(gameId) {
        /*	This needs to:
         1. Get the round winner and award points
         2. Determine if there is a game winner
         3. If there is a game winner, go to End Game, otherwise set the currentPhase to 'endround'
         4. Determine if there are still enough active players to start a new round
         5. If we can start a new round, set a timeout to do so
         */

        const game = ensureCorrectPhase(gameId, 'voting');
        if (!game) return;

        getWinnerAndAwardPoints(game);
    }
};

export default Acrofever;