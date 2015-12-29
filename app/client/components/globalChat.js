Template.globalChat.onCreated(function() {
	var self = this;
	self.ready = new ReactiveVar();
	self.autorun(function() {
		var handle = Meteor.subscribe('globalChat');
		self.ready.set(handle.ready());
	});
});