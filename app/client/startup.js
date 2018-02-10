import { checkBanCookie } from '../imports/helpers';

Meteor.startup(() => {
	checkBanCookie();

	DocHead.loadScript("/timesync/timesync.min.js", () => {
		TimeSync = timesync.create({
			server: '/timesync',
			interval: 10000
		});
	});

	Session.set('minuteUpdater', Date.now());
	//initialise reactive variable to update timestamps every minute
	Meteor.setInterval(() => {
		Session.set('minuteUpdater', Date.now());
	}, 60000);
});