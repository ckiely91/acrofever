import React, { PureComponent } from "react";
import { Meteor } from "meteor/meteor";

import { OnlinePlayersContainer } from "../components/OnlinePlayers";
import { GlobalFeedComponentContainer } from "../components/Feeds";
import { UpcomingEventsContainer } from "../components/Events";
import { lobbySubs } from "../subsManagers";
import { acrofeverAnalytics } from "../helpers";

class GoogleAd extends PureComponent {
  componentWillMount() {
    DocHead.loadScript(
      "//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
    );
  }

  componentDidMount() {
    (adsbygoogle = window.adsbygoogle || []).push({});
  }

  render() {
    return (
      <div className="ui centered leaderboard ad">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-2611027061957213"
          data-ad-slot="6413070082"
          data-ad-format="auto"
        />
      </div>
    );
  }
}

export class HomeView extends PureComponent {
  componentWillMount() {
    lobbySubs.subscribe("lobbies");

    //SEO stuff
    const title = "Acrofever";
    const description =
      "Acrofever is an Acrophobia clone for the modern web. If you never played Acrophobia, it's a fun, zany word game in which players create phrases from a randomly generated acronym, then vote for their favourites.";
    const metadata = {
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

  playNow = evt => {
    evt.preventDefault();
    var dimmer = $(".ui.page.dimmer");
    dimmer.dimmer("show");
    Meteor.call("findPlayNowLobbyId", function(err, res) {
      dimmer.dimmer("hide");
      if (err) console.error(err);
      else FlowRouter.go(FlowRouter.path("lobby", { lobbyId: res }));
    });
    acrofeverAnalytics.track("playNowButton");
  };

  howToPlay = evt => {
    evt.preventDefault();
    $("#howToPlayModal").modal("show");
    acrofeverAnalytics.page("/howToPlay");
  };

  render() {
    const buttonStyle = {
      clear: "both"
    };

    return (
      <div className="ui stackable grid">
        <div className="sixteen wide center aligned column">
          <div className="ui header" id="homeHeader">
            <img src="/images/acrofever-logo-new.png" alt="acrofever logo" />
          </div>
          <h2 className="ui header" id="homeSubHeader">
            The acronym word game for witty humans.
          </h2>
          <div className="row">
            <button
              className="big ui primary labeled icon button mobileBottomMargin"
              style={buttonStyle}
              onClick={this.playNow}
            >
              <i className="lightning icon" />
              Play now
            </button>
            <a
              className="big ui labeled icon button"
              href={FlowRouter.path("play")}
            >
              <i className="search icon" />
              Find a lobby
            </a>
            <div className="ui hidden divider" />
          </div>
          <div className="row">
            {/* <a
              className="ui labeled icon button mobileBottomMargin"
              href={FlowRouter.path("halloffame")}
            >
              <i className="trophy icon" />
              Hall of Fame
            </a> */}
            <button className="ui labeled icon button" onClick={this.howToPlay}>
              <i className="question icon" />
              Learn to play
            </button>
          </div>
          <div className="ui hidden divider" />
        </div>
        <div className="eight wide column">
          <div className="ui raised segment">
            <OnlinePlayersContainer />
          </div>
          <div className="ui raised segment">
            <UpcomingEventsContainer />
          </div>
        </div>
        <div className="eight wide column">
          <GlobalFeedComponentContainer />
        </div>
        {(() => {
          if (Meteor.settings.public.adsEnabled) {
            return (
              <div className="sixteen wide column">
                <GoogleAd />
              </div>
            );
          }
        })()}
        <div className="sixteen wide column">
          <div className="ui divider" />
        </div>
        <div className="eight wide column">
          <div className="ui raised segment">
            <h3 className="ui header">What is Acrofever?</h3>
            <p>Acrofever is an Acrophobia clone for the modern web.</p>
            <p>
              If you never played Acrophobia, it's a fun, zany word game in
              which players create phrases from a randomly generated acronym,
              then vote for their favourites. The best Acro from each round will
              score points, and the most popular Acros from a whole game might
              be immortalised in the Hall of Fame!
            </p>
          </div>
        </div>
        <div className="eight wide column">
          <div className="ui raised segment">
            <h3 className="ui header">About</h3>
            <p>
              Acrofever was created to be fast, user-friendly and playable on
              desktops and mobiles. This version has been newly optimised and
              new features will be added soon. User-created content is not
              currently moderated so leave any delicate sensibilities at the
              door!
            </p>
          </div>
        </div>
      </div>
    );
  }
}
