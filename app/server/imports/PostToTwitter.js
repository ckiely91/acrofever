import {HallOfFame} from '../../imports/collections';
import {displayName} from '../../imports/helpers';
import Twitter from 'twitter';

export default function() {
    // Find all the HOF entries that haven't been posted yet
    console.log("Running PostToTwitter job");
    const entries = HallOfFame.find({active: true, postedToTwitter: {$ne: true}});

    if (entries.count() === 0) return console.log("No entries to post!");

    // get a random entry
    const hofEntry = _.sample(entries.fetch());
    console.log(`Posting ${hofEntry._id} to twitter`);

    postToTwitter(hofEntry, Meteor.bindEnvironment((err) => {
        if (err) {
            console.error("Error posting to twitter:");
            console.error(err);
        }

        // Update entry to mark it as posted
        HallOfFame.update(hofEntry._id, {$set: {postedToTwitter: true}});
    }));
}


function postToTwitter(hofEntry, callback) {
    // construct a tweet with efficient use of characters

    let charsLeft = 127;

    const acronym = hofEntry.acronym.join('');
    charsLeft -= acronym.length;

    const acro = truncateString(hofEntry.acro, 70);
    charsLeft -= acro.len;

    const category = truncateString(hofEntry.category, charsLeft);
    charsLeft -= category.len;

    let username;
    if (charsLeft > 8) {
        username = truncateString(displayName(hofEntry.userId), charsLeft - 5);
    }

    // Who should be the next pres? (ACRO) - "Donal Trump Obvs", by Christian
    let tweet = `${category.str} (${acronym}) - "${acro.str}"`;
    if (username) {
        tweet += ', by ' + username.str;
    }

    console.log(tweet);

    const client = new Twitter({
        consumer_key: Meteor.settings.twitterPoster.consumerKey,
        consumer_secret: Meteor.settings.twitterPoster.consumerSecret,
        access_token_key: Meteor.settings.twitterPoster.accessTokenKey,
        access_token_secret: Meteor.settings.twitterPoster.accessTokenSecret
    });

    client.post('statuses/update', {status: tweet}, function(err, twt, res) {
        if (err)
            return callback(err);

        console.log('Posted tweet');
        callback();
    });

    function truncateString(str, len) {
        if (str.length <= len)
            return {str, len: str.length};

        return {str: str.substring(0, len - 1) + '…', len: len};
    }
}