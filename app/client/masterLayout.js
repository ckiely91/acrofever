Template.pageDimmer.onRendered(function() {
	$(this.firstNode).dimmer({
		closable: false
	});
});

Template.masterLayout.helpers({
	notificationsSupported: function() {
		if (typeof Notification !== 'undefined')
			return true;
		else
			return false;
	}
});

Template.masterLayout.onRendered(function() {
	//general helper functions, jquery stuff available on all pages goes here
	$.fn.isOnScreen = function(){
	    //jQuery function to check if an element is in the viewport
	    var win = $(window);
	    
	    var viewport = {
	        top : win.scrollTop(),
	        left : win.scrollLeft()
	    };
	    viewport.right = viewport.left + win.width();
	    viewport.bottom = viewport.top + win.height();
	    
	    var bounds = this.offset();
	    bounds.right = bounds.left + this.outerWidth();
	    bounds.bottom = bounds.top + this.outerHeight();
	    
	    return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	    
	};
});

Template.masterLayout.onCreated(function() {
	DocHead.setTitle('Acrofever');
});

Template.nags.helpers({
	nags: function() {
		var user = Meteor.user();
		if (!user)
			return false;

		var closedNags = (user.profile && user.profile.closedNags) ? user.profile.closedNags : [];
		var nags = Nags.find({active: true, _id: {$not: {$in: closedNags}}}, {sort: {timestamp: -1}});
		if (nags.count() > 0)
			return nags;
		else
			return false;
	}
});

Template.nags.onCreated(function() {
	var self = this;
	self.autorun(function() {
		var user = Meteor.user();
		if (user) {
			if (user.profile && user.profile.closedNags) {
				Meteor.subscribe('nags', user.profile.closedNags);
			} else {
				Meteor.subscribe('nags');
			}
		}
	})
});

Template.nag.events({
	'click .close': function(evt, template) {
		evt.preventDefault();
		$(evt.currentTarget).closest('.message').transition('fade', '300ms');
		Meteor.setTimeout(function() {
			//allow it to fade out first
			Meteor.call('markNagAsClosed', template.data._id);
		}, 300);
	}
});

Template.notificationInfoModal.onRendered(function() {
	var modal = $(this.firstNode);
	modal.modal({
		detachable: false,
		observeChanges: true
	});
});