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
                <td>{this.props.profile.trueskill.rankedGames}</td>
                <td>{this.round(this.props.profile.trueskill.skillEstimate)}</td>
            </tr>
        )
    }
}

class LeaderboardTable extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(this.helpIcon).popup({
            content: "A game is considered ranked if you participated in over 40% of its total rounds."
        });
    }

    render() {
        return (
            <table className="ui selectable celled table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Player</th>
                        <th>Ranked games played <i className="mini help circular inverted link icon" ref={ref => this.helpIcon = ref}></i></th>
                        <th>Skill</th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.players.map((player, index) => <LeaderboardTableRow key={index} num={index + 1} {...player}/>)}
                </tbody>
            </table>
        )
    }
}

class LeaderboardInfoModal extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        $(this.modal).modal({
            detachable: false,
            observeChanges: true
        });
    }

    render() {
        return (
            <div className="ui small modal" id="leaderboardInfoModal" ref={ref => this.modal = ref}>
                <div className="header">How are rankings calculated?</div>
                <div className="content">
                    <p>Acrofever uses Microsoft's <a href="https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/" target="_blank" rel="noopener noreferrer">TrueSkill</a> algorithm
                        to rank players after every completed game. Players are ranked according to their position in the scores,
                        and the previous rankings & skill levels of the other players in the game.</p>
                    <p>To appear on the leaderboard and get a ranking, you need to have played at least {Meteor.settings.public.leaderboardMinimumGamesToBeVisible} ranked games. A ranked game is considered any game where you participated in over 40% of the rounds.</p>
                    <p>If you're a techy and want to see how this is implemented, feel free to peruse the <a href="https://github.com/ckiely91/acrofever/blob/master/app/server/imports/Rankings.js" target="_blank" rel="noopener noreferrer">source code</a> for Acrofever's rankings!</p>
                </div>
                <div className="actions">
                    <button className="ui cancel button">Close</button>
                </div>
            </div>
        );
    }
}

export const LeaderboardView = React.createClass({
    mixins: [ReactMeteorData],
    getInitialState() {
        return {
            limit: 25,
            total: null
        };
    },
    componentWillMount() {
        Meteor.call('getTotalRankedCount', (err, res) => {
            if (err) {
                console.error("Error getting total ranked count");
                this.setState({total: Infinity});
            } else {
                this.setState({total: res});
            }
        });
    },
    getMeteorData() {
        const handle = Meteor.subscribe('playerRankings', this.state.limit);
        const cursor = Meteor.users.find({
            'profile.trueskill.rankedGames': {$gte: Meteor.settings.public.leaderboardMinimumGamesToBeVisible}
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
    openInfoModal(evt) {
        evt.preventDefault();
        $('#leaderboardInfoModal').modal('show');
    },
    render() {
        return (
            <div>
                <h2 className="ui header">
                    <i className="star icon" />
                    <div className="content">
                        Leaderboard
                        <div className="sub header">
                            Play over {Meteor.settings.public.leaderboardMinimumGamesToBeVisible} ranked games to get a ranking on the leaderboard! <a href="#" onClick={this.openInfoModal}>How are rankings calculated?</a>
                        </div>
                    </div>
                </h2>
                <div className="ui hidden divider"></div>
                <LeaderboardTable players={this.data.players} />
                {this.state.total && this.state.total > this.data.players.length
                    ? <button className={this.data.ready ? "ui primary button" : "ui primary loading button"} onClick={this.getMore}>Show more</button>
                    : null }
                <LeaderboardInfoModal/>
            </div>
        );
    }
});