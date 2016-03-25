import {Events} from '../../imports/collections';

export function UpdateRecurringEvents() {
    //get any recurring events that started over an hour ago
    const date = moment().subtract(1, 'h').toDate();
    Events.find({date: {$lte: date}, recurring: true}).forEach((event) => {
        //set the date a week in the future
        const newDate = moment(event.date).add(1, 'w').toDate();
        Events.update(event._id, {$set: {date: newDate, notificationsSent: false}});
    });
}