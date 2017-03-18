import { checkBanCookie } from '../imports/helpers';

Meteor.startup(() => {
	checkBanCookie();

	// Resync server time every 10 minutes
	Meteor.setInterval(() => {
		TimeSync.resync();
	}, 600000);

	Session.set('minuteUpdater', Date.now());
	//initialise reactive variable to update timestamps every minute
	Meteor.setInterval(() => {
		Session.set('minuteUpdater', Date.now());
	}, 60000);

	if (Meteor.isCordova && AdMob) {
	  	AdMob.createBanner({
			adId: 'ca-app-pub-2611027061957213/5527254088',
			position: AdMob.AD_POSITION.BOTTOM_CENTER,
			autoShow: true,
			isTesting: false
	  	});

	  	AdMob.prepareInterstitial({
	        adId: 'ca-app-pub-2611027061957213/9957453687',
	        autoShow: false,
	        isTesting: false
	    });
	}
});