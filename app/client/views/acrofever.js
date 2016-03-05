/* Template.submitAcro.helpers({
    hasChosenAcro: function() {
        return Session.get('hasChosenAcro');
    },
    playerAcro: function(game) {
        var round = getCurrentRound(game);
        var userId = Meteor.userId();
        if (round.players[userId] && round.players[userId].submission)
            return round.players[userId].submission.acro;

        return false;
    }
});

Template.submitAcro.events({
    'click #changeAcro': function(evt, template) {
        evt.preventDefault();
        Session.set('hasChosenAcro', false);
        analytics.track("changeAcro");
    }
});

Template.submitAcro.onCreated(function() {
    var self = this;

    // see if this player already has a submission
    var game = self.data;
    var round = getCurrentRound(game);
    var userId = Meteor.userId();
    console.log(round.players[userId]);
    if (round.players[userId] && round.players[userId].submission) {
        Session.set('hasChosenAcro', true);
        Session.set('chosenAcro', round.players[userId].submission.acro);
    } else {
        Session.set('hasChosenAcro', false);
        Session.set('chosenAcro', false);
    }
});

Template.submitAcroForm.helpers({
    chosenAcro: function() {
        var chosenAcro = Session.get('chosenAcro');
        return (chosenAcro) ? chosenAcro : '';
    }
});

Template.submitAcroForm.events({
    'submit form': function(evt, template) {
        evt.preventDefault();
        var form = $(evt.currentTarget);
        var button = form.find('button');
        var acro = form.form('get values').acro;
        var gameId = template.data.game._id;

        button.addClass('loading');
        Meteor.call('acrofeverSubmitAcro', gameId, acro, function(err) {
            button.removeClass('loading');
            if (err) {
                form.form('add errors', [err.reason]);
            } else {
                Session.set('hasChosenAcro', true);
                Session.set('chosenAcro', acro);
                playSound('select');
                analytics.track("submitAcro", {
                    acroLength: acro.length
                });
            }
        });
    }
});

Template.submitAcroForm.onRendered(function() {
    var form = $(this.firstNode);
    form.form({
        fields: {
            acro: {
                identifier: 'acro',
                rules: [
                    {
                        type: 'empty',
                        prompt: 'You must submit an Acro!'
                    },
                    {
                        type: 'maxLength[100]',
                        prompt: 'Please submit an Acro under 100 characters'
                    }
                ]
            }
        }
    });

    // make mobile textarea submit on enter, rather than new line
    $('form.showOnMobile').keypress(function(evt) {
        if (evt.which == '13') {
            $('form.showOnMobile').form('submit');
            return false;
        }
    });
}); */

Template.acroVoting.helpers({
    roundAcros: function() {
        var game = this;
        var round = getCurrentRound(game);
        var acros = [];

        _.each(round.players, function(player, playerId) {
            if (playerId !== Meteor.userId() && player.submission) {
                acros.push({
                    id: playerId,
                    acro: player.submission.acro
                });
            }
        });

        return acros;
    },
    votedForThisAcro: function(game, id) {
        var round = getCurrentRound(game);
        var thisPlayer = round.players[Meteor.userId()];
        return (thisPlayer.vote === id);
    }
});

Template.acroVoting.events({
    'click a': function(evt, template) {
        evt.preventDefault();
        var id = $(evt.currentTarget).data().id;
        Meteor.call('acrofeverVoteForAcro', template.data._id, id);
        playSound('select');
        analytics.track("voteForAcro");
    }
});

Template.acroEndRound.helpers({
    roundResults: function() {
        var game = this;
        var round = getCurrentRound(game);
        var array = [];
        _.each(round.players, function(player, playerId) {
            var obj = player;
            obj.id = playerId;
            array.push(obj);
        });
        return array.sort(function(a, b) {
            return totalPoints(b) - totalPoints(a);
        });
    }
});

Template.acroEndRound.onRendered(function() {
    //All this just to implement that cool little fade on the scrollTable

    var scrollTableOuter = this.$('.scrollTable-outer');
    scrollTable = scrollTableOuter.find('.scrollTable');

    scrollTable.scroll(function() {
        var scrollLeft = scrollTable.scrollLeft();
        var tableWidth = scrollTable.find('table').width();
        var divWidth = scrollTable.width();
        scrollTableOuter.find('.scrollTable-fade').css({
            'opacity': (1 - (scrollLeft / (tableWidth - divWidth)))
        });
    });

    this.autorun(function() {
        // this should run after the child templates have been rerendered
        Tracker.afterFlush(function() {
            if (scrollTable.prop('scrollWidth') <= scrollTable.width()) {
                scrollTableOuter.find('.scrollTable-fade').css({
                    'opacity': 0
                });
            }
        });
    });
});

Template.acroRoundResultsRow.helpers({
    totalPoints: function() {
        var results = this;
        var points = totalPoints(results);
        if (points > 0)
            points = '+' + points;
        return points;
    },
    accolades: function(round) {
        var results = this;
        var accolades = [];

        // round winner
        if (results.id === round.winner)
            accolades.push("Round winner");

        // Fastest submitter
        if (results.submission) {
            var thisTimeLeft = results.submission.timeLeft,
                isFastest = true;

            for (playerId in round.players) {
                if (playerId !== results.id && round.players[playerId].submission && round.players[playerId].submission.timeLeft > thisTimeLeft) {
                    isFastest = false;
                    break;
                }
            }
            if (isFastest)
                accolades.push("Fastest submitter");
        }

        if (accolades.length > 0)
            return accolades.join('<br>');
        else
            return false;
    }
});

Template.acroRoundResultsRow.onRendered(function() {
    var label = this.$('.label');
    var results = this.data;
    //var lobbyConfig = Lobbies.findOne(FlowRouter.getParam('lobbyId')).config;
    var html = '<div class="header">';

    var points = totalPoints(results);

    if (points > 0)
        html += '+';

    html += points + ' points</div><div class="content">';

    if (results.votePoints > 0)
        html += '<span class="green">+' + results.votePoints + ' for votes received</span><br>';

    if (results.votedForWinnerPoints > 0)
        html += '<span class="green">+' + results.votedForWinnerPoints + ' for voting for the winning Acro</span><br>';

    if (results.notVotedNegativePoints > 0)
        html += '<span class="red">-' + results.notVotedNegativePoints + ' for not voting</span><br>';

    if (results.winnerPoints > 0)
        html += '<span class="green">+' + results.winnerPoints + ' for winning the round</span><br>';

    html += '</div>';

    label.popup({
        html: html
    });
});

Template.acroRoundResultsRow.onDestroyed(function() {
    //destroy those pesky popups
    this.$('.label').popup('hide');
});

function totalPoints(results) {
    return results.votePoints + results.votedForWinnerPoints - results.notVotedNegativePoints + results.winnerPoints;
}

Template["acrofever-endgame"].helpers({
    winnerHeader: function() {
        var game = this,
            diff = moment(game.endTime).diff(mo.now.get()),
            timeLeft;

        if (diff >= 0)
            timeLeft = moment(diff).format('m:ss');
        else
            timeLeft = '0:00';

        return {
            endTime: game.endTime,
            header: displayname(game.gameWinner, true) + ' won!',
            subheader: 'Next game starts in ' + timeLeft
        }
    },
    gameResults: function() {
        var game = this;
        var array = [];
        _.each(game.scores, function(score, playerId) {
            var obj = {
                id: playerId,
                score: score,
                totalVotes: 0
            };

            if (playerId === game.gameWinner)
                obj.winner = true;

            var avgTimeLeft = 0;
            var submissions = 0;
            var highestVotes = 1;
            var bestAcros = [];
            _.each(game.rounds, function(round) {
                if (round.players[playerId]) {
                    var player = round.players[playerId];
                    obj.totalVotes += player.votes;
                    if (player.votes > highestVotes) {
                        bestAcros = [{
                            id: playerId,
                            acro: player.submission.acro,
                            category: round.category,
                            acronym: round.acronym,
                            votes: player.votes
                        }];
                        highestVotes = player.votes;
                    } else if (player.votes === highestVotes) {
                        bestAcros.push({
                            id: playerId,
                            acro: player.submission.acro,
                            category: round.category,
                            acronym: round.acronym,
                            votes: player.votes
                        });
                    }

                    if (player.submission) {
                        avgTimeLeft += player.submission.timeLeft;
                        submissions++;
                    }
                }
            });

            obj.bestAcros = bestAcros;

            if (submissions !== 0)
                obj.avgTimeLeft = avgTimeLeft / submissions;

            if (obj.bestAcros.length > 1)
                obj.bestAcros = [_.sample(bestAcros)];

            array.push(obj);
        });

        var fastestSubmitter,
            fastestTime = 0;

        _.each(array, function(player) {
            if (player.avgTimeLeft > fastestTime) {
                fastestSubmitter = player.id;
                fastestTime = player.avgTimeLeft;
            }
        });

        for (var i = array.length - 1; i >= 0; i--) {
            if (array[i].id === fastestSubmitter) {
                array[i].fastestSubmitter = true;
                break;
            }
        };

        array = array.sort(function(a, b) {
            return b.score - a.score;
        });

        return array;
    }
});

Template["acrofever-endgame"].onRendered(function() {
    //All this just to implement that cool little fade on the scrollTable

    var scrollTableOuter = this.$('.scrollTable-outer');
    scrollTable = scrollTableOuter.find('.scrollTable');

    scrollTable.scroll(function() {
        var scrollLeft = scrollTable.scrollLeft();
        var tableWidth = scrollTable.find('table').width();
        var divWidth = scrollTable.width();
        scrollTableOuter.find('.scrollTable-fade').css({
            'opacity': (1 - (scrollLeft / (tableWidth - divWidth)))
        });
    });

    this.autorun(function() {
        // this should run after the child templates have been rerendered
        Tracker.afterFlush(function() {
            if (scrollTable.prop('scrollWidth') <= scrollTable.width()) {
                scrollTableOuter.find('.scrollTable-fade').css({
                    'opacity': 0
                });
            }
        });
    });
});

Template.acroGameResultsRow.helpers({
    accolades: function() {
        var accolades = [];

        if (this.winner)
            accolades.push("Game winner");

        if (this.fastestSubmitter)
            accolades.push("Fastest average time");

        return accolades.join('<br>');
    }
});

Template.bestAcroCard.helpers({
    hasVotedForHallOfFame: function() {
        return Template.instance().hasVotedForHallOfFame.get();
    },
    isOwnAcro: function() {
        return (this.id === Meteor.userId());
    }
});

Template.bestAcroCard.events({
    'click .voteForHallOfFame': function(evt, template) {
        evt.preventDefault();

        if (template.hasVotedForHallOfFame.get())
            return;

        template.hasVotedForHallOfFame.set(true);

        var gameId = Lobbies.findOne(FlowRouter.getParam('lobbyId')).currentGame;
        Meteor.call('voteForHallOfFame', gameId, template.data);
        analytics.track("voteForHallOfFame");
    }
});

Template.bestAcroCard.onCreated(function() {
    var self = this;
    self.hasVotedForHallOfFame = new ReactiveVar();
});

Template.bestAcroCard.onRendered(function() {
    this.$('.hasPopup').popup();
});

Template.bestAcroCard.onDestroyed(function() {
    this.$('.hasPopup').popup('hide');
})