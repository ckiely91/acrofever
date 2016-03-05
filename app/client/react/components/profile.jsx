const UserStats = React.createClass({
    gamesPlayed() {
        return (this.props.stats && this.props.stats.gamesPlayed) ? this.props.stats.gamesPlayed : 0;
    },
    gamesWon() {
        return (this.props.stats && this.props.stats.gamesWon) ? this.props.stats.gamesWon : 0;
    },
    winRate() {
        var percent = this.gamesWon() / this.gamesPlayed() * 100;
        if (_.isFinite(percent))
            return Math.round(percent);
        return 0;
    },
    renderStatistic(stat, index) {
        return (
            <div key={index} className="statistic">
                <div className="value">{stat.value}</div>
                <div className="label">{stat.label}</div>
            </div>
        )
    },
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
            <div>
                <div className="ui four inverted statistics hiddenOnMobile">
                    {stats}
                </div>
                <div className="ui two inverted statistics showOnMobile">
                    {stats}
                </div>
            </div>
        );
    }
});

const ProfileModal = React.createClass({
    mixins: [ReactMeteorData],
    getInitialState() {
        let numberOfHallOfFame = new ReactiveVar();
        return {numberOfHallOfFame};
    },
    getMeteorData() {
        var data = {
            id: Session.get('selectedProfileUserId'),
            numberOfHallOfFame: this.state.numberOfHallOfFame.get()
        };

        var handle = Meteor.subscribe('otherPlayers', [data.id]);

        data.ready = handle.ready();
        data.user = Meteor.users.findOne(data.id);

        var self = this;
        Meteor.call('hallOfFameUserAcroCount', this.data.id, (err, res) => {
            if (err) console.log(err);
            self.state.numberOfHallOfFame.set(res);
        });

        return data;
    },
    componentDidMount() {
        $(this.modal).modal({
            detachable: false,
            observeChanges: true
        });
    },
    render() {
        var body;

        if (this.data.ready) {
            if (this.data.user) {
                body = (
                    <div>
                        <h1 className="ui center aligned inverted header">
                            <img className="ui circular image" src={profilePicture(this.data.user._id, 70)} />
                            <div className="content">
                                {displayname(this.data.user._id)}
                                <div className="sub header">Joined {moment(this.data.user.createdAt).calendar()}</div>
                            </div>
                        </h1>
                        <div className="content">
                            <UserStats halloffame={this.data.numberOfHallOfFame} stats={this.data.user.profile.stats} />
                        </div>
                    </div>
                );
            } else {
                body = <em>This user does not exist</em>;
            }
        } else {
            body = <div className="ui active loader"></div>;
        }

        return <div ref={(ref) => this.modal = ref} className="ui small basic modal" id="profileModal">{body}</div>;
    }
});

Template.registerHelper('ProfileModal', () => ProfileModal);