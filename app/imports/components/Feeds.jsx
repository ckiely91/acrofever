import PropTypes from "prop-types";
import React, { PureComponent, Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { findUserById } from "../helpers";

import { autolink } from "react-autolink";
import { emojify } from "react-emojione";
import EmojiPicker from "emojione-picker";

import { MomentFromNow } from "./Countdown";
import {
  playSound,
  profilePicture,
  displayName,
  specialTags,
  acrofeverAnalytics
} from "../helpers";
import { GlobalFeed, LobbyFeed } from "../collections";

class ChatInput extends PureComponent {
  static propTypes = {
    lobbyId: PropTypes.string
  };

  state = {
    showEmojiPicker: false
  };

  handleSubmit = evt => {
    evt.preventDefault();
    if (Meteor.userId()) {
      const form = $(evt.currentTarget);
      const message = form.form("get values").message;

      if (this.props.lobbyId) {
        Meteor.call("addLobbyFeedChat", this.props.lobbyId, message);
        acrofeverAnalytics.track("addLobbyChat");
      } else {
        Meteor.call("addGlobalFeedChat", message);
        acrofeverAnalytics.track("addGlobalChat");
        $(".feedChatDiv .feedInner").scrollTop(0);
      }

      form.trigger("reset");
    } else {
      FlowRouter.go("/sign-in");
    }
  };

  watchForClicks = evt => {
    if (!$(evt.target).closest(".emoji-dialog").length) {
      this.setState({ showEmojiPicker: false });
      $(document).unbind("click", this.watchForClicks);
    }
  };

  toggleEmojiPicker = evt => {
    evt.preventDefault();
    if (this.state.showEmojiPicker) {
      this.setState({ showEmojiPicker: false });
      $(document).unbind("click", this.watchForClicks);
    } else {
      this.setState({ showEmojiPicker: true });
      $(document).bind("click", this.watchForClicks);
    }
  };

  pickEmoji = data => {
    this.setState({ showEmojiPicker: false });
    $(document).unbind("click", this.watchForClicks);

    const input = $(this.inputField);
    input.val(
      `${input.val().length > 0 ? input.val() + " " : ""}${data.shortname} `
    );
    input.focus();
  };

  render() {
    return (
      <div>
        <form
          id="chat-input-form"
          className="ui form"
          onSubmit={this.handleSubmit}
        >
          <div className="ui fluid icon input">
            <input
              type="text"
              id="chat-input-box"
              name="message"
              placeholder="Type here to chat..."
              autoComplete="off"
              required="true"
              ref={ref => (this.inputField = ref)}
            />
            <i
              className="circular smile link icon"
              onClick={this.toggleEmojiPicker}
            />
          </div>
        </form>
        {this.state.showEmojiPicker ? (
          <EmojiPicker search={true} onChange={this.pickEmoji} />
        ) : null}
      </div>
    );
  }
}

ChatInput.propTypes = {
  lobbyId: PropTypes.string
};

const UserSpecialTag = ({ color, tag }) => {
  const style = { marginLeft: "5px" },
    className = `ui mini ${color || "red"} horizontal basic label`;

  return (
    <div className={className} style={style}>
      {tag}
    </div>
  );
};

const emojisAndLinks = s => {
  let arr = autolink(s, {
    target: "_blank",
    rel: "nofollow"
  });

  arr = arr.map(obj => {
    if (typeof obj === "string") {
      return emojify(obj, {
        styles: { backgroundImage: "url(/emojione.sprites.png)" }
      });
    }
    return obj;
  });

  return arr;
};

const SingleEvent = ({ user, icon, timestamp, summary, detail }) => {
  const profilePicOrIcon = user ? (
    <a
      href={FlowRouter.path("profile", { userId: user._id })}
      target="_blank"
      className="userProfilePicture"
    >
      <img src={profilePicture(user)} />
    </a>
  ) : (
    <i className={(icon ? icon : "info") + " icon"} />
  );

  let usernameOrSummary;

  if (user) {
    const flag =
      user.profile && user.profile.country ? (
        <i className={user.profile.country + " flag"} />
      ) : null;
    const tags = specialTags(user);
    usernameOrSummary = (
      <span>
        <a
          href={FlowRouter.path("profile", { userId: user })}
          target="_blank"
          className="userProfilePicture"
        >
          {displayName(user)}&nbsp;
          {flag}
        </a>
        {tags &&
          tags.map(tag => (
            <UserSpecialTag key={tag.tag} tag={tag.tag} color={tag.color} />
          ))}
      </span>
    );
  } else {
    usernameOrSummary = <span>{summary}</span>;
  }

  return (
    <div className="event">
      <div className="label">{profilePicOrIcon}</div>
      <div className={"content " + (user ? "userProfilePicture" : "")}>
        <div className="summary">
          {usernameOrSummary}
          <div className="date">
            <MomentFromNow time={timestamp} />
          </div>
        </div>
        {detail && (
          <div className="detailed-content">{emojisAndLinks(detail)}</div>
        )}
      </div>
    </div>
  );
};

SingleEvent.propTypes = {
  user: PropTypes.object,
  icon: PropTypes.string,
  timestamp: PropTypes.instanceOf(Date).isRequired,
  summary: PropTypes.string,
  detail: PropTypes.string
};

class GlobalFeedComponent extends Component {
  static propTypes = {
    globalFeedLimit: PropTypes.number.isRequired,
    subsReady: PropTypes.bool.isRequired,
    events: PropTypes.array.isRequired,
    users: PropTypes.array.isRequired
  };

  componentDidMount() {
    const feedOuter = $(".feedChatDiv");
    const feed = feedOuter.find(".feedInner");
    feed.scroll(function() {
      var fadeUpper = feedOuter.find(".fade.upper");
      var fadeLower = feedOuter.find(".fade.lower");
      var scroll = feed.scrollTop();
      if (scroll > 50) {
        fadeUpper.css("opacity", 1);
      } else {
        fadeUpper.css("opacity", scroll / 50);
      }

      var innerFeed = feed.find(".feed");
      var bottomScroll = innerFeed.height() - scroll - feedOuter.height();

      if (bottomScroll > 50) {
        fadeLower.css("opacity", 1);
      } else {
        fadeLower.css("opacity", bottomScroll / 50);
      }

      var getMoreDiv = $(".getMoreDiv");
      if (getMoreDiv.length && getMoreDiv.isOnScreen()) {
        var limit = Session.get("globalFeedLimit");
        limit += 20;
        if (limit <= 200) {
          Session.set("globalFeedLimit", limit);
        }
      }
    });
  }

  render() {
    const showGetMoreDiv =
      this.props.events.length === this.props.globalFeedLimit;

    return (
      <div>
        <div>
          <ChatInput />
        </div>
        <div className="feedChatDiv">
          <div className="fade upper" />
          <div className="fade lower" />
          <div className="feedInner">
            <div className="ui small feed">
              {this.props.events.map(event => (
                <SingleEvent
                  key={event._id}
                  {...event}
                  user={findUserById(this.props.users, event.user)}
                />
              ))}
            </div>
            {!this.props.subsReady && (
              <div className="ui inline active centered loader" />
            )}
            {showGetMoreDiv && <div className="getMoreDiv" />}
          </div>
        </div>
      </div>
    );
  }
}

export const GlobalFeedComponentContainer = withTracker(() => {
  if (!Session.get("globalFeedLimit")) {
    Session.set("globalFeedLimit", 20);
  }

  const handle = Meteor.subscribe("globalFeed", Session.get("globalFeedLimit"));

  var data = {
    globalFeedLimit: Session.get("globalFeedLimit"),
    subsReady: handle.ready(),
    events: GlobalFeed.find({}, { sort: { timestamp: -1 } }).fetch(),
    users: []
  };

  if (handle.ready()) {
    let playerIds = [];

    for (let i = 0; i < data.events.length; i++) {
      if (data.events[i].user) {
        playerIds.push(data.events[i].user);
      }
    }

    playerIds = _.uniq(playerIds);
    if (playerIds.length > 0) {
      Meteor.subscribe("otherPlayers", playerIds);
      data.users = Meteor.users.find({ _id: { $in: playerIds } }).fetch();
    }
  }

  return data;
})(GlobalFeedComponent);

class LobbyFeedComponent extends Component {
  static propTypes = {
    subsReady: PropTypes.bool.isRequired,
    lobbyFeedLimit: PropTypes.number.isRequired,
    events: PropTypes.array.isRequired,
    lobbyId: PropTypes.string
  };

  componentDidMount() {
    $(window).scroll(function() {
      var getMoreDiv = $(".getMoreDiv");
      if (getMoreDiv.length && getMoreDiv.isOnScreen()) {
        var limit = Session.get("lobbyFeedLimit");
        limit += 20;
        if (limit <= 200) Session.set("lobbyFeedLimit", limit);
      }
    });

    setTimeout(this.startComputation, 0);
  }

  componentWillUnmount() {
    this.tracker.stop();
  }

  startComputation = () => {
    this.tracker = Tracker.autorun(() => {
      LobbyFeed.find({ lobbyId: this.props.lobbyId }).observeChanges({
        added: (id, doc) => {
          if (this.props.subsReady && doc.user) {
            playSound("chat");
          }
        }
      });
    });
  };

  render() {
    return (
      <div>
        <div>
          <ChatInput lobbyId={this.props.lobbyId} />
        </div>
        <div className="ui small feed">
          {this.props.events.map(event => (
            <SingleEvent
              key={event._id}
              {...event}
              user={findUserById(this.props.users, event.user)}
            />
          ))}
          {!this.props.subsReady && (
            <div className="ui inline active centered loader" />
          )}
          {this.props.events.length === this.props.lobbyFeedLimit && (
            <div className="getMoreDiv" />
          )}
        </div>
      </div>
    );
  }
}

export const LobbyFeedComponentContainer = withTracker(({ lobbyId }) => {
  if (!Session.get("lobbyFeedLimit")) Session.set("lobbyFeedLimit", 20);

  const handle = Meteor.subscribe(
    "lobbyFeed",
    lobbyId,
    Session.get("lobbyFeedLimit")
  );

  const data = {
    lobbyFeedLimit: Session.get("lobbyFeedLimit"),
    subsReady: handle.ready(),
    events: LobbyFeed.find(
      { lobbyId: lobbyId },
      { sort: { timestamp: -1 } }
    ).fetch(),
    users: []
  };

  if (handle.ready()) {
    let playerIds = [];
    for (let i = 0; i < data.events.length; i++) {
      if (data.events[i].user) {
        playerIds.push(data.events[i].user);
      }
    }

    if (playerIds.length > 0) {
      playerIds = _.uniq(playerIds);
      Meteor.subscribe("otherPlayers", playerIds);
      data.users = Meteor.users.find({ _id: { $in: playerIds } }).fetch();
    }
  }

  return data;
})(LobbyFeedComponent);
