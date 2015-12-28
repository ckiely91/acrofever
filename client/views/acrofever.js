Template["acrofever-category"].helpers({
	isCategoryChooser: function(game) {
		var round = getCurrentRound(game);
		return (round.categoryChooser === Meteor.userId());
	},
	categoryChooserUsername: function(game) {
		var round = getCurrentRound(game);
		return displayname(round.categoryChooser, true);
	}
});

Template.chooseCategory.helpers({
	randomCategories: function() {
		return Template.instance().randomCategories;
	},
	hasPickedCategory: function() {
		return Template.instance().pickedCategory.get();
	}
});

Template.chooseCategory.events({
	'click .categoryListItem': function(evt, template) {
		evt.preventDefault();
		var category = $(evt.currentTarget).html();
		var gameId = template.data._id;
		
		template.pickedCategory.set(true);
		Meteor.call('acrofeverChooseCategory', gameId, category, function(err) {
			if (err) {
				console.error(err);
				template.pickedCategory.set(false);
			}
		});
	},
	'submit form': function(evt, template) {
		evt.preventDefault();
		var form = $(evt.currentTarget);
		var customCategory = form.form('get values').customCategory;
		var gameId = template.data._id;

		template.pickedCategory.set(true);
		Meteor.call('acrofeverChooseCategory', gameId, customCategory, function(err) {
			if (err) {
				console.error(err);
				template.pickedCategory.set(false);
			}
		});
	}
});

Template.chooseCategory.onCreated(function() {
	var self = this;
	self.randomCategories = getRandomCategories();
	self.pickedCategory = new ReactiveVar();
});

Template.chooseCategory.onRendered(function() {
	var form = this.$('form');
	form.form({
		fields: {
			customCategory: {
				identifier: 'customCategory',
				rules: [
					{
						type: 'empty',
						prompt: 'Enter a custom category'
					},
					{
						type: 'maxLength[100]',
						prompt: 'Enter at most 100 characters'
					}
				]
			}
		}
	})
});

Template.submitAcro.helpers({
	hasChosenAcro: function() {
		return Session.get('hasChosenAcro');
	},
	playerAcro: function(game) {
		var round = getCurrentRound(game);
		var userId = Meteor.userId();
		if (round.players[userId] && round.players[userId].submission)
			return round.players[userId].submission.acro;

		return false;
	}
});

Template.submitAcro.events({
	'click #changeAcro': function(evt, template) {
		evt.preventDefault();
		Session.set('hasChosenAcro', false);
	}
});

Template.submitAcro.onCreated(function() {
	var self = this;

	// see if this player already has a submission
	var game = self.data;
	var round = getCurrentRound(game);
	var userId = Meteor.userId();
	if (round.players[userId] && round.players[userId].submission) {
		Session.set('hasChosenAcro', true);
	} else {
		Session.set('hasChosenAcro', false);
	}
});

Template.submitAcroForm.events({
	'submit form': function(evt, template) {
		evt.preventDefault();
		var form = $(evt.currentTarget);
		var button = form.find('button');
		var acro = form.form('get values').acro;
		var gameId = template.data.game._id;
		
		button.addClass('loading');
		Meteor.call('acrofeverSubmitAcro', gameId, acro, function(err) {
			button.removeClass('loading');
			if (err) {
				form.form('add errors', [err.reason]);
			} else {
				Session.set('hasChosenAcro', true);
			}
		});
	}
});

Template.submitAcroForm.onRendered(function() {
	var form = $(this.firstNode);
	form.form({
		fields: {
			acro: {
				identifier: 'acro',
				rules: [
					{
						type: 'empty',
						prompt: 'You must submit an Acro!'
					},
					{
						type: 'maxLength[100]',
						prompt: 'Please submit an Acro under 100 characters'
					}
				]
			}
		}
	});
});

Template.acroVoting.helpers({
	roundAcros: function() {
		var game = this;
		var round = getCurrentRound(game);
		var acros = [];

		_.each(round.players, function(player, playerId) {
			if (playerId !== Meteor.userId() && player.submission) {
				acros.push({
					id: playerId,
					acro: player.submission.acro
				});
			}
		});

		return acros;
	},
	votedForThisAcro: function(game, id) {
		var round = getCurrentRound(game);
		var thisPlayer = round.players[Meteor.userId()];
		return (thisPlayer.vote === id);
	}
});

Template.acroVoting.events({
	'click a': function(evt, template) {
		evt.preventDefault();
		var id = $(evt.currentTarget).data().id;
		Meteor.call('acrofeverVoteForAcro', template.data._id, id);
	}
});

Template.acroEndRound.helpers({
	roundResults: function() {
		var game = this;
		var round = getCurrentRound(game);
		var array = [];
		_.each(round.players, function(player, playerId) {
			var obj = player;
			obj.id = playerId;
			array.push(obj);
		});
		return array.sort(function(a, b) {
			return totalPoints(b) - totalPoints(a);
		});
	}
});

Template.acroRoundResultsRow.helpers({
	totalPoints: function() {
		var results = this;
		return totalPoints(results);
	},
	accolades: function(round) {
		console.log(round);
		var results = this;
		var accolades = [];

		// round winner
		if (results.id === round.winner)
			accolades.push("Round winner");

		// Fastest submitter
		var thisTimeLeft = results.submission.timeLeft,
			isFastest = true;

		for (playerId in round.players) {
			console.log(playerId);
			console.log(round.players[playerId]);
			if (playerId !== results.id && round.players[playerId].submission.timeLeft < thisTimeLeft) {
				isFastest = false;
				break;
			}
		}
		if (isFastest)
			accolades.push("Fastest submitter");

		if (accolades.length > 0)
			return accolades.join('<br>');
		else
			return false;
	}
});

function totalPoints(results) {
	return results.votePoints + results.votedForWinnerPoints - results.notVotedNegativePoints + results.winnerPoints;
}