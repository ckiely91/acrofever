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
                                    notify(displayname(currentRound.winner, true) + ' won the round.', 'Acrofever');
                                }
                                break;
                            case 'endgame':
                                game = Games.findOne(this.props.game._id);
                                if (game.gameWinner === Meteor.userId()) {
                                    playSound('gamewin');
                                    notify('You won the game!', 'Acrofever');
                                } else {
                                    playSound('gameend');
                                    notify(displayname(game.gameWinner, true) + ' won the game.', 'Acrofever');
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
    endTime: React.PropTypes.instanceOf(Date)
};


const LobbyPlayerCard = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        return {
            profilePicture: profilePicture(this.props.id, 400),
            displayName: displayname(this.props.id)
        }
    },
    openProfilePopup(evt) {
        evt.preventDefault();
        Session.set('selectedProfileUserId', this.props.id);
        $('#profileModal').modal('show');
    },
    render() {
        return (
            <a href="#" className="userProfilePicture card" onClick={this.openProfilePopup}>
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
        lobbyEndTime: React.PropTypes.instanceOf(Date)
    },
    render() {
        if (this.props.game.active) {
            return <GameWindowInner game={this.props.game} endTime={this.props.endTime}/>;
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
            displayName: displayname(this.props.score.id)
        }
    },
    propTypes: {
        score: React.PropTypes.shape({
            id: React.PropTypes.string.isRequired,
            score: React.PropTypes.number.isRequired,
            active: React.PropTypes.bool.isRequired
        })
    },
    openProfilePopup(evt) {
        evt.preventDefault();
        Session.set('selectedProfileUserId', this.props.score.id);
        $('#profileModal').modal('show');
    },
    render() {
        return (
            <tr className={this.props.score.active ? null : 'disabled'}>
                <td>
                    <a href="#" className="userProfilePicture" onClick={this.openProfilePopup}>
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
        border: '0'
    };

    return (
        <form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank">
            <input type="hidden" name="cmd" value="_s-xclick" />
            <input type="hidden" name="hosted_button_id" value="8QLLAQ44QPZ3C" />
            <input type="image" src="/images/donate-mediumrect.jpg" style={style} name="submit" alt="PayPal — The safer, easier way to pay online." />
        </form>
    )
};

const LobbyView = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        lobbySubs.subscribe('lobbies');

        const lobbyId = FlowRouter.getParam('lobbyId');

        let data = {
            lobby: Lobbies.findOne(lobbyId)
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
        this.notifications = Lobbies.find({_id: FlowRouter.getParam('lobbyId')}).observeChanges({
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

    /* HELPERS */
    isInLobby() {
        return (this.data.lobby.players && this.data.lobby.players.indexOf(Meteor.userId()) > -1);
    },

    /* EVENTS */
    joinOrLeaveLobby(evt) {
        const btn = $(evt.currentTarget),
            isInLobby = this.isInLobby();

        btn.addClass('loading');
        Meteor.call('joinOrLeaveOfficialLobby', this.data.lobby._id, !isInLobby, (err) => {
            btn.removeClass('loading');
            if (err) console.error(err);

            if (isInLobby) {
                analytics.track("leaveLobby", {
                    lobbyId: this.data.lobby._id
                });
            } else {
                analytics.track("joinLobby", {
                    lobbyId: this.data.lobby._id
                });
            }
        });
    },

    render() {
        if (this.data.lobby && this.data.game) {
            return (
                <div className="ui stackable grid">
                    <div className="five wide column">
                        <h2 className="ui header"><span className="gameTypeHeader">{this.data.lobby.type} :: </span> {this.data.lobby.displayName}</h2>
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
                                <table className="ui very basic unstackable table">
                                    <tbody>
                                    <tr>
                                        <td>Acro phase time</td>
                                        <td>{moment(this.data.lobby.config.acronymTimeout).format('m:ss')}</td>
                                    </tr>
                                    <tr>
                                        <td>Voting phase time</td>
                                        <td>{moment(this.data.lobby.config.votingTimeout).format('m:ss')}</td>
                                    </tr>
                                    <tr>
                                        <td>Points for round winner</td>
                                        <td>{this.data.lobby.config.winnerPoints}</td>
                                    </tr>
                                    <tr>
                                        <td>Points for each vote received</td>
                                        <td>{this.data.lobby.config.votedPoints}</td>
                                    </tr>
                                    <tr>
                                        <td>Points for voting for winning Acro</td>
                                        <td>{this.data.lobby.config.votedForWinnerPoints}</td>
                                    </tr>
                                    <tr>
                                        <td>Points lost for submitting an Acro but not voting</td>
                                        <td>-{this.data.lobby.config.notVotedNegativePoints}</td>
                                    </tr>
                                    <tr>
                                        <td>Points needed to win</td>
                                        <td>{this.data.lobby.config.endGamePoints}</td>
                                    </tr>
                                    </tbody>
                                </table>
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
                            />
                        </div>
                        <div className="ui hidden divider"></div>
                        <div className="semiTransparentWhiteBG">
                            <LobbyFeedComponent lobbyId={this.data.lobby._id} />
                        </div>
                    </div>
                </div>
            )
        } else {
            return <div className="ui active loader"></div>;
        }
    }
});

Template.registerHelper('LobbyView', () => LobbyView);