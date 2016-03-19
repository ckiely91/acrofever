import Acrofever from './Acrofever';
import LobbyManager from './LobbyManager';

import {Games, Lobbies} from '../../imports/collections';

const GameManager = {
    makeGameActive(gameId) {
        //this function assumes that checks have already been made to ensure this game SHOULD go active
        const game = Games.findOne(gameId);

        console.log('Making game ' + gameId + ' active');

        if (!game || game.active) {
            Logger.warn('GameManager.makeGameActive was called on a nonexistent or already active game', {gameId: gameId});
            console.error('GameManager.makeGameActive was called on a nonexistent or already active game: ' + gameId);
            return;
        }

        //check if the time has passed the game's activeTimeout. If so, create a new game.

        if (game.currentPhase === "endgame" || !game.activeTimeout || moment().isAfter(game.activeTimeout)) {
            //create a new game!!
            const delay = Meteor.settings.acrofever.newGameDelay,
                endTime = moment().add(delay, 'milliseconds').toDate();

            Lobbies.update(game.lobbyId, {$set: {newGameStarting: true, endTime: endTime}, $currentDate: {lastUpdated: true}});

            Meteor.setTimeout(function() {
                const lobby = Lobbies.findOne(game.lobbyId, {fields: {players: true}});
                if (lobby.players.length >= Meteor.settings.acrofever.minimumPlayers)
                    GameManager.startNewGame(game.lobbyId);
                else
                    Lobbies.update(game.lobbyId, {$set: {newGameStarting: false}, $currentDate: {lastUpdated: true}});
            }, delay);
        } else {
            //reactivate this game in a new round
            GameManager.startNewRound(game.lobbyId, true);
        }
    },
    makeGameInactive(gameId) {
        const game = Games.findOne(gameId);

        console.log('Making game' + gameId + 'inactive');

        if (!game || !game.active) {
            Logger.warn('GameManager.makeGameInactive was called on a nonexistent or already inactive game', {gameId: gameId});
            console.log('GameManager.makeGameInactive was called on a nonexistent or already inactive game: ' + gameId);
            return;
        }

        const activeTimeout = moment().add(Meteor.settings.gameActiveTimeout, 'milliseconds').toDate();

        Games.update(gameId, {$set: {activeTimeout: activeTimeout, active: false}});
        LobbyManager.addSystemMessage(game.lobbyId, 'This game is now inactive.', 'warning', 'It will resume when there are enough players.');
    },
    startNewGame(lobbyId, type) {
        //start a new game in this lobby
        //assume checks have already been made and just go ahead and create a new game
        if (!type)
            type = 'acrofever';

        try {
            let newGame = {
                type: type,
                lobbyId: lobbyId,
                active: true,
                currentPhase: 'category',
                currentRound: 0,
                scores: {},
                created: new Date(),
                lastUpdated: new Date()
            };

            const players = Lobbies.findOne(lobbyId).players;

            _.each(players, function(playerId) {
                newGame.scores[playerId] = 0;
            });

            const gameId = Games.insert(newGame);

            Logger.info('New game started', {lobbyId: lobbyId, gameId: gameId});
            console.log('New game started');

            Lobbies.update(lobbyId, {$push: {games: gameId}, $set: {currentGame: gameId, newGameStarting: false}, $currentDate: {lastUpdated: true}});
            LobbyManager.addSystemMessage(lobbyId, 'New game started.');

            GameManager.startNewRound(lobbyId);

        } catch(err) {
            console.error(err);
            Logger.error('Error starting new game', {
                error: err,
                lobbyId: lobbyId
            });
        }
    },
    startNewRound(lobbyId, setActive) {
        //start new round stuff
        try {
            const lobby = Lobbies.findOne(lobbyId),
                game = Games.findOne(lobby.currentGame);

            if (!game.active && !setActive) {
                //game is inactive, we can't start a new round. Making a game active will start the new round when it can.
                return;
            }

            const players = lobby.players;

            let round = {
                acronym: Acrofever.generateAcronym(),
                players: {}
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

            const categoryTimeout = lobby.config.categoryTimeout;
            let setObj = {
                currentPhase: 'category',
                endTime: moment().add(categoryTimeout, 'milliseconds').toDate(),
                active: true
            };

            // make sure all players have a score
            _.each(players, function(playerId) {
                if (!game.scores[playerId])
                    setObj['scores.' + playerId] = 0;
            });

            //Select random player to pick a category if they haven't yet
            let categoryChoosers = game.categoryChoosers;

            if (!categoryChoosers) {
                round.categoryChooser = _.sample(players);
                setObj.categoryChoosers = [round.categoryChooser];
            } else {
                let eligibleCategoryChoosers = [];
                _.each(players, function(playerId) {
                    if (categoryChoosers.indexOf(playerId) === -1)
                        eligibleCategoryChoosers.push(playerId);
                });

                if (eligibleCategoryChoosers.length > 0) {
                    round.categoryChooser = _.sample(eligibleCategoryChoosers);
                    categoryChoosers.push(round.categoryChooser);
                    setObj.categoryChoosers = categoryChoosers;
                } else {
                    round.categoryChooser = _.sample(players);
                    setObj.categoryChoosers = [round.categoryChooser];
                }
            }

            // was the last round completed? If not, overwrite this round
            let newRound = game.currentRound + 1;
            if (game.currentRound < 1 || game.rounds[game.currentRound - 1].winner) {
                Games.update(lobby.currentGame, {$set: setObj, $push: {rounds: round}, $inc: {currentRound: 1}, $currentDate: {lastUpdated: true}});
            } else {
                setObj['rounds.' + (game.currentRound - 1)] = round;
                newRound = game.currentRound;
                console.log('setObj');
                console.log(setObj);
                Games.update(lobby.currentGame, {$set: setObj, $currentDate: {lastUpdated: true}});
            }

            Logger.info('New round started', {lobbyId: lobbyId, gameId: lobby.currentGame});

            Meteor.setTimeout(function() {
                // Advance to acro phase
                GameManager.advancePhase(lobby.currentGame, 'acrofever', 'category', newRound);
            }, categoryTimeout);

        } catch(err) {
            console.error(err);
            Logger.error('Error starting new round', {
                error: err,
                lobbyId: lobbyId,
                gameId: lobby.currentGame
            });
        }
    },
    advancePhase(gameId, type, currentPhase, currentRound, category) {
        const game = Games.findOne(gameId, {fields: {
            lobbyId: true,
            currentPhase: true,
            currentRound: true
        }});

        if (game.currentPhase !== currentPhase || game.currentRound !== currentRound)
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

        Lobbies.update(game.lobbyId, {$currentDate: {lastUpdated: true}});
    }
};

export default GameManager;