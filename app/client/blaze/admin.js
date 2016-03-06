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

Template.adminNags.helpers({
	nags: function() {
		return Nags.find({},{sort: {timestamp: -1}});
	}
})

Template.adminNags.events({
	'submit form': function(evt) {
		evt.preventDefault();
		var form = $(evt.currentTarget);
		var fields = form.form('get values');
		var button = form.find('button');
		button.addClass('loading');

		if (fields.message.length > 0)
			fields.message = fields.message.replace(/\n/g,'<br>');

		Meteor.call('adminAddNag', fields, function(err) {
			button.removeClass('loading');
			if (err) {
				console.log(err);
			} else {
				form.trigger('reset');
			}
		});
	}
});

Template.adminNags.onCreated(function() {
	Meteor.subscribe('adminNags');
});

Template.adminNagRow.events({
	'click .editNag': function(evt, template) {
		evt.preventDefault();
		var action = $(evt.currentTarget).data('action');
		Meteor.call('adminEditNag', template.data._id, action);
	}
});

Template.blogAdmin.onCreated(function() {
	$('head').append('<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">');
	$('head').append('<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" rel="stylesheet">');
});

Template.blogAdminEdit.onCreated(function() {
	$('head').append('<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" rel="stylesheet">');
	$('head').append('<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" rel="stylesheet">');
});