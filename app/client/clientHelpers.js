Meteor.startup(() => {
    // Resync server time every 10 minutes
	Meteor.setInterval(() => {
		TimeSync.resync();
	}, 600000);
});