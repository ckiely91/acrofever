import React from 'react';

import {CountdownHeader} from '../Countdown';

import {playSound} from '../../helpers';

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
        analytics.track('voteForAcro');
    },

    /* HELPERS */
    isInRound() {
        return (this.props.round.players[Meteor.userId()]);
    },
    votedForThisAcro(id) {
        return (this.props.round.players[Meteor.userId()].vote === id);
    },
    renderItem(acro, index, disabled) {
        const votedForThis = this.votedForThisAcro(acro.id);
        let className = 'item';

        if (votedForThis)
            className = 'active item';

        return (
            <a key={index} href="#" className={className} onClick={(evt) => this.handleVote(evt, acro.id)}>
                {acro.acro} {votedForThis ? <i className="check icon"></i> : null}
            </a>
        )
    },
    renderDisabledItem(acro, index) {
        return <div key={index} className="item">{acro.acro}</div>
    },

    render() {
        let acroList;

        if (this.isInRound()) {
            acroList = (
                <div className="ui fluid relaxed vertical text menu">
                    {this.state.roundAcros.map((acro, index) => this.renderItem(acro, index))}
                </div>
            );
        } else {
            acroList = (
                <div className="ui relaxed list">
                    {this.state.roundAcros.map((acro, index) => this.renderDisabledItem(acro, index))}
                </div>
            );
        }


        return (
            <div className="ten wide center aligned column">
                <h3 className={this.isInRound() ? 'ui header': 'ui disabled header'}>
                    {this.isInRound() ? 'Vote for your favourite Acro' : 'Players are voting for their favourite Acros...'}
                </h3>
                {acroList}
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
                <div className="ui ten column centered grid">
                    <AcroVoting round={this.props.round} gameId={this.props.gameId} />
                </div>
                <div className="ui hidden divider"></div>
            </div>
        );
    }
});