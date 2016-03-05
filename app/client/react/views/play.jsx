lobbySubs = new SubsManager();

const PlayerAvatar = React.createClass({
    propTypes: {
        id: React.PropTypes.string.isRequired
    },
    componentDidMount() {
        this.$popupImg = $(this.popupImg);
        this.$popupImg.popup();
    },
    componentWillUnmount() {
        this.$popupImg.popup('hide');
    },
    render() {
        return <img ref={(ref) => this.popupImg = ref} className="ui mini circular image inline" src={profilePicture(this.props.id, 35)} data-content={displayname(this.props.id)} />;
    }
});

const LobbyRow = React.createClass({
    propTypes: {
        lobby: React.PropTypes.object.isRequired
    },
    goToLobby(evt) {
        FlowRouter.go(FlowRouter.path('lobby', {lobbyId: this.props.lobby._id}));
    },
    render() {
        var playerAvatars;

        if (this.props.lobby.players.length > 0) {
            playerAvatars = this.props.lobby.players.map((id, index) => <PlayerAvatar key={index} id={id} />);
        } else {
            playerAvatars = <em>No players</em>;
        }

        return (
            <tr className="lobbyRow" onClick={this.goToLobby}>
                <td>{this.props.lobby.displayName}</td>
                <td><MomentFromNow time={this.props.lobby.lastUpdated} /></td>
                <td>
                    {playerAvatars}
                </td>
            </tr>
        )
    }
});

const PlayView = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        lobbySubs.subscribe('lobbies');

        var data = {
            lobbies: Lobbies.find().fetch()
        };

        var players = [];

        _.each(data.lobbies, (lobby) => {
           players = players.concat(lobby.players);
        });

        _.uniq(players);

        var handle = Meteor.subscribe('otherPlayers', players);

        data.ready = (lobbySubs.ready() && handle.ready());

        return data;
    },
    componentWillMount() {
        //SEO stuff
        var title = 'Find Lobbies - Acrofever';
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
    render() {
        let lobbyTable;

        if (this.data.ready) {
            lobbyTable = (
                <table className="ui selectable table" id="lobbyList">
                    <thead>
                        <tr>
                            <th className="four wide">Name</th>
                            <th className="four wide">Last active</th>
                            <th className="eight wide">Players</th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.data.lobbies.map((lobby, index) => <LobbyRow key={index} lobby={lobby} />)}
                    </tbody>
                </table>
            )
        } else {
            lobbyTable = <div className="ui centered inline active loader"></div>
        }

        return (
            <div>
                <h2 className="ui header">
                    <i className="search icon"></i>
                    <div className="content">
                        Find a lobby
                        <div className="sub header">Join a lobby to start playing</div>
                    </div>
                </h2>
                <div className="ui hidden divider"></div>
                <div className="ui stackable grid">
                    <div className="eight wide column">
                        {lobbyTable}
                        <div className="ui hidden divider"></div>
                        <div><OnlinePlayers /></div>
                    </div>
                    <div className="eight wide column">
                        <GlobalFeedComponent />
                    </div>
                </div>
            </div>
        )
    }
});

Template.registerHelper('PlayView', () => PlayView);