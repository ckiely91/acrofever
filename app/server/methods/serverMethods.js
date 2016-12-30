import AcrofeverGameManager from '../imports/AcrofeverGameManager';
import {Games, Lobbies, HallOfFame, Categories} from '../../imports/collections';

standardAcrofeverMethodChecks = (gameId, userId, phase, inputRequired, inputString) => {
    if (inputRequired) {
        check(inputString, String);
        if (inputString.length < 1 || inputString.length > 300)
            throw new Meteor.Error('invalid-input', 'Provided input is too long or too short');
    }

    const game = Games.findOne(gameId);

    if (!userId || !game)
        throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

    if (game.currentPhase !== phase)
        throw new Meteor.Error('wrong-phase', 'You can\'t take that action in the current game phase.');

    return game;
};

Meteor.methods({
	getRandomCategories(num) {
		if (!num || num > 10)
			num = 4;

		return Categories.aggregate([
			{$match: {active: true}},
			{$project: {category: true, custom: true, userId: true}},
			{$sample: {size: num}}
		]);
	},
	acrofeverChooseCategory(gameId, category) {
		check(gameId, String);
		check(category, String);

		const game = standardAcrofeverMethodChecks(gameId, this.userId, 'category', true, category);

		const currentRound = game.rounds[game.currentRound - 1];

		if (currentRound.categoryChooser !== this.userId)
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		//set the category and advance game round
		AcrofeverGameManager.advancePhase(gameId, 'category', game.currentRound, category);

		// If this is a custom category, save it, otherwise increment the chosen amount
		Categories.upsert(
			{category},
			{
				$setOnInsert: {
					custom: true,
					active: false,
					userId: this.userId,
					createdAt: new Date()
				},
				$inc: {
					timesChosen: 1
				}
			}
		);
	},
	acrofeverSubmitAcro(gameId, acro) {
		check(gameId, String);
		check(acro, String);

		//strip new lines from acro string
		acro = acro.replace('\n', ' ');

		const game = standardAcrofeverMethodChecks(gameId, this.userId, 'acro', true, acro),
			roundIndex = game.currentRound - 1,
			currentRound = game.rounds[roundIndex];

		// check if this user in the current round
		if (!currentRound.players[this.userId])
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		const timeLeft = moment(game.endTime) - moment(),
			setObj = {};

		setObj['rounds.' + roundIndex + '.players.' + this.userId + '.submission'] = {
			acro: acro,
			timeLeft: timeLeft
		};

		Games.update(gameId, {$set: setObj});

		// has everyone else submitted their acro?
		const totalPlayers = Object.keys(currentRound.players).length - 1;
		let submittedPlayers = 0;

		_.each(currentRound.players, (player, playerId) => {
			if (playerId !== this.userId && player.submission) {
				submittedPlayers++;
			}
		});

		if (submittedPlayers === totalPlayers) {
			//everyone has submitted! advance the game phase
			AcrofeverGameManager.advancePhase(gameId, 'acro', game.currentRound);
		}
	},
	voteForHallOfFame(gameId, data) {
		if (!this.userId)
			throw new Meteor.Error('no-permission', 'You must be logged in to do that');

		if (this.userId === data.id)
			throw new Meteor.Error('no-permission', 'You can\'t vote for your own acro');

		const game = Games.findOne(gameId, {fields: {
			scores: true
		}});

		if (!game || !game.scores[data.id])
			return;

		const created = new Date();

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
				votes: this.userId
			}
		});
	},
	findPlayNowLobbyId() {
		const lobbies = Lobbies.find({official: true}, {fields: { players: true }});
		let inLobby;

		// find the lobby with the most players
		let lobbiesWithPlayers = [],
			mostPlayers = 1;

		const allLobbies = [];

		// if they're already in a lobby, throw them in one
		lobbies.forEach(lobby => {
			allLobbies.push(lobby._id);
			if (this.userId && lobby.players.indexOf(this.userId) > - 1)
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