import Sendgrid from 'sendgrid';

import {Lobbies, Events} from '../../imports/collections';
import {getUserEmail} from './ServerHelpers';

const sendgrid = Sendgrid(Meteor.settings.sendgrid.key);

export function SendReminderEmails() {
    console.log("Running SendReminderEmails");
    //get all events that are starting in the next 15 minutes
    const time = moment().add(16, 'm').toDate();
    
    const events = Events.find({
        date: {$lte: time},
        notificationsSent: {$ne: true}
    });
    
    if (events.count() === 0) {
        console.log("No events coming up in the next fifteen");
        return;
    }
    
    events.forEach((event) => {
        if (event.users && event.users.length > 0) {
            const email = new sendgrid.Email();
            email.subject = "Acrofever event starting soon";
            email.from = "no-reply@acrofever.com";
            email.fromname = "Acrofever";
            email.setHtml(" ");
            email.setText(" ");
            email.setFilters({
                templates: {
                    settings: {
                        enable: 1,
                        'template_id': '39441cfb-da0e-49e2-9437-9bb318848093'
                    }
                }
            });

            const eventName = event.name,
                lobbyName = Lobbies.findOne(event.lobbyId).displayName,
                link = 'https://acrofever.com/play/' + event.lobbyId;

            Meteor.users.find({_id: {$in: event.users}}).forEach((user) => {
                const userEmail = getUserEmail(user);
                if (userEmail) {
                    email.addSmtpapiTo(userEmail);
                    email.addSubstitution(':link', link);
                    email.addSubstitution(':eventname', eventName);
                    email.addSubstitution(':lobbyname', lobbyName);
                }
            });

            console.log('email constructed');
            console.log(JSON.stringify(email));

            sendgrid.send(email, (err, res) => {
                if (err) return console.error(err);
                console.log(res);
            });
        } else {
            console.log('No user reminders set for this');
        }

        Events.update(event._id, {$set: {notificationsSent: true}});
    });
}