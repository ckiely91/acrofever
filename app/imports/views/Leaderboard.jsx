import React from 'react';

import {profilePicture, displayName} from '../helpers';

class LeaderboardTableRow extends React.Component {
    constructor(props) {
        super(props);
    }

    goToProfile() {
        FlowRouter.go(FlowRouter.path('profile', {userId: this.props._id}))
    }

    round(num) {
        return Math.round(num * 100) / 100;
    }

    winRate() {
        if (this.props.profile.stats.gamesWon > 0) {
            return this.round(this.props.profile.stats.gamesWon / this.props.profile.stats.gamesPlayed * 100);
        } else {
            return 0;
        }
    }

    render() {
        return (
            <tr onClick={() => this.goToProfile()}>
                <td>{this.props.num}</td>
                <td>
                    <h4 className="ui image header">
                        <img src={profilePicture(this.props, 35)} className="ui mini rounded image" />
                        <div className="content">
                            {displayName(this.props)}
                            <div className="sub header">Member since {moment(this.props.createdAt).calendar()}</div>
                        </div>
                    </h4>
                </td>
                <td>{this.props.profile.stats.gamesPlayed || 0}</td>
                <td>{this.props.profile.stats.gamesWon || 0}</td>
                <td>{this.winRate()}%</td>
                <td>
                    {this.round(this.props.profile.trueskill.skillEstimate)}
                </td>
            </tr>
        )
    }
}

class LeaderboardTable extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <table className="ui selectable celled table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Games played</th>
                        <th>Games won</th>
                        <th>Win rate</th>
                        <th>Rating</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.players.map((player, index) => <LeaderboardTableRow key={index} num={index + 1} {...player}/>)}
                </tbody>
            </table>
        )
    }
}

export const LeaderboardView = React.createClass({
    mixins: [ReactMeteorData],
    getInitialState() {
        return {
            limit: 50
        };
    },
    getMeteorData() {
        const handle = Meteor.subscribe('playerRankings', this.state.limit);
        const cursor = Meteor.users.find({
            'profile.trueskill': {$exists: true},
            'profile.stats.gamesPlayed': {$gte: Meteor.settings.public.leaderboardMinimumGamesToBeVisible}
        }, {
            sort: {'profile.trueskill.skillEstimate': -1}
        });

        return {
            ready: handle.ready(),
            players: cursor.fetch()
        }
    },
    getMore(evt) {
        evt.preventDefault();
        this.setState({limit: this.state.limit + 25});
    },
    render() {
        return (
            <div>
                <h2 className="ui header">
                    <i className="star icon" />
                    <div className="content">
                        Leaderboard
                        <div className="sub header">Play over {Meteor.settings.public.leaderboardMinimumGamesToBeVisible} games to get a ranking on the leaderboard!</div>
                    </div>
                </h2>
                <div className="ui hidden divider"></div>
                <LeaderboardTable players={this.data.players} />
                <button className={this.data.ready ? "ui primary button" : "ui primary loading button"} onClick={this.getMore}>Show more</button>
            </div>
        );
    }
});