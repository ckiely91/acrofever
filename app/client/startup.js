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

	if (Meteor.isCordova) {
		if (AdMob) {
			AdMob.createBanner( {
				adId: 'ca-app-pub-2611027061957213/5527254088',
				position: AdMob.AD_POSITION.BOTTOM_CENTER,
				isTesting: true,
				autoShow: true
			});
		} else {
		console.log("No Admob");
		}
	} else {
	  console.log("No Cordova ");
	}
});

Meteor.startup(function () {
  if (Meteor.isCordova && AdMob) {
  	AdMob.createBanner({
		adId: 'ca-app-pub-2611027061957213/5527254088',
		position: AdMob.AD_POSITION.BOTTOM_CENTER,
		autoShow: true
  	});
  }
});