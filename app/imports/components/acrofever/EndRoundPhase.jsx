import React from 'react';

import {CountdownHeader} from '../Countdown';

import {profilePicture, displayName} from '../../helpers';

const RoundResultsRow = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        result: React.PropTypes.object.isRequired,
        totalPoints: React.PropTypes.func.isRequired,
        accolades: React.PropTypes.func.isRequired
    },
    componentDidMount() {
        $(this.label).popup({
            inline: true
        });
    },
    getMeteorData() {
        return {
            profilePicture: profilePicture(this.props.result.id, 35),
            displayName: displayName(this.props.result.id)
        };
    },
    getPopupHtml() {
        const points = this.props.totalPoints(this.props.result),
            spanStyle = {display: 'block', whiteSpace: 'nowrap'};

        return (
            <div className="ui flowing left popup">
                <div className="header">
                    {((points > 0) ? '+' : '') + points}
                </div>
                <div className="content">
                    {(this.props.result.votePoints > 0) ? <span className="green" style={spanStyle}>{this.props.result.votePoints} for votes received</span> : null}
                    {(this.props.result.votedForWinnerPoints > 0) ? <span className="green" style={spanStyle}>{this.props.result.votedForWinnerPoints} for voting for the winning Acro</span> : null}
                    {(this.props.result.notVotedNegativePoints > 0) ? <span className="red" style={spanStyle}>{this.props.result.notVotedNegativePoints} for not voting</span> : null}
                    {(this.props.result.winnerPoints > 0) ? <span className="green" style={spanStyle}>{this.props.result.winnerPoints} for winning the round</span> : null}
                </div>
            </div>
        );
    },
    render() {
        return (
            <tr>
                <td>
                    <a href={FlowRouter.path('profile', {userId: this.props.result.id})} target="_blank"  className="userProfilePicture">
                        <h4 className="ui image header">
                            <img src={this.data.profilePicture} className="ui mini circular image" />
                            <div className="content">
                                {this.data.displayName}
                                {this.props.accolades(this.props.result) ? <div className="sub header" dangerouslySetInnerHTML={this.props.accolades(this.props.result)}></div> : null}
                            </div>
                        </h4>
                    </a>
                </td>
                <td>{this.props.result.submission ? this.props.result.submission.acro : null}</td>
                <td>{this.props.result.votes}</td>
                <td>
                    <a className="ui grey circular label" ref={(ref) => this.label = ref}>
                        {(this.props.totalPoints(this.props.result) > 0) ? '+' + this.props.totalPoints(this.props.result) : this.props.totalPoints(this.props.result)}
                    </a>
                    {this.getPopupHtml()}
                </td>
            </tr>
        )
    }
});

export const RoundResultsTable = React.createClass({
    propTypes: {
        round: React.PropTypes.object.isRequired
    },

    // All this just to implement that cool little fade on the scrollTable
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

    /* HELPERS */
    roundAcros() {
        const players = this.props.round.players;
        let roundAcros = [];

        for (var playerId in players) {
            let obj = players[playerId];
            obj.id = playerId;
            roundAcros.push(obj);
        }

        roundAcros = roundAcros.sort((a, b) => {
            return this.totalPoints(b) - this.totalPoints(a);
        });

        return roundAcros;
    },
    totalPoints(results) {
        return results.votePoints + results.votedForWinnerPoints - results.notVotedNegativePoints + results.winnerPoints;
    },

    accolades(result) {
        let accolades = [];

        // round winner
        if (result.id === this.props.round.winner)
            accolades.push('Round winner');

        // fastest submitter
        if (result.submission) {
            const thisTimeLeft = result.submission.timeLeft;
            const players = this.props.round.players;
            let isFastest = true;

            for (let playerId in players) {
                if (playerId !== result.id && players[playerId].submission && players[playerId].submission.timeLeft > thisTimeLeft) {
                    isFastest = false;
                    break;
                }
            }
            if (isFastest)
                accolades.push('Fastest submitter');
        }

        if (accolades.length > 0) {
            return {
                __html: accolades.join('<br>')
            };
        } else {
            return false;
        }
    },

    render() {
        const tableStyle = {minWidth: '500px'};
        return (
            <div className="scrollTable-outer" ref={(ref) => this.scrollTableOuter = ref}>
                <div className="scrollTable-fade"></div>
                <div className="scrollTable">
                    <table className="ui very basic celled unstackable table" style={tableStyle}>
                        <thead>
                        <tr>
                            <th>Player</th>
                            <th>Acro</th>
                            <th>Votes</th>
                            <th>Points</th>
                        </tr>
                        </thead>
                        <tbody>
                            {this.roundAcros().map((result, index) => <RoundResultsRow key={index} result={result} totalPoints={this.totalPoints} accolades={this.accolades}/>)}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
});

export const AcrofeverEndRoundPhase = React.createClass({
    propTypes: {
        round: React.PropTypes.object.isRequired,
        endTime: React.PropTypes.instanceOf(Date).isRequired
    },
    componentDidMount() {
        if (Meteor.isCordova && AdMob) {
            Meteor.setTimeout(() => {
                AdMob.showInterstitial();
            }, 10000);
        }
    },

    currentAcro() {
        var acro = this.props.round.acronym;
        return acro.join('. ');
    },
    render() {
        const dividerStyle = {marginBottom: '2em'};
        return (
            <div>
                <div>
                    <CountdownHeader endTime={this.props.endTime} header={this.currentAcro()} subheader={this.props.round.category} />
                </div>
                <div className="ui divider" style={dividerStyle}></div>

                <h3 className="ui header">
                    <i className="trophy icon"></i>
                    <div className="content">
                        Round results
                    </div>
                </h3>

                <div className="ui basic segment">
                    <RoundResultsTable round={this.props.round} />
                </div>

                <div className="ui hidden divider"></div>
            </div>
        );
    }
});