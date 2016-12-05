import trueskill from 'trueskill';

import {Games} from '../../imports/collections';

const skillEstimateMultiplier = 4;

export const RecalculateRankingForGame = (scores, date) => {
    if (!date)
        date = new Date();

    date = moment(date).valueOf();

    const players = [];
    _.each(scores, (score, playerId) => {
        let skill;
        const user = Meteor.users.findOne(playerId, {fields: {'profile.trueskill': true}});
        if (user && user.profile && user.profile.trueskill) {
            skill = [user.profile.trueskill.ranking, user.profile.trueskill.sigma];
        } else {
            skill = [25.0, 25.0/3.0];
        }

        players.push({
            playerId,
            skill,
            rank: -score
        });
    });

    trueskill.AdjustPlayers(players);

    _.each(players, player => {
        const skillEstimate = player.skill[0] - (skillEstimateMultiplier * player.skill[1]);
        Meteor.users.update({_id: player.playerId}, {
            $set: {
                'profile.trueskill': {
                    ranking: player.skill[0],
                    sigma: player.skill[1],
                    skillEstimate
                }
            },
            $push: {
                trueskillHistory: [date, Math.round(skillEstimate * 100) / 100]
            }
        });
    });
};

export const RecalculateAllRankings = () => {
    const gamesCursor = Games.find({
        gameWinner: {$exists: true}
    }, {
        fields: {scores: true, created: true},
        sort: {created: 1}
    });

    const totalGames = gamesCursor.count();
    let curGame = 0;

    gamesCursor.forEach(game => {

        RecalculateRankingForGame(game.scores, game.created);

        curGame++;
        console.log("Recalculated rankings for " + curGame + " of " + totalGames);
    });
};

export const ClearAllRankings = () => {
    Meteor.users.update({}, {$unset: {'profile.trueskill': true, trueskillHistory: true}}, {multi: true});
};