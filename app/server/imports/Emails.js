import Sendgrid from 'sendgrid';

import {Lobbies, Events} from '../../imports/collections';
import {getUserEmail} from './ServerHelpers';
import {displayName} from '../../imports/helpers';

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
                eventDescription = event.description,
                lobbyName = Lobbies.findOne(event.lobbyId).displayName,
                link = FlowRouter.url('lobby', {lobbyId: event.lobbyId});

            Meteor.users.find({_id: {$in: event.users}}).forEach((user) => {
                const userEmail = getUserEmail(user);
                if (userEmail) {
                    email.addSmtpapiTo(userEmail);
                    email.addSubstitution(':link', link);
                    email.addSubstitution(':eventname', eventName);
                    email.addSubstitution(':eventdescription', eventDescription);
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

export function SendInviteEmail(user, lobby, inviterId) {
    const email = new sendgrid.Email();
    email.subject = "You've been invited to play Acrofever";
    email.from = "no-reply@acrofever.com";
    email.fromname = "Acrofever";
    email.setHtml(" ");
    email.setText(" ");
    email.setFilters({
        templates: {
            settings: {
                enable: 1,
                'template_id': '51ed3537-583f-4792-bec7-cec0b7ae599e'
            }
        }
    });

    const userEmail = getUserEmail(user),
        lobbyName = lobby.displayName,
        inviterUsername = displayName(inviterId),
        link = FlowRouter.url('lobby', {lobbyId: lobby._id});

    if (!userEmail) {
        console.log('No user email');
        return;
    }

    email.addSmtpapiTo(userEmail);
    email.addSubstitution(':link', link);
    email.addSubstitution(':lobbyname', lobbyName);
    email.addSubstitution(':username', inviterUsername);

    sendgrid.send(email, (err, res) => {
        if (err) return console.error(err);
        console.log(res);
    });
}

export function SendShadowBannedNotification(bannedUserId, moderatorUserId, reason, banned) {
    const email = new sendgrid.Email();
    email.subject = `User has been ${banned ? 'BANNED' : 'UNBANNED'}`;
    email.from = "no-reply@acrofever.com";
    email.fromname = "Acrofever";
    email.setHtml(`The user ${displayName(bannedUserId)} (${bannedUserId}) has been ${banned ? 'BANNED' : 'UNBANNED'} by 
        ${displayName(moderatorUserId)} (${moderatorUserId}) for the following reason: ${reason}`);
    email.setText(`The user ${displayName(bannedUserId)} (${bannedUserId}) has been ${banned ? 'BANNED' : 'UNBANNED'} by 
        ${displayName(moderatorUserId)} (${moderatorUserId}) for the following reason: ${reason}`);
    email.addSmtpapiTo("christian@acrofever.com");

    sendgrid.send(email, (err, res) => {
        if (err) return console.error(err);
        console.log(res);
    });
}