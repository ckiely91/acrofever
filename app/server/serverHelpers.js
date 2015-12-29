checkCorrectPhase = function(game, phase) {
	if (game.currentPhase !== phase)
		throw new Meteor.Error('wrong-phase', 'You can\'t take that action in the current game phase.');
}