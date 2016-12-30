import trueskill from 'trueskill';

import {Games} from '../../imports/collections';

const baseRanking = 25.0,
    skillEstimateMultiplier = 5;

export const IsRankedGameForUser = (rounds, playerId) => {
    const playedRounds = rounds.reduce((prev, round) => {
        return round.players[playerId] && (round.players[playerId].submission || round.players[playerId].vote) ? prev + 1 : prev;
    }, 0);

    return (playedRounds / rounds.length >= 0.4);
};

/*
    Sets three global parameters used in the TrueSkill algorithm.
    beta is a measure of how random the game is.  You can think of it as
    the difference in skill (mean) needed for the better player to have
    an ~80% chance of winning.  A high value means the game is more
    random (I need to be *much* better than you to consistently overcome
    the randomness of the game and beat you 80% of the time); a low
    value is less random (a slight edge in skill is enough to win
    consistently).  The default value of beta is half of INITIAL_SIGMA
    (the value suggested by the Herbrich et al. paper).
    epsilon is a measure of how common draws are.  Instead of specifying
    epsilon directly you can pass draw_probability instead (a number
    from 0 to 1, saying what fraction of games end in draws), and
    epsilon will be determined from that.  The default epsilon
    corresponds to a draw probability of 0.1 (10%).  (You should pass a
    value for either epsilon or draw_probability, not both.)
    gamma is a small amount by which a player's uncertainty (sigma) is
    increased prior to the start of each game.  This allows us to
    account for skills that vary over time; the effect of old games
    on the estimate will slowly disappear unless reinforced by evidence
    from new games.

     if beta is null
        BETA = INITIAL_SIGMA / 2.0
     else
        BETA = beta

     if epsilon is null
        if draw_probability is null
            draw_probability = 0.10
            EPSILON = DrawMargin(draw_probability, BETA)
        else
            EPSILON = epsilon

     if gamma is null
        GAMMA = INITIAL_SIGMA / 100.0
     else
        GAMMA = gamma
 */

const initialSigma = baseRanking / skillEstimateMultiplier,
    trueskillBeta = null,
    trueskillEpsilon = null,
    trueskillGamma = null;

trueskill.SetParameters(trueskillBeta, trueskillEpsilon, null, trueskillGamma);

export const RecalculateRankingForGame = (game, date) => {
    if (game.unranked === true) {
        console.log(`Game ${game._id} is unranked!`);
        return;
    }

    if (!date)
        date = new Date();

    date = moment(date).valueOf();

    const players = [];
    _.each(game.scores, (score, playerId) => {
        if (!IsRankedGameForUser(game.rounds, playerId)) return;

        let skill;
        const user = Meteor.users.findOne(playerId, {fields: {'profile.trueskill': true}});
        if (user && user.profile && user.profile.trueskill) {
            skill = [user.profile.trueskill.ranking, user.profile.trueskill.sigma];
        } else {
            skill = [baseRanking, initialSigma];
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
                'profile.trueskill.ranking': player.skill[0],
                'profile.trueskill.sigma': player.skill[1],
                'profile.trueskill.skillEstimate': skillEstimate
            },
            $inc: {
                'profile.trueskill.rankedGames': 1
            },
            $push: {
                trueskillHistory: [date, Math.round(skillEstimate * 100) / 100]
            }
        });
    });
};

export const DecayUserSigmaForMonth = (date) => {
    date = date ? moment(date) : moment();
    console.log("Decaying ranking sigma for month of " + date.format('MM-YYYY'));

    const decaySigma = 0.5;

    const startDate = date.subtract(1, 'month').toDate(),
        endDate = date.toDate();

    const knownUsers = Meteor.users.find({
        createdAt: {$lte: startDate}
    }, {
        fields: {
            _id: true
        }
    }).map(user => user._id);

    const usersPlayed = [];

    Games.find({
        gameWinner: {$exists: true},
        created: {
            $gte: startDate,
            $lt: endDate
        }
    }, {
        fields: {
            scores: true
        }
    }).forEach(game => {
        _.each(game.scores, (score, playerId) => {
            if (score > 0 && usersPlayed.indexOf(playerId) === -1) {
                usersPlayed.push(playerId);
            }
        });
    });

    const usersNotPlayed = _.difference(knownUsers, usersPlayed);

    console.log("Decaying " + usersNotPlayed.length + "users");

    Meteor.users.find({
        _id: {$in: usersNotPlayed},
        'profile.trueskill.sigma': {$lte: initialSigma - decaySigma}
    }).forEach(user => {
        const newSigma = user.profile.trueskill.sigma + decaySigma,
            newSkillEstimate = user.profile.trueskill.ranking - (skillEstimateMultiplier * newSigma);
        Meteor.users.update(user._id, {
            $set: {
                'profile.trueskill.sigma': newSigma,
                'profile.trueskill.skillEstimate': newSkillEstimate
            }
        });
        console.log(`Updated player ${user._id}: Sigma ${newSigma}, Estimate ${newSkillEstimate}`);
    });

};

export const RecalculateAllRankings = () => {
    const gamesCursor = Games.find({
        gameWinner: {$exists: true}
    }, {
        fields: {scores: true, rounds: true, created: true, unranked: true},
        sort: {created: 1}
    });

    const totalGames = gamesCursor.count();
    let curGame = 0;

    let curMonth = moment(gamesCursor.fetch()[0].created).format('MM-YYYY');

    gamesCursor.forEach(game => {
        const thisMonth = moment(game.created).format('MM-YYYY');
        if (thisMonth !== curMonth) {
            curMonth = thisMonth;
            DecayUserSigmaForMonth(game.created);
        }

        RecalculateRankingForGame(game, game.created);

        curGame++;
        console.log("Recalculated rankings for " + curGame + " of " + totalGames);
    });
};

export const ClearAllRankings = () => {
    Meteor.users.update({}, {$unset: {'profile.trueskill': true, trueskillHistory: true}}, {multi: true});
};