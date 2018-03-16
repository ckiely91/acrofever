import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";

import { profilePicture, displayName } from "../helpers";
import { HallOfFame } from "../collections";

const HallOfFameAcroCard = ({ acro, user }) => (
  <div className="ui card">
    <div className="content">
      <div className="header">{acro.acronym.join(". ")}</div>
      <div className="meta">{acro.category}</div>
      <div className="description">{acro.acro}</div>
    </div>
    <div className="content">
      <div className="ui list">
        <a
          href={FlowRouter.path("profile", { userId: acro.userId })}
          className="userProfilePicture item"
        >
          <img className="ui avatar image" src={profilePicture(user)} />
          <div className="content">
            <div className="header">{displayName(user)}</div>
            <div className="description">{moment(acro.created).calendar()}</div>
          </div>
        </a>
      </div>
    </div>
  </div>
);

HallOfFameAcroCard.propTypes = {
  acro: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    acronym: PropTypes.array.isRequired,
    acro: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    created: PropTypes.instanceOf(Date).isRequired
  }),
  user: PropTypes.object
};

const HallOfFameAcroCardContainer = withTracker(({ acro }) => {
  return {
    user: Meteor.users.findOne(acro.userId)
  };
})(HallOfFameAcroCard);

const HallOfFameAcros = ({ limit, totalAcros, acros, getMore, ready }) => {
  if (acros && acros.length === 0) {
    return <em>No data</em>;
  }

  return (
    <div>
      <div className="ui cards">
        {acros.map((acro, index) => (
          <HallOfFameAcroCardContainer key={acro._id} acro={acro} />
        ))}
      </div>
      <div className="ui hidden divider" />
      {limit < totalAcros && (
        <button
          className={"ui labeled icon" + (ready ? "" : " loading") + " button"}
          onClick={getMore}
        >
          <i className="plus icon" />
          Get more
        </button>
      )}
    </div>
  );
};

const HallOfFameAcrosTracker = withTracker(({ userId, limit }) => {
  const handle = Meteor.subscribe("hallOfFame", limit, userId);
  const data = {};
  if (userId) {
    data.acros = HallOfFame.find(
      { userId: userId },
      { sort: { created: -1 } }
    ).fetch();
  } else {
    data.acros = HallOfFame.find({}, { sort: { created: -1 } }).fetch();
  }

  const userIds = data.acros.map(acro => acro.userId);
  const handle2 = Meteor.subscribe("otherPlayers", userIds);
  data.ready = handle.ready() && handle2.ready();

  return data;
})(HallOfFameAcros);

export class HallOfFameAcrosContainer extends PureComponent {
  static propTypes = {
    userId: PropTypes.string,
    limit: PropTypes.number
  };

  constructor(props) {
    super(props);

    this.state = {
      limit: props.limit || 18,
      totalAcros: 0
    };
  }

  componentWillMount() {
    Meteor.call("hallOfFameAcroCount", this.props.userId, (err, res) => {
      if (err) return console.error(err);
      this.setState({ totalAcros: res });
    });
  }

  getMore = () =>
    this.setState(state => ({
      limit: state.limit + 18
    }));

  render() {
    return (
      <HallOfFameAcrosTracker
        userId={this.props.userId}
        limit={this.state.limit}
        totalAcros={this.state.totalAcros}
        getMore={this.getMore}
      />
    );
  }
}

export class HallOfFameView extends PureComponent {
  componentWillMount() {
    //SEO stuff
    var title = "Hall of Fame - Acrofever";
    var description =
      "The crème de la crème. Acrofever is an Acrophobia clone for the modern web. If you never played Acrophobia, it's a fun, zany word game in which players create phrases from a randomly generated acronym, then vote for their favourites.";
    var metadata = {
      description: description,
      "og:description": description,
      "og:title": title,
      "og:image": "https://acrofever.com/images/fb-image.png",
      "twitter:card": "summary"
    };

    DocHead.setTitle(title);
    _.each(metadata, function(content, name) {
      DocHead.addMeta({ name: name, content: content });
    });
  }

  render() {
    return (
      <div>
        <h2 className="ui header">
          <i className="trophy icon" />
          <div className="content">
            Hall of Fame
            <div className="sub header">The crème de la crème.</div>
          </div>
        </h2>
        <p>
          At the end of a game of Acrofever, players vote on their overall
          favourite acro from the game to be added to the Hall of Fame.<br />
          You too could be immortalised on the Hall of Fame one day, so{" "}
          <a href={FlowRouter.path("play")}>get playing</a>!
        </p>
        <HallOfFameAcrosContainer />
      </div>
    );
  }
}
