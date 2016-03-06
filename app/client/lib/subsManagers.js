lobbySubs = new SubsManager();

Meteor.startup(() => {
    Session.set('minuteUpdater', Date.now());
    //initialise reactive variable to update timestamps every minute
    Meteor.setInterval(() => {
        Session.set('minuteUpdater', Date.now());
    }, 60000);
});