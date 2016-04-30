import React from 'react';
import Highchart from 'react-highcharts';

import {HallOfFameAcros} from './HallOfFame';
import {profilePicture, displayName} from '../helpers';
import {lobbySubs} from '../subsManagers';
import {Lobbies} from '../collections';

class UserStats extends React.Component {
    constructor(props) {
        super(props);
    }

    gamesPlayed() {
        return this.props.stats.played;
    }

    gamesWon() {
        return this.props.stats.won;
    }

    winRate() {
        return this.props.stats.winRate;
    }

    renderStatistic(stat, index) {
        return (
            <div key={index} className="statistic">
                <div className="value">{stat.value}</div>
                <div className="label">{stat.label}</div>
            </div>
        )
    }

    render() {
        var stats = [
            {
                label: 'Games played',
                value: this.gamesPlayed()
            },
            {
                label: 'Games won',
                value: this.gamesWon()
            },
            {
                label: 'Win rate',
                value: this.winRate() + '%'
            },
            {
                label: 'HOF Entries',
                value: this.props.halloffame ? this.props.halloffame : "0"
            }
        ].map((stat, index) => this.renderStatistic(stat, index));

        return (
            <div className="ui two statistics">
                {stats}
            </div>
        );
    }
}

class UserStatChartGamesPlayed extends React.Component {
    constructor(props) {
        super(props);
    }

    formatChartData(inputData) {
        const config = {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Games played'
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Date'
                }
            },
            yAxis: [{
                title: {
                    text: 'Games'
                },
                min: 0
            }, {
                title: {
                    text: 'Win rate'
                },
                labels: {
                    format: '{value}%'
                },
                opposite: true,
                min: 0,
                max: 100
            }],
            tooltip: {
                shared: true
            },
            series: [
                {
                    name: 'Games played',
                    type: 'spline',
                    tooltip: {
                        valueSuffix: ' games'
                    },
                    data: []
                },
                {
                    name: 'Games won',
                    type: 'spline',
                    tooltip: {
                        valueSuffix: ' games'
                    },
                    data: []
                },
                {
                    name: 'Win rate',
                    type: 'spline',
                    tooltip: {
                        valueSuffix: '%'
                    },
                    data: [],
                    yAxis: 1
                }
            ]
        };

        _.each(inputData, function(value, date) {
            config.series[0].data.push([parseInt(date),value.played]);
            config.series[1].data.push([parseInt(date),value.won]);
            config.series[2].data.push([parseInt(date),value.winRate]);
        });

        return config;
    }

    render() {
        return <Highchart config={this.formatChartData(this.props.stats)} />;
    }
}

class UserStatChartAverageScore extends React.Component {
    constructor(props) {
        super(props);
    }

    formatChartData(inputData) {
        const config = {
            chart: {
                zoomType: 'x'
            },
            title: {
                text: 'Scores'
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Date'
                }
            },
            yAxis: {
                title: {
                    text: 'Score'
                },
                min: 0
            },
            tooltip: {
                shared: true
            },
            series: [
                {
                    name: 'Score',
                    type: 'area',
                    step: true,
                    data: inputData.scoresArr
                },
                {
                    name: 'Rolling average',
                    type: 'spline',
                    data: inputData.averageArr
                }
            ]
        };

        return config;
    }

    render() {
        return <Highchart config={this.formatChartData(this.props.stats)} />;
    }
}

class EditProfileModal extends React.Component {
    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
        this.changePassword = this.changePassword.bind(this);
    }

    componentDidMount() {
        const $modal = $(this.modal),
            $form = $(this.form),
            $submitBtn = $(this.submitBtn);

        $modal.modal({
            detachable: false,
            observeChanges: true,
            onApprove: () => {
                $form.form('submit');
                return false;
            }
        });

        $form.form({
            fields: {
                username: ['maxLength[20]', 'empty']
            },
            onSuccess: (evt, fields) => {
                evt.preventDefault();
                $submitBtn.addClass('loading');
                Meteor.call('changeUsername', fields.username, (err) => {
                    $submitBtn.removeClass('loading');
                    if (err) {
                        $form.form('add errors', [err.reason]);
                    } else {
                        $form.trigger('reset');
                        $modal.modal('hide');
                    }
                });
            }
        });
    }

    openModal(evt) {
        evt.preventDefault();
        $(this.modal).modal('show');
    }

    changePassword(evt) {
        evt.preventDefault();
        $(this.modal).modal('hide');
        FlowRouter.go('/change-password');
    }

    render() {
        return (
            <div className="ui modal" ref={(ref) => this.modal = ref}>
                <div className="header">
                    Edit profile
                </div>
                <div className="image content">
                    <div className="ui medium image">
                        <img src={this.props.profilePicture} />
                    </div>
                    <div className="description">
                        <div className="ui header">Edit username</div>
                        <div className="ui message">You'll need to log in with this username in future if you're not a Facebook, Twitter or Google user.</div>
                        <div className="ui form" ref={(ref) => this.form = ref}>
                            <div className="field">
                                <input type="text" name="username" placeholder="New username" defaultValue={this.props.displayName}/>
                            </div>
                            <div className="ui error message"></div>
                        </div>
                    </div>
                </div>
                <div className="actions">
                    <div className="ui left floated button" onClick={(evt) => this.changePassword(evt)}>Change password</div>
                    <div className="ui deny button">Cancel</div>
                    <div className="ui positive icon labeled button" ref={(ref) => this.submitBtn = ref}>
                        <i className="check icon" />
                        Save changes
                    </div>
                </div>
            </div>
        )
    }
}

const InviteModal = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        displayName: React.PropTypes.string.isRequired,
        userId: React.PropTypes.string.isRequired
    },
    getInitialState() {
        return {
            hasInvited: false
        };
    },
    getMeteorData() {
        lobbySubs.subscribe('lobbies');
        const lobbies = Lobbies.find().fetch(),
            ready = lobbySubs.ready();

        return {lobbies, ready};
    },
    componentDidMount() {
        $(this.modal).modal({
            detachable: false,
            observeChanges: true
        });
    },
    openModal(evt) {
        evt.preventDefault();
        if (Meteor.userId()) {
            $(this.modal).modal('show');
        } else {
            FlowRouter.go('/sign-in');
        }
    },
    closeModal() {
        $(this.modal).modal('hide');
    },
    renderLobbyItem(lobby, index) {
        return (
            <div key={index} className="item" onClick={(evt) => this.inviteToPlay(evt, lobby._id)}>
                <div className="content">{lobby.displayName}</div>
            </div>
        );
    },
    inviteToPlay(evt, lobbyId) {
        evt.preventDefault();
        this.setState({hasInvited: true});
        Meteor.call('inviteToPlay', this.props.userId, lobbyId, (err) => {
            if (err)
                alert(err.reason);
            else
                alert("Invite sent");

            this.closeModal();
            Meteor.setTimeout(() => {
                this.setState({hasInvited: false});
            }, 500);
        });
    },
    render() {
        const styles = {
            list: {
                textAlign: 'center'
            }
        };

        return (
            <div className="ui small basic modal" ref={(ref) => this.modal = ref}>
                <div className="ui icon header">
                    <i className="mail outline icon" />
                    Invite {this.props.displayName} to play
                    <div className="sub header">Pick a lobby</div>
                </div>
                <div className="content">
                    <h3 className="ui centered inverted header">Pick a lobby</h3>
                    {(() => {
                        if (this.data.ready && !this.state.hasInvited) {
                            return (
                                <div style={styles.list} className="ui middle aligned inverted selection list">
                                    {this.data.lobbies.map(this.renderLobbyItem)}
                                </div>
                            );
                        } else {
                            return <div className="ui active inline centered inverted loader"></div>;
                        }
                    })()}
                </div>
            </div>
        )
    }
});

export const ProfileView = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        userId: React.PropTypes.string.isRequired
    },
    getInitialState() {
        let numberOfHallOfFame = new ReactiveVar();
        let gamesPlayedStats = null;
        let averageScoreStats = null;
        const isOwnProfile = (this.props.userId === Meteor.userId());
        return {numberOfHallOfFame, gamesPlayedStats, averageScoreStats, isOwnProfile};
    },
    getMeteorData() {
        var data = {
            numberOfHallOfFame: this.state.numberOfHallOfFame.get()
        };

        var handle = Meteor.subscribe('otherPlayers', [this.props.userId]);

        data.ready = handle.ready();
        data.user = Meteor.users.findOne(this.props.userId);
        data.profilePicture = profilePicture(this.props.userId, 250);
        data.displayName = displayName(this.props.userId);
        data.thisUser = Meteor.user();

        Meteor.call('hallOfFameAcroCount', this.props.userId, (err, res) => {
            if (err) return console.error(err);
            this.state.numberOfHallOfFame.set(res);
        });

        return data;
    },
    componentWillMount() {
        this.refreshStats();
    },
    refreshStats() {
        Meteor.call('getUserStat', this.props.userId, 'gamesPlayed', (err, res) => {
            if (err) return console.error(err);
            const result = res ? res : false;
            this.setState({gamesPlayedStats: result});
        });

        Meteor.call('getUserStat', this.props.userId, 'averageScore', (err, res) => {
            if (err) return console.error(err);
            const result = res ? res : false;
            this.setState({averageScoreStats: result});
        });
    },
    clickRefresh(evt) {
        evt.preventDefault();
        if (this.state.gamesPlayedStats === null || this.state.averageScoreStats === null)
            return;

        this.setState({gamesPlayedStats: null, averageScoreStats: null});

        this.refreshStats();
    },
    addFriend(evt) {
        evt.preventDefault();
        const $btn = $(evt.currentTarget);
        $btn.addClass('loading');
        Meteor.call('addFriend', this.props.userId, (err) => {
            $btn.removeClass('loading');
            if (err)
                console.error(err);
        });
    },
    removeFriend(evt) {
        evt.preventDefault();
        const $btn = $(evt.currentTarget);
        $btn.addClass('loading');
        Meteor.call('removeFriend', this.props.userId, (err) => {
            $btn.removeClass('loading');
            if (err)
                console.error(err);
        });
    },
    lastStat() {
        const keys = Object.keys(this.state.gamesPlayedStats);
        if (keys.length > 0) {
            return this.state.gamesPlayedStats[keys[keys.length - 1]];
        } else {
            return {
                played: 0,
                won: 0,
                winRate: 0
            };
        }
    },
    onlineLabel(online) {
        if (online) {
            return <div className="ui small basic green label">Online</div>;
        } else {
            return <div className="ui small basic red label">Offline</div>;
        }
    },
    isFriend() {
        if (this.data.thisUser && this.data.thisUser.profile && this.data.thisUser.profile.friends) {
            return (this.data.thisUser.profile.friends.indexOf(this.props.userId) > -1);
        } else {
            return false;
        }
    },
    render() {
        let body;
        const styles = {
            noTop: {
                paddingTop: 0
            },
            noBottom: {
                paddingBottom: 0
            },
            top: {
                paddingTop: '25px'
            },
            refreshIcon: {
                float: 'right',
                fontSize: '16px',
                cursor: 'pointer'
            },
            inviteBtn: {
                marginBottom: '10px',
                marginRight: '10px'
            }
        };

        if (this.data.ready) {
            if (this.data.user) {
                body = (
                    <div className="ui grid text container">
                        <div className="eight wide column" style={styles.noBottom}>
                            <h1 className="ui header">
                                {this.data.displayName}
                                {(this.data.user.status && this.data.user.status.online) ? this.onlineLabel(true) : this.onlineLabel(false)}
                                <div className="sub header">Member since {moment(this.data.user.createdAt).calendar()}</div>
                            </h1>
                        </div>
                        <div className="eight wide column" style={_.extend(styles.noBottom, styles.top)}>
                            {(() => {
                                if (this.state.isOwnProfile) {
                                    return (
                                        <button className="ui icon labeled right floated button" onClick={(evt) => this.editProfileModal.openModal(evt)}>
                                            <i className="edit icon" />
                                            Edit
                                        </button>
                                    );
                                } else {
                                    return (
                                        <div>
                                            <button style={styles.inviteBtn} className="ui primary icon labeled button" onClick={(evt) => this.inviteModal.openModal(evt)}>
                                                <i className="mail outline icon" />
                                                Invite to play
                                            </button>
                                            {(() => {
                                                if (!this.isFriend()) {
                                                    return <button className="ui button" onClick={(evt) => this.addFriend(evt)}>Add as friend</button>;
                                                } else {
                                                    return (
                                                        <button className="ui positive icon labeled button" onClick={(evt) => this.removeFriend(evt)}>
                                                            <i className="check icon" />
                                                            Friends
                                                        </button>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    )
                                }
                            })()}
                        </div>
                        <div className="sixteen wide column" style={styles.noTop}>
                            <div className="ui divider"></div>
                        </div>
                        <div className="five wide column">
                            <img className="ui circular fluid image" src={this.data.profilePicture}/>
                        </div>
                        <div className="eleven wide column">
                            {(() => {
                                if (this.state.gamesPlayedStats !== null && _.isNumber(this.data.numberOfHallOfFame)) {
                                    return <UserStats halloffame={this.data.numberOfHallOfFame} stats={this.lastStat()} />;
                                } else {
                                    return <div className="ui inline centered active loader"></div>;
                                }
                            })()}
                        </div>
                        <div className="sixteen wide column">
                            <div className="ui hidden divider"></div>
                            <h3 className="ui dividing header">
                                Charts
                                <div className="ui tiny label">BETA</div>
                                <i className="refresh icon" style={styles.refreshIcon} onClick={(evt) => this.clickRefresh(evt)} />
                            </h3>
                            {(() => {
                                if (this.state.gamesPlayedStats) {
                                    return <UserStatChartGamesPlayed stats={this.state.gamesPlayedStats}/>;
                                } else if (this.state.gamesPlayedStats === false) {
                                    return <em>No data</em>;
                                } else {
                                    return <div className="ui inline centered active loader"></div>;
                                }
                            })()}
                            <br />
                            {(() => {
                                if (this.state.averageScoreStats) {
                                    return <UserStatChartAverageScore stats={this.state.averageScoreStats}/>;
                                } else if (this.state.averageScoreStats === false) {
                                    return <em>No data</em>;
                                } else {
                                    return <div className="ui inline centered active loader"></div>;
                                }
                            })()}
                        </div>
                        <div className="sixteen wide column">
                            <div className="ui hidden divider"></div>
                            <h3 className="ui dividing header">{this.data.displayName} in the Hall of Fame</h3>
                            <HallOfFameAcros userId={this.props.userId} limit={4}/>
                        </div>
                        {(() => {
                            if (this.state.isOwnProfile) {
                                return (
                                    <EditProfileModal
                                        userId={this.props.userId}
                                        profilePicture={this.data.profilePicture}
                                        displayName={this.data.displayName}
                                        ref={(ref) => this.editProfileModal = ref}
                                    />
                                );
                            } else {
                                return (
                                    <InviteModal
                                        userId={this.props.userId}
                                        displayName={this.data.displayName}
                                        ref={(ref) => this.inviteModal = ref}
                                    />
                                );
                            }
                        })()}
                    </div>
                );
            } else {
                body = <em>This user does not exist</em>;
            }
        } else {
            body = <div className="ui active loader"></div>;
        }

        return body;
    }
});