import React from 'react';

import {LobbyFeedComponent} from '../components/Feeds';
import {CountdownSpan} from '../components/Countdown';

import {AcrofeverCategoryPhase} from'../components/acrofever/CategoryPhase';
import {AcrofeverAcroPhase} from'../components/acrofever/AcroPhase';
import {AcrofeverVotingPhase} from'../components/acrofever/VotingPhase';
import {AcrofeverEndRoundPhase} from'../components/acrofever/EndRoundPhase';
import {AcrofeverEndGamePhase} from'../components/acrofever/EndGamePhase';

import {notify, playSound, profilePicture, displayName, acrofeverAnalytics} from '../helpers';
import {Games, Lobbies} from '../collections';
import {lobbySubs} from '../subsManagers';

class GameWindowInner extends React.Component {
    componentDidMount() {
        setTimeout(this.startComputation.bind(this), 0);
    }

    componentWillUnmount() {
        this.tracker.stop();
    }

    startComputation() {
        this.tracker = Tracker.autorun(() => {
            console.log('computation started for ' + this.props.game._id);
            Games.find({_id: this.props.game._id}).observeChanges({
                changed: (id, fields) => {
                    if (fields.currentRound) {
                        playSound('action');
                        notify('New round started', 'Acrofever');
                    }

                    if (fields.currentPhase) {
                        let game;
                        switch (fields.currentPhase) {
                            case 'endround':
                                game = Games.findOne(this.props.game._id);
                                let currentRound = game.rounds[game.currentRound - 1];

                                if (currentRound.winner === Meteor.userId()) {
                                    playSound('roundwin');
                                    notify('You won the round!', 'Acrofever');
                                } else {
                                    playSound('roundend');
                                    notify(displayName(currentRound.winner, true) + ' won the round.', 'Acrofever');
                                }
                                break;
                            case 'endgame':
                                game = Games.findOne(this.props.game._id);
                                if (game.gameWinner === Meteor.userId()) {
                                    playSound('gamewin');
                                    notify('You won the game!', 'Acrofever');
                                } else {
                                    playSound('gameend');
                                    notify(displayName(game.gameWinner, true) + ' won the game.', 'Acrofever');
                                }
                                break;
                        }
                    }
                }
            });
        });
    }

    render() {
        switch (this.props.game.type) {
            case 'acrofever':
                switch (this.props.game.currentPhase) {
                    case 'category':
                        return (
                            <AcrofeverCategoryPhase
                                round={this.props.game.rounds[this.props.game.currentRound -1]}
                                endTime={this.props.endTime}
                                gameId={this.props.game._id}
                                config={this.props.config}
                            />
                        );

                    case 'acro':
                        return (
                            <AcrofeverAcroPhase
                                round={this.props.game.rounds[this.props.game.currentRound -1]}
                                endTime={this.props.endTime}
                                gameId={this.props.game._id}
                            />
                        );

                    case 'voting':
                        return (
                            <AcrofeverVotingPhase
                                round={this.props.game.rounds[this.props.game.currentRound -1]}
                                endTime={this.props.endTime}
                                gameId={this.props.game._id}
                            />
                        );

                    case 'endround':
                        return (
                            <AcrofeverEndRoundPhase
                                round={this.props.game.rounds[this.props.game.currentRound -1]}
                                endTime={this.props.endTime}
                            />
                        );

                    case 'endgame':
                        return (
                            <AcrofeverEndGamePhase
                                scores={this.props.game.scores}
                                rounds={this.props.game.rounds}
                                currentRound={this.props.game.currentRound}
                                winner={this.props.game.gameWinner}
                                endTime={this.props.endTime}
                            />
                        );

                }
        }
    }
}

GameWindowInner.propTypes = {
    game: React.PropTypes.object.isRequired,
    endTime: React.PropTypes.instanceOf(Date),
    config: React.PropTypes.object
};


const LobbyPlayerCard = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        return {
            profilePicture: profilePicture(this.props.id, 400),
            displayName: displayName(this.props.id)
        }
    },
    render() {
        return (
            <a href={FlowRouter.path('profile', {userId: this.props.id})} target="_blank" className="userProfilePicture card">
                <div className="image">
                    <img src={this.data.profilePicture} />
                </div>
                <div className="content">
                    {this.data.displayName}
                </div>
            </a>
        );
    }
});

const LobbyPlayerCards = (props) => {
    return (
        <div className="ui four doubling cards">
            {props.players.map((id, index) => <LobbyPlayerCard key={index} id={id} />)}
        </div>
    );
};

const GameWindow = React.createClass({
    propTypes: {
        game: React.PropTypes.object,
        newGameStarting: React.PropTypes.bool,
        players: React.PropTypes.array,
        endTime: React.PropTypes.instanceOf(Date),
        lobbyEndTime: React.PropTypes.instanceOf(Date),
        config: React.PropTypes.object
    },
    componentDidMount() {
        if (!this.props.game.active && Meteor.isCordova && AdMob) {
            AdMob.showInterstitial();
        }
    },
    render() {
        if (this.props.game.active) {
            return <GameWindowInner game={this.props.game} endTime={this.props.endTime} config={this.props.config}/>;
        } else {
            let headerText;
            if (this.props.newGameStarting) {
                headerText = <div>New game starting in <CountdownSpan endTime={this.props.lobbyEndTime} /></div>;
            } else {
                headerText = <div>Waiting for more players...</div>
            }

            return (
                <div>
                    <h3 className="ui center aligned icon header">
                        <i className="wait icon"></i>
                        {headerText}
                    </h3>
                    <div className="ui divider"></div>
                    {(this.props.players && this.props.players.length > 0) ? <LobbyPlayerCards players={this.props.players} /> : <h3 className="ui center aligned disabled header">No players in lobby</h3>}
                </div>
            )
        }
    }
});

const ScoresTableRow = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        return {
            profilePicture: profilePicture(this.props.score.id, 35),
            displayName: displayName(this.props.score.id)
        }
    },
    propTypes: {
        score: React.PropTypes.shape({
            id: React.PropTypes.string.isRequired,
            score: React.PropTypes.number.isRequired,
            active: React.PropTypes.bool.isRequired
        })
    },
    render() {
        return (
            <tr className={this.props.score.active ? null : 'disabled'}>
                <td>
                    <a href={FlowRouter.path('profile', {userId: this.props.score.id})} target="_blank" className="userProfilePicture">
                        <h4 className="ui image header">
                            <img src={this.data.profilePicture} className="ui mini circular image" />
                            <div className="content">
                                {this.data.displayName}
                            </div>
                        </h4>
                    </a>
                </td>
                <td>{this.props.score.score}</td>
            </tr>
        );
    }
});

class ScoresTable extends React.Component {
    sortedScores() {
        let scores = [];

        for (let userId in this.props.scores) {
            if (this.props.scores.hasOwnProperty(userId)) {
                let active = (this.props.players && this.props.players.indexOf(userId) > -1);
                scores.push({
                    id: userId,
                    score: this.props.scores[userId],
                    active: active
                });
            }
        }

        scores = scores.sort((a, b) => {
            return b.score - a.score;
        });

        return (scores.length > 0) ? scores : false;
    }

    render() {
        return (
            <table className="ui unstackable table">
                <tbody>
                {this.sortedScores() ? this.sortedScores().map((score, index) => <ScoresTableRow key={index} score={score} />) : <div className="ui active inline loader"></div>}
                </tbody>
            </table>
        )
    }
}

ScoresTable.propTypes = {
    scores: React.PropTypes.object,
    players: React.PropTypes.array
};

const Beggar = () => {
    const style = {
        maxWidth: '300px',
        width: '100%',
        border: 'none'
    };

    return (
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="hosted_button_id" value="8QLLAQ44QPZ3C" />
            <input type="image" src="/images/donate-mediumrect.jpg" style={style} name="submit" alt="PayPal — The safer, easier way to pay online." />
        </form>
    )
};

const LobbySettings = (props) => {
    return (
        <div className="ui relaxed divided list">
            <div className="item">
                <div className="content">
                    <div className="header">Acro phase time</div>
                    <div className="description">
                        {(() => {
                            if (props.timeouts) {
                                return `${moment(props.timeouts.acroBase).format('m:ss')} + (${moment(props.timeouts.acroMultiplier).format('m:ss')} × letters)`;
                            } else {
                                return moment(props.acronymTimeout).format('m:ss');
                            }
                        })()}
                    </div>
                </div>
            </div>
            <div className="item">
                <div className="content">
                    <div className="header">Voting phase time</div>
                    <div className="description">
                        {(() => {
                            if (props.timeouts) {
                                return `${moment(props.timeouts.votingBase).format('m:ss')} + (${moment(props.timeouts.votingMultiplier).format('m:ss')} × entries)`;
                            } else {
                                return moment(props.acronymTimeout).format('m:ss');
                            }
                        })()}
                    </div>
                </div>
            </div>
            <div className="item">
                <div className="content">
                    <div className="header">Points for round winner</div>
                    <div className="description">{props.winnerPoints}</div>
                </div>
            </div>
            <div className="item">
                <div className="content">
                    <div className="header">Points for each vote received</div>
                    <div className="description">{props.votedPoints}</div>
                </div>
            </div>
            <div className="item">
                <div className="content">
                    <div className="header">Points for voting for winning Acro</div>
                    <div className="description">{props.votedForWinnerPoints}</div>
                </div>
            </div>
            <div className="item">
                <div className="content">
                    <div className="header">Penalty for submitting without voting</div>
                    <div className="description">-{props.notVotedNegativePoints}</div>
                </div>
            </div>
            <div className="item">
                <div className="content">
                    <div className="header">Points needed to win game</div>
                    <div className="description">{props.endGamePoints}</div>
                </div>
            </div>
        </div>
    );
};

export const LobbyView = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        lobbyId: React.PropTypes.string.isRequired
    },
    getMeteorData() {
        lobbySubs.subscribe('lobbies');

        let data = {
            lobby: Lobbies.findOne(this.props.lobbyId)
        };

        if (data.lobby) {
            Meteor.subscribe('currentGame', data.lobby.currentGame);
            data.game = Games.findOne(data.lobby.currentGame);

            if (data.game) {
                let playerIds = data.lobby.players || [];
                if (data.game.scores)
                    playerIds = playerIds.concat(_.keys(data.game.scores));
                Meteor.subscribe('otherPlayers', playerIds);
            }
            DocHead.setTitle(data.lobby.displayName + ' Lobby - Acrofever');
        }

        return data;
    },
    componentWillMount() {
        this.notifications = Lobbies.find({_id: this.props.lobbyId}).observeChanges({
            changed: function(id, fields) {
                if (fields.newGameStarting === true) {
                    playSound('relax');
                    notify('New game starting soon', 'Acrofever');
                }

                if (fields.currentGame) {
                    playSound('action');
                    notify('New game started', 'Acrofever');
                }
            }
        });

        //SEO stuff
        var title = 'Lobby - Acrofever';
        var description = 'Acrofever is an Acrophobia clone for the modern web. If you never played Acrophobia, it\'s a fun, zany word game in which players create phrases from a randomly generated acronym, then vote for their favourites.';
        var metadata = {
            'description': description,
            'og:description': description,
            'og:title': title,
            'og:image': 'https://acrofever.com/images/fb-image.png',
            'twitter:card': 'summary'
        };

        DocHead.setTitle(title);
        _.each(metadata, function(content, name) {
            DocHead.addMeta({name: name, content: content})
        });
    },
    componentWillUnmount() {
        this.notifications.stop();
    },

    componentDidMount() {
        if (Meteor.isCordova && AdMob) {
            AdMob.prepareInterstitial({
                adId: 'ca-app-pub-2611027061957213/9957453687',
                autoShow: false
            });
        }
    },

    /* HELPERS */
    isInLobby() {
        return (this.data.lobby.players && this.data.lobby.players.indexOf(Meteor.userId()) > -1);
    },

    /* EVENTS */
    joinOrLeaveLobby(evt) {
        const btn = $(evt.currentTarget),
            isInLobby = this.isInLobby();

        btn.addClass('loading');
        Meteor.call('joinOrLeaveOfficialLobby', this.props.lobbyId, !isInLobby, (err) => {
            btn.removeClass('loading');
            if (err) console.error(err);

            if (isInLobby) {
                acrofeverAnalytics.track("leaveLobby", {
                    lobbyId: this.props.lobbyId
                });
            } else {
                acrofeverAnalytics.track("joinLobby", {
                    lobbyId: this.props.lobbyId
                });
            }
        });
    },

    render() {
        if (this.data.lobby && this.data.game) {
            return (
                <div className="ui stackable grid">
                    <div className="five wide column">
                        <h2 className="ui header">{this.data.lobby.displayName}</h2>
                        <div className="ui raised segments">
                            <div className="ui segment">
                                <button className={this.isInLobby() ? 'ui fluid button' : 'ui primary fluid button'} onClick={this.joinOrLeaveLobby}>{this.isInLobby() ? 'Leave' : 'Join'} lobby</button>
                            </div>
                            <div className="ui segment">
                                <h3 className="ui header">Current round: <span className="normalWeight">{this.data.lobby.currentRound}</span></h3>
                            </div>
                            <div className="ui segment">
                                <h3 className="ui header">Scores</h3>
                                <div>
                                    <ScoresTable scores={this.data.game.scores} players={this.data.lobby.players} />
                                </div>
                            </div>
                            <div className="ui segment hiddenOnMobile">
                                <h3 className="ui header">Lobby settings</h3>
                                <LobbySettings {...this.data.lobby.config} />
                            </div>
                        </div>
                        <div className="ui segment hiddenOnMobile">
                            <Beggar />
                        </div>
                    </div>
                    <div className="eleven wide column">
                        <div className="ui raised segment">
                            <GameWindow
                                game={this.data.game}
                                newGameStarting = {this.data.lobby.newGameStarting}
                                players = {this.data.lobby.players}
                                endTime = {this.data.game.endTime}
                                lobbyEndTime = {this.data.lobby.endTime}
                                config = {this.data.lobby.config}
                            />
                        </div>
                        <div className="ui hidden divider"></div>
                        <div className="semiTransparentWhiteBG">
                            <LobbyFeedComponent lobbyId={this.props.lobbyId} />
                        </div>
                    </div>
                </div>
            )
        } else {
            return <div className="ui active loader"></div>;
        }
    }
});