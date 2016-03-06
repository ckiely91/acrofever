import React from 'react';

import {CountdownHeader} from '../Countdown';
import {RoundResultsTable} from './EndRoundPhase';

import {profilePicture, displayName} from '../../helpers';

const BestAcroCard = React.createClass({
    propTypes: {
        result: React.PropTypes.object.isRequired
    },
    getInitialState() {
        let hasVotedForHOF = false;
        return {hasVotedForHOF};
    },
    componentDidMount() {
        if (this.voteLabel) {
            $(this.voteLabel).popup({inline: true});
        }
        $(this.description).popup({inline: true});
    },
    isOwnAcro() {
        return (this.props.result.id === Meteor.userId());
    },
    voteForHOF(evt) {
        evt.preventDefault();

        if (this.state.hasVotedForHOF)
            return;

        this.setState({hasVotedForHOF: true});

        const gameId = Lobbies.findOne(FlowRouter.getParam('lobbyId')).currentGame;
        Meteor.call('voteForHallOfFame', gameId, this.props.result);
        analytics.track("voteForHallOfFame");
    },
    render() {
        let headerContent;

        if (this.isOwnAcro()) {
            headerContent = (
                <div className="content">
                    <div className="header">
                        {this.props.result.acronym.join('. ')}
                    </div>
                </div>
            );
        } else {
            headerContent = (
                <div className="content">
                    <a className={'ui right corner ' + (this.state.hasVotedForHOF ? 'green' : 'yellow') + ' label'} href="#" onClick={this.voteForHOF} ref={(ref) => this.voteLabel = ref}>
                        <i className="trophy icon"></i>
                    </a>
                    <div className="ui tiny popup">Vote to add this to the Hall of Fame</div>
                    <div className="header">
                        {this.props.result.acronym.join('. ')}
                    </div>
                </div>
            );
        }

        return (
            <div className="ui fluid card acroCard">
                {headerContent}
                <div className="content">
                    <div className="meta">{this.props.result.category}</div>
                    <div className="description" ref={(ref) => this.description = ref}>{this.props.result.acro}</div>
                    <div className="ui mini popup">{this.props.result.votes} votes</div>
                </div>
            </div>
        )
    }
});

const GameResultsRow = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        result: React.PropTypes.object.isRequired
    },
    getMeteorData() {
        return {
            profilePicture: profilePicture(this.props.result.id, 80),
            displayName: displayName(this.props.result.id)
        };
    },
    openProfilePopup(evt) {
        evt.preventDefault();
        Session.set('selectedProfileUserId', this.props.result.id);
        $('#profileModal').modal('show');
    },
    isThisUser() {
        return (this.props.result.id === Meteor.userId());
    },
    render() {
        const spanStyle = {display: 'block'};
        return (
            <tr>
                <td>
                    <a href="#" className="userProfilePicture" onClick={this.openProfilePopup}>
                        <h4 className="ui image header">
                            <img src={this.data.profilePicture} className="ui circular image" />
                            <div className="content">
                                {this.props.result.winner ? <i className="star icon noRightMargin"></i> : null}
                                {this.isThisUser() ? <i className="user icon noRightMargin"></i> : null}
                                {this.data.displayName}
                                <div className="sub header">
                                    {this.props.result.winner ? <span style={spanStyle}>Game winner</span> : null}
                                    {this.props.result.fastestSubmitter ? <span style={spanStyle}>Fastest average time</span> : null}
                                </div>
                            </div>
                        </h4>
                    </a>
                    <div className="clear"></div>
                    <div className="ui mini grey statistic">
                        <div className="value">{this.props.result.totalVotes}</div>
                        <div className="label">Votes</div>
                    </div>
                    <div className="ui mini grey statistic">
                        <div className="value">{this.props.result.score}</div>
                        <div className="label">Score</div>
                    </div>
                </td>
                <td>
                    <BestAcroCard result={this.props.result.bestAcro} />
                </td>
            </tr>
        );
    }
});

const GameResultsTable = React.createClass({
    propTypes: {
        scores: React.PropTypes.object.isRequired,
        rounds: React.PropTypes.array.isRequired,
        winner: React.PropTypes.string
    },
    componentDidMount() {
        this.$scrollTableOuter = $(this.scrollTableOuter);
        this.$scrollTable = this.$scrollTableOuter.find('.scrollTable');

        this.$scrollTable.scroll(() => {
            var scrollLeft = this.$scrollTable.scrollLeft();
            var tableWidth = this.$scrollTable.find('table').width();
            var divWidth = this.$scrollTable.width();
            this.$scrollTableOuter.find('.scrollTable-fade').css({
                'opacity': (1 - (scrollLeft / (tableWidth - divWidth)))
            });
        });
    },
    componentDidUpdate() {
        if (this.$scrollTable.prop('scrollWidth') <= this.$scrollTable.width()) {
            this.$scrollTableOuter.find('.scrollTable-fade').css({
                'opacity': 0
            });
        }
    },
    gameResults() {
        let results = [];
        const scores = this.props.scores,
            rounds = this.props.rounds;

        for (let playerId in scores) {
            if (scores.hasOwnProperty(playerId)) {
                let obj = {
                    id: playerId,
                    score: scores[playerId],
                    totalVotes: 0
                };

                if (playerId === this.props.winner)
                    obj.winner = true;

                let avgTimeLeft = 0,
                    submissions = 0,
                    highestVotes = 1,
                    bestAcros = [];

                for (let i = 0; i < rounds.length; i++) {
                    const round = rounds[i],
                        player = round.players[playerId];

                    if (player) {
                        obj.totalVotes += player.votes;
                        const thisBestAcro = {
                            id: playerId,
                            acro: player.submission ? player.submission.acro : '',
                            category: round.category,
                            acronym: round.acronym,
                            votes: player.votes
                        };

                        if (player.votes > highestVotes) {
                            bestAcros = [thisBestAcro];
                            highestVotes = player.votes;
                        } else if (player.votes === highestVotes) {
                            bestAcros.push(thisBestAcro);
                        }

                        if (player.submission) {
                            avgTimeLeft += player.submission.timeLeft;
                            submissions++;
                        }
                    }
                }

                if (submissions !== 0)
                    obj.avgTimeLeft = avgTimeLeft / submissions;

                if (bestAcros.length > 1)
                    obj.bestAcro = _.sample(bestAcros);
                else
                    obj.bestAcro = bestAcros[0];

                results.push(obj);
            }
        }

        let fastestSubmitter,
            fastestTime = 0;

        for (let i = 0; i < results.length; i++) {
            if (results[i].avgTimeLeft > fastestTime) {
                fastestSubmitter = results[i].id;
                fastestTime = results[i].avgTimeLeft;
            }
        }

        for (let i = 0; i < results.length; i++) {
            if (results[i].id === fastestSubmitter) {
                results[i].fastestSubmitter = true;
                break;
            }
        }

        results = results.sort((a, b) => {
            return b.score - a.score;
        });

        console.log('Calculated game results');

        return results;
    },
    render() {
        const tableStyle = {minWidth: '500px'};
        return (
            <div className="scrollTable-outer" ref={(ref) => this.scrollTableOuter = ref}>
                <div className="scrollTable-fade"></div>
                <div className="scrollTable">
                    <table className="ui very basic celled unstackable table" id="endGameTable" style={tableStyle}>
                        <thead>
                        <tr>
                            <th>Player</th>
                            <th>Best Acro</th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.gameResults().map((result, index) => <GameResultsRow key={index} result={result} />)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});

export const AcrofeverEndGamePhase = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        scores: React.PropTypes.object.isRequired,
        rounds: React.PropTypes.array.isRequired,
        currentRound: React.PropTypes.number.isRequired,
        winner: React.PropTypes.string,
        endTime: React.PropTypes.instanceOf(Date).isRequired
    },
    getMeteorData() {
        return {
            winnerDisplayName: displayName(this.props.winner)
        }
    },
    render() {
        const dividerStyle = {marginBottom: '2em'};
        return (
            <div>
                <div>
                    <CountdownHeader endTime={this.props.endTime} header={this.data.winnerDisplayName + ' won the game!'} subheader="New game starting soon..." />
                </div>

                <div className="ui divider" style={dividerStyle}></div>

                <h3 className="ui center aligned header">Last round results</h3>

                <div className="ui basic segment">
                    <RoundResultsTable round={this.props.rounds[this.props.currentRound - 1]} />
                </div>

                <div className="ui divider"></div>

                <h3 className="ui center aligned header">Game results</h3>
                <div className="ui basic segment">
                    <GameResultsTable scores={this.props.scores} rounds={this.props.rounds} winner={this.props.winner} />
                </div>
            </div>
        )
    }
});