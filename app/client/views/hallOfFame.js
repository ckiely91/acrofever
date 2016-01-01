Template.hallOfFame.helpers({
	ready: function() {
		return Template.instance().ready.get();
	},
	hallOfFameAcros: function() {
		return HallOfFame.find({}, {sort: {created: -1}});
	},
	hasNotReachedLimit: function(hallOfFameAcros) {
		var limit = Template.instance().limit.get();
		return (limit < ReactiveMethod.call('hallOfFameAcroCount'));
	}
});

Template.hallOfFame.events({
	'click #getMore': function(evt, template) {
		evt.preventDefault();
		var limit = template.limit.get();
		console.log(limit);
		limit += 18;
		template.limit.set(limit);
	}
})

Template.hallOfFame.onCreated(function() {
	var self = this;
	self.limit = new ReactiveVar(18);
	self.ready = new ReactiveVar();
	self.autorun(function() {
		console.log(self.limit);
		var handle = Meteor.subscribe('hallOfFame', self.limit.get());
		self.ready.set(handle.ready());
		if (handle.ready()) {
			var userIds = [];
			HallOfFame.find().forEach(function(item) {
				userIds.push(item.userId);
			});
			Meteor.subscribe('otherPlayers', userIds);
		}
	});
});

