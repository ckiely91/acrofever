Template.adminMain.helpers({
	isAdminUser: function() {
		return ReactiveMethod.call('isAdminUser');
	}
});

Template.adminHallOfFame.helpers({
	hallOfFame: function() {
		return HallOfFame.find();
	}
});

Template.adminHallOfFameRow.events({
	'click .makeActive': function(evt, template) {
		evt.preventDefault();
		var dimmer = $('.ui.page.dimmer');
		dimmer.dimmer('show');
		Meteor.call('adminEditHallOfFameEntry', template.data._id, {activate: true}, function(err) {
			dimmer.dimmer('hide');
			if (err) {
				alert(err.reason);
				console.error(err);
			}
		});
	},
	'click .makeInactive': function(evt, template) {
		evt.preventDefault();
		var dimmer = $('.ui.page.dimmer');
		dimmer.dimmer('show');
		Meteor.call('adminEditHallOfFameEntry', template.data._id, {deactivate: true}, function(err) {
			dimmer.dimmer('hide');
			if (err) {
				alert(err.reason);
				console.error(err);
			}
		});
	},
	'click .delete': function(evt, template) {
		evt.preventDefault();
		var dimmer = $('.ui.page.dimmer');
		dimmer.dimmer('show');
		Meteor.call('adminEditHallOfFameEntry', template.data._id, {delete: true}, function(err) {
			dimmer.dimmer('hide');
			if (err) {
				alert(err.reason);
				console.error(err);
			}
		});
	}
});

Template.adminHallOfFame.onCreated(function() {
	var self = this;
	this.autorun(function() {
		var handle = Meteor.subscribe('adminHallOfFame');
		if (handle.ready()) {
			var userIds = [];
			HallOfFame.find().forEach(function(item) {
				userIds.push(item.userId);
			});
			Meteor.subscribe('otherPlayers', userIds);
		}
	});
});