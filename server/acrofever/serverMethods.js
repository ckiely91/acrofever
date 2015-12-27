Meteor.methods({
	acrofeverChooseCategory: function(gameId, category) {
		check(category, String);
		if (category.length > 300)
			throw new Meteor.Error('invalid-input', 'Provided category string is too long');

		var userId = Meteor.userId();
		var game = Games.findOne(gameId);

		if (!userId || !game)
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		var currentRound = game.rounds[game.currentRound - 1];

		console.log(currentRound);

		if (currentRound.categoryChooser !== userId)
			throw new Meteor.Error('no-permission', 'You don\'t have permission to do that');

		//set the category and advance game round
		GameManager.advancePhase(gameId, 'acrofever', 'category', category);
	}
})