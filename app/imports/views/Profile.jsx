import React from 'react';
import Highchart from 'react-highcharts';

import {HallOfFameAcros} from './HallOfFame';
import {profilePicture, displayName} from '../helpers';

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
                    type: 'spline',
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

export const ProfileView = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        userId: React.PropTypes.string.isRequired
    },
    getInitialState() {
        let numberOfHallOfFame = new ReactiveVar();
        let gamesPlayedStats = null;
        let averageScoreStats = null;
        return {numberOfHallOfFame, gamesPlayedStats, averageScoreStats};
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

        Meteor.call('hallOfFameAcroCount', this.props.userId, (err, res) => {
            if (err) return console.error(err);
            this.state.numberOfHallOfFame.set(res);
        });

        return data;
    },
    componentWillMount() {
        this.refreshStats();
    },
    componentDidMount() {
        var interval = setInterval(() => {
            if (this.comingSoonDiv) {
                $(this.comingSoonDiv).popup({
                    content: 'Coming soon'
                });
                clearInterval(interval);
            }
        }, 100);
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
        if (this.state.gamesPlayedStats === null || this.state.averageScoreStats === null)
            return;

        this.setState({gamesPlayedStats: null, averageScoreStats: null});

        this.refreshStats();
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
            }
        };

        if (this.data.ready) {
            if (this.data.user) {
                body = (
                    <div className="ui grid text container">
                        <div className="eight wide column" style={styles.noBottom}>
                            <h1 className="ui header">
                                {this.data.displayName}
                                <div className="sub header">Member since {moment(this.data.user.createdAt).calendar()}</div>
                            </h1>
                        </div>
                        <div className="eight wide column" style={_.extend(styles.noBottom, styles.top)}>
                            <div id="comingSoonDiv" ref={(ref) => this.comingSoonDiv = ref}>
                                <button className="ui primary icon labeled disabled button">
                                    <i className="lightning icon" />
                                    Invite to play
                                </button>
                                <button className="ui disabled button">Add as friend</button>
                            </div>
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