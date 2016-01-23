Template.profileModal.helpers({
	ready: function() {
		return Template.instance().subscriptionsReady();
	},
	user: function() {
		var userId = Session.get('selectedProfileUserId');
		return Meteor.users.findOne(userId);
	}
});

Template.profileModal.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var userId = Session.get('selectedProfileUserId');
		self.subscribe('otherPlayers', [userId]);
	});
});

Template.profileModal.onRendered(function() {
	var modal = $(this.firstNode);
	modal.modal({
		detachable: false,
		observeChanges: true
	});
});

Template.userStats.helpers({
	gamesPlayedStat: function() {
		return (this.profile.stats && this.profile.stats.gamesPlayed) ? this.profile.stats.gamesPlayed : 0;
	},
	gamesWonStat: function() {
		return (this.profile.stats && this.profile.stats.gamesWon) ? this.profile.stats.gamesWon : 0;
	},
	winRateStat: function(gamesPlayed, gamesWon) {
		var percent = gamesWon / gamesPlayed * 100;
		if (_.isFinite(percent))
			return Math.round(percent);
		return 0;
	},
	hallOfFameStat: function() {
		var number = Template.instance().numberOfHallOfFame.get();
		if (number === 0) 
			return "0";
		else
			return number;
	}
});

Template.userStats.onCreated(function() {
	var self = this;
	self.numberOfHallOfFame = new ReactiveVar();
	Meteor.call('hallOfFameUserAcroCount', Session.get('selectedProfileUserId'), function(err, res) {
		if (err) console.log(err);
		self.numberOfHallOfFame.set(res);
	});
});