Meteor.startup(() => {
    // Resync server time every 10 minutes
	Meteor.setInterval(() => {
		TimeSync.resync();
	}, 600000);

	Session.set('minuteUpdater', Date.now());
	//initialise reactive variable to update timestamps every minute
	Meteor.setInterval(() => {
		Session.set('minuteUpdater', Date.now());
	}, 60000);
});