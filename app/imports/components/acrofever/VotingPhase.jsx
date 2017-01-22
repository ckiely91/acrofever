import React from 'react';

import {CountdownHeader} from '../Countdown';

import {playSound, acrofeverAnalytics} from '../../helpers';

const AcroVoting = React.createClass({
    propTypes: {
        round: React.PropTypes.object.isRequired,
        gameId: React.PropTypes.string.isRequired
    },
    getInitialState() {
        let roundAcros = [];
        const userId = Meteor.userId(),
            round = this.props.round;

        for (var playerId in round.players) {
            if (round.players.hasOwnProperty(playerId) && playerId !== userId && round.players[playerId].submission) {
                roundAcros.push({
                    id: playerId,
                    acro: round.players[playerId].submission.acro
                })
            }
        }

        return {roundAcros};
    },

    /* HANDLERS */
    handleVote(evt, id) {
        evt.preventDefault();
        Meteor.call('acrofeverVoteForAcro', this.props.gameId, id);
        playSound('select');
        acrofeverAnalytics.track('voteForAcro');
    },

    /* HELPERS */
    isInRound() {
        return (this.props.round.players[Meteor.userId()]);
    },
    votedForThisAcro(id) {
        return (this.props.round.players[Meteor.userId()].vote === id);
    },
    renderItem(acro, index) {
        const votedForThis = this.votedForThisAcro(acro.id);
        let className = 'item';

        if (votedForThis)
            className = 'active item';

        return (
            <div key={index} className={className} onClick={(evt) => this.handleVote(evt, acro.id)}>
                {votedForThis ? <i className="check icon" /> : null}
                <div className="content">
                    {acro.acro}
                </div>
            </div>
        )
    },
    renderDisabledItem(acro, index) {
        return <div key={index} className="item">{acro.acro}</div>
    },

    render() {
        let acroList;
        const selectionList = {
            //textAlign: 'center'
        };

        if (this.isInRound()) {
            acroList = (
                <div style={selectionList} className="ui middle aligned relaxed divided selection list">
                    {this.state.roundAcros.map(this.renderItem)}
                </div>
            );
        } else {
            acroList = (
                <div className="ui relaxed divided list">
                    {this.state.roundAcros.map(this.renderDisabledItem)}
                </div>
            );
        }


        return (
            <div className="ui centered grid">
                <div className="sixteen-wide-tablet ten-wide-computer column">
                    <h3 className={this.isInRound() ? 'ui header': 'ui disabled header'}>
                        <i className="thumbs outline up icon"></i>
                        <div className="content">
                            {this.isInRound() ? 'Vote for your favourite Acro' : 'Players are voting for their favourite Acros...'}
                        </div>
                    </h3>
                    {acroList}
                </div>
            </div>
        );
    }
});

export const AcrofeverVotingPhase = React.createClass({
    propTypes: {
        round: React.PropTypes.object.isRequired,
        endTime: React.PropTypes.instanceOf(Date).isRequired,
        gameId: React.PropTypes.string.isRequired
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
                <AcroVoting round={this.props.round} gameId={this.props.gameId} />
                <div className="ui hidden divider"></div>
            </div>
        );
    }
});