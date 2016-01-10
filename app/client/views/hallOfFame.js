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

	//SEO stuff
	var title = 'Hall of Fame - Acrofever';
	var description = 'The crème de la crème. Acrofever is an Acrophobia clone for the modern web. If you never played Acrophobia, it\'s a fun, zany word game in which players create phrases from a randomly generated acronym, then vote for their favourites.';
	var metadata = {
		'description': description,
		'og:description': description,
		'og:title': title,
		'og:image': 'https://acrofever.com/images/fb-image.png',
		'twitter:card': 'summary'
	};

	DocHead.setTitle(title);
	_.each(metadata, function(content, name) {
		DocHead.addMeta({name: name, content: content})
	});
});

