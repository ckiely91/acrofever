import React, { Component, PureComponent } from "react";
import PropTypes from "prop-types";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";

import { profilePicture, displayName } from "../helpers";

const LeaderboardTableRow = ({ user, num }) => {
  const skillEstimate =
    Math.round(user.profile.trueskill.skillEstimate * 100) / 100;

  return (
    <tr
      onClick={() =>
        FlowRouter.go(FlowRouter.path("profile", { userId: user._id }))
      }
    >
      <td>{num}</td>
      <td>
        <h4 className="ui image header">
          <img
            src={profilePicture(user, 35)}
            className="ui mini rounded image"
          />
          <div className="content">
            {displayName(user)}
            <div className="sub header">
              Member since {moment(user.createdAt).calendar()}
            </div>
          </div>
        </h4>
      </td>
      <td>{user.profile.trueskill.rankedGames}</td>
      <td>{skillEstimate}</td>
    </tr>
  );
};

LeaderboardTableRow.propTypes = {
  user: PropTypes.object,
  num: PropTypes.number.isRequired
};

class LeaderboardTable extends Component {
  static propTypes = {
    players: PropTypes.array.isRequired
  };

  componentDidMount() {
    $(this.helpIcon).popup({
      content:
        "A game is considered ranked if you participated in over 40% of its total rounds."
    });
  }

  render() {
    return (
      <table className="ui selectable celled table">
        <thead>
          <tr>
            <th>#</th>
            <th>Player</th>
            <th>
              Ranked games played{" "}
              <i
                className="mini help circular inverted link icon"
                ref={ref => (this.helpIcon = ref)}
              />
            </th>
            <th>Skill</th>
          </tr>
        </thead>
        <tbody>
          {this.props.players.map((player, index) => (
            <LeaderboardTableRow
              key={player._id}
              num={index + 1}
              user={player}
            />
          ))}
        </tbody>
      </table>
    );
  }
}

class LeaderboardInfoModal extends PureComponent {
  componentDidMount() {
    $(this.modal).modal({
      detachable: false,
      observeChanges: true
    });
  }

  render() {
    return (
      <div
        className="ui small modal"
        id="leaderboardInfoModal"
        ref={ref => (this.modal = ref)}
      >
        <div className="header">How are rankings calculated?</div>
        <div className="content">
          <p>
            Acrofever uses Microsoft's{" "}
            <a
              href="https://www.microsoft.com/en-us/research/project/trueskill-ranking-system/"
              target="_blank"
              rel="noopener noreferrer"
            >
              TrueSkill
            </a>{" "}
            algorithm to rank players after every completed game. Players are
            ranked according to their position in the scores, along with the
            previous rankings & skill levels of the other players in the game.
          </p>
          <p>
            To appear on the leaderboard and get a ranking, you need to have
            played at least{" "}
            {Meteor.settings.public.leaderboardMinimumGamesToBeVisible} ranked
            games. A ranked game is considered to be any game where you
            participated in over 40% of the rounds.
          </p>
          <p>
            If you're a techie and want to see how this is implemented, feel
            free to peruse the{" "}
            <a
              href="https://github.com/ckiely91/acrofever/blob/master/app/server/imports/Rankings.js"
              target="_blank"
              rel="noopener noreferrer"
            >
              source code
            </a>{" "}
            for Acrofever's rankings!
          </p>
        </div>
        <div className="actions">
          <button className="ui cancel button">Close</button>
        </div>
      </div>
    );
  }
}

const LeaderboardView = ({ limit, total, players, ready, getMore }) => (
  <div>
    <h2 className="ui header">
      <i className="star icon" />
      <div className="content">
        Leaderboard
        <div className="sub header">
          Play over {Meteor.settings.public.leaderboardMinimumGamesToBeVisible}{" "}
          ranked games to get a ranking on the leaderboard!{" "}
          <a href="#" onClick={() => $("#leaderboardInfoModal").modal("show")}>
            How are rankings calculated?
          </a>
        </div>
      </div>
    </h2>
    <div className="ui hidden divider" />
    <LeaderboardTable players={players} />
    {total > players.length && (
      <button
        className={ready ? "ui primary button" : "ui primary loading button"}
        onClick={getMore}
      >
        Show more
      </button>
    )}
    <LeaderboardInfoModal />
  </div>
);

const LeaderboardViewTracker = withTracker(({ limit }) => {
  const handle = Meteor.subscribe("playerRankings", limit);
  const cursor = Meteor.users.find(
    {
      "profile.trueskill.rankedGames": {
        $gte: Meteor.settings.public.leaderboardMinimumGamesToBeVisible
      }
    },
    {
      sort: { "profile.trueskill.skillEstimate": -1 }
    }
  );

  return {
    ready: handle.ready(),
    players: cursor.fetch()
  };
})(LeaderboardView);

export class LeaderboardViewContainer extends PureComponent {
  state = {
    limit: 25,
    total: Infinity
  };

  componentWillMount() {
    Meteor.call("getTotalRankedCount", (err, res) => {
      if (err) {
        console.error("Error getting total ranked count");
      } else {
        this.setState({ total: res });
      }
    });
  }

  getMore = () => this.setState(state => ({ limit: state.limit + 25 }));

  render() {
    return (
      <LeaderboardViewTracker
        limit={this.state.limit}
        total={this.state.total}
        getMore={this.getMore}
      />
    );
  }
}
