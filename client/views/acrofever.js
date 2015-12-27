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
	}
});

Template.chooseCategory.events({
	'click .categoryListItem': function(evt, template) {
		evt.preventDefault();
		var category = $(evt.currentTarget).html();
		var gameId = template.data._id;
		console.log(gameId);
		Meteor.call('acrofeverChooseCategory', gameId, category);
	},
	'submit form': function(evt, template) {
		evt.preventDefault();
		var form = $(evt.currentTarget);
		var customCategory = form.form('get values').customCategory;
		var gameId = template.data._id;
		Meteor.call('acrofeverChooseCategory', gameId, customCategory);
	}
});

Template.chooseCategory.onCreated(function() {
	var self = this;
	this.randomCategories = getRandomCategories();
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