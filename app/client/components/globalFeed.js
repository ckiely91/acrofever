Template.globalFeed.helpers({
	ready: function() {
		return Template.instance().ready.get();
	},
	events: function() {
		return GlobalFeed.find({},{sort: {timestamp:-1}});
	},
	showGetMoreDiv: function(events) {
		return (events.count() === Session.get('globalFeedLimit'));
	}
});

Template.globalFeed.onCreated(function() {
	var self = this;
	self.ready = new ReactiveVar();
	Session.set('globalFeedLimit', 20);
	self.autorun(function() {
		var handle = Meteor.subscribe('globalFeed', Session.get('globalFeedLimit'));
		self.ready.set(handle.ready());
		if (handle.ready()) {
			var playerIds = [];
			GlobalFeed.find().forEach(function(event) {
				if (event.user)
					playerIds.push(event.user);
			});
			Meteor.subscribe('otherPlayers', playerIds);
		}
	});
});

Template.globalFeed.onRendered(function() {
	var self = this;
	var feedOuter = this.$('.feedChatDiv');
	var feed = feedOuter.find('.feedInner');
	feed.scroll(function() {
		var fadeUpper = feedOuter.find('.fade.upper');
		var fadeLower = feedOuter.find('.fade.lower');
		var scroll = feed.scrollTop();
		if (scroll > 50) {
			fadeUpper.css('opacity', 1);
		} else {
			fadeUpper.css('opacity', scroll / 50);
		}

		var innerFeed = feed.find('.feed');
		var bottomScroll = innerFeed.height() - scroll - feedOuter.height();

		if (bottomScroll > 50) {
			fadeLower.css('opacity', 1);
		} else {
			fadeLower.css('opacity', bottomScroll / 50);
		}

		var getMoreDiv = $('.getMoreDiv');
		if (getMoreDiv.length && getMoreDiv.isOnScreen()) {
			var limit = Session.get('globalFeedLimit');
			limit += 20;
			if (limit <= 200) {
				Session.set('globalFeedLimit', limit);
			}
		}
	});
});

Template.globalChatInput.events({
	'submit #chat-input-form' : function (evt, template) {
		evt.preventDefault();
		if (Meteor.userId()) {
			var message = $("#chat-input-box").val();
			Meteor.call('addGlobalFeedChat', message);
			$("#chat-input-form").trigger('reset');
			$('.feedChatDiv .feedInner').scrollTop(0);
		} else {
			FlowRouter.go('/sign-in');
		}
	}
});