import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { profilePicture, displayName, acrofeverAnalytics } from "../helpers";

const BrandHeader = () => (
  <a href={FlowRouter.path("home")} id="brandHeader" className="header item">
    Acrofever!
  </a>
);

const HeaderItem = ({ href, path, onClick, icon, children }) => {
  return (
    <a
      href={href || FlowRouter.path(path)}
      className={
        "item " + (path && FlowRouter.getRouteName() === path ? "active" : "")
      }
      onClick={onClick}
      title={children}
      data-variation="inverted"
    >
      <i className={icon + " icon"} />
      <span className="hiddenOnTablet">{children}</span>
    </a>
  );
};

class UserNavDropdown extends Component {
  componentDidMount() {
    $(this.dropdown).dropdown();

    if (typeof Notification !== "undefined")
      setTimeout(this.startComputation(), 0);
  }

  startComputation() {
    this.tracker = Tracker.autorun(() => {
      let permission = this.props.profile.notificationsEnabled;
      if (permission === true && Notification.permission !== "granted") {
        Meteor.call("toggleNotifications", false);
      } else if (
        typeof permission === "undefined" &&
        Notification.permission === "granted"
      ) {
        Meteor.call("toggleNotifications", true);
      }
    });
  }

  componentWillUnmount() {
    if (this.tracker) this.tracker.stop();
  }

  notificationsSupported() {
    return typeof Notification !== "undefined";
  }

  toggleAudio(evt) {
    evt.preventDefault();
    if (this.props.profile.soundsEnabled === false) {
      Meteor.call("toggleSounds", true);
      acrofeverAnalytics.track("turnOnSounds");
    } else {
      Meteor.call("toggleSounds", false);
      acrofeverAnalytics.track("turnOffSounds");
    }
  }

  toggleNotifications(evt) {
    evt.preventDefault();
    if (this.props.profile.notificationsEnabled) {
      Meteor.call("toggleNotifications", false);
      acrofeverAnalytics.track("turnOffNotifications");
    } else {
      acrofeverAnalytics.track("turnOnNotifications");
      if (Notification.permission === "granted") {
        Meteor.call("toggleNotifications", true);
        return;
      }

      if (Notification.permission === "denied") {
        $("#notificationInfoModal").modal("show");
        return;
      }

      Notification.requestPermission(function(result) {
        if (result === "granted") {
          Meteor.call("toggleNotifications", true);
          acrofeverAnalytics.track("allowNotifications");
        } else if (result === "denied") {
          Meteor.call("toggleNotifications", false);
          acrofeverAnalytics.track("denyNotifications");
        }
      });
    }
  }

  logout(evt) {
    evt.preventDefault();
    Meteor.logout();
  }

  render() {
    const menuItemStyle = {
        fontSize: "1.2em",
        paddingLeft: "10px",
        paddingRight: "10px"
      },
      menuIconStyle = { marginRight: 0 },
      picStyle = { marginRight: "10px" };

    const notificationsItem = mobile => (
      <a
        className={"item " + (mobile ? "showOnMobile" : "hiddenOnMobile")}
        style={menuItemStyle}
        title="Toggle notifications"
        onClick={evt => this.toggleNotifications(evt)}
      >
        <i
          className={
            "alarm " +
            (this.props.profile.notificationsEnabled ? "" : "slash ") +
            "icon"
          }
        />
        {mobile
          ? "Turn " +
            (this.props.profile.notificationsEnabled ? "off" : "on") +
            " notifications"
          : ""}
      </a>
    );

    return (
      <div
        id={this.props.desktop ? "rightNav" : ""}
        className={this.props.desktop ? "right menu" : ""}
      >
        <a
          className="hiddenOnMobile item"
          style={menuItemStyle}
          title="Toggle audio"
          onClick={evt => this.toggleAudio(evt)}
        >
          <i
            className={
              "volume " +
              (this.props.profile.soundsEnabled === false ? "off" : "up") +
              " icon"
            }
            style={menuIconStyle}
          />
        </a>
        {this.notificationsSupported() ? notificationsItem(false) : null}
        <div className="ui dropdown item" ref={ref => (this.dropdown = ref)}>
          <img
            className="ui avatar image"
            src={profilePicture(this.props)}
            style={picStyle}
          />
          <span>{displayName(this.props)}</span>
          <i className="dropdown icon" />
          <div className="menu">
            <a
              className="showOnMobile item"
              onClick={evt => this.toggleAudio(evt)}
            >
              <i
                className={
                  "volume " +
                  (this.props.profile.soundsEnabled === false ? "off" : "up") +
                  " icon"
                }
              />
              Turn {this.props.profile.soundsEnabled === false ? "on" : "off"}{" "}
              audio
            </a>
            {this.notificationsSupported() ? notificationsItem(true) : null}
            <a
              href={FlowRouter.path("profile", { userId: this.props._id })}
              className="item"
            >
              View profile
            </a>
            <a href={FlowRouter.path("friends")} className="item">
              Friends
            </a>
            <a href="/change-password" className="item">
              Change password
            </a>
            <a className="item" onClick={evt => this.logout(evt)}>
              Sign out
            </a>
          </div>
        </div>
      </div>
    );
  }
}

const UserNavWrapper = ({ user, desktop }) => {
  const signInItem = (
    <HeaderItem href="/sign-in" icon="sign in">
      Sign in / Register
    </HeaderItem>
  );
  let signIn = signInItem;
  if (desktop) {
    signIn = (
      <div id="rightNav" className="right menu">
        {signInItem}
      </div>
    );
  }

  return user ? <UserNavDropdown desktop={desktop} {...user} /> : signIn;
};

const UserNavWrapperComponent = withTracker(() => {
  return {
    user: Meteor.user()
  };
})(UserNavWrapper);

export class NavComponent extends Component {
  componentDidMount() {
    $("#mobileNav a").click(() => {
      const $slideMenu = $(this.slideMenu);
      if ($slideMenu.css("display") === "block")
        $slideMenu.transition("slide down");
    });

    $("#desktopNav a").popup({
      onShow() {
        const screenWidth = $(window).width();
        return screenWidth >= 768 && screenWidth < 1200;
      }
    });
  }

  playNow = evt => {
    evt.preventDefault();

    if (FlowRouter.getRouteName() === "lobby") return;

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

  blog = evt => {
    evt.preventDefault();
    location.assign("https://acrofever.com/blog");
  };

  toggleMobileMenu = evt => {
    evt.preventDefault();
    $(this.slideMenu).transition("slide down");
  };

  render() {
    const sidebarStyle = { marginRight: 0 };

    return (
      <div>
        <div className="ui inverted menu" id="desktopNav">
          <div className="ui container">
            <BrandHeader />
            <HeaderItem
              href="#"
              icon="lightning"
              onClick={evt => this.playNow(evt)}
            >
              Play now
            </HeaderItem>
            <HeaderItem path="play" icon="search">
              Find a lobby
            </HeaderItem>
            <HeaderItem path="halloffame" icon="trophy">
              Hall of Fame
            </HeaderItem>
            <HeaderItem path="leaderboard" icon="star">
              Leaderboard
            </HeaderItem>
            <HeaderItem
              href="#"
              icon="question"
              onClick={evt => this.howToPlay(evt)}
            >
              How to Play
            </HeaderItem>
            {/* <HeaderItem href="/blog" icon="rss" onClick={(evt) => this.blog(evt)}>Blog</HeaderItem> */}
            <UserNavWrapperComponent desktop={true} />
          </div>
        </div>

        <div id="mobileNav">
          <div className="ui inverted menu">
            <BrandHeader />
            <div id="rightNav" className="right menu">
              <h2 className="header item">
                <i
                  className="sidebar icon"
                  style={sidebarStyle}
                  onClick={evt => this.toggleMobileMenu(evt)}
                />
              </h2>
            </div>
          </div>
          <div className="slideMenu" ref={ref => (this.slideMenu = ref)}>
            <div className="ui inverted stackable menu">
              <HeaderItem
                href="#"
                icon="lightning"
                onClick={evt => this.playNow(evt)}
              >
                Play now
              </HeaderItem>
              <HeaderItem path="play" icon="search">
                Find a lobby
              </HeaderItem>
              <HeaderItem path="halloffame" icon="trophy">
                Hall of Fame
              </HeaderItem>
              <HeaderItem path="leaderboard" icon="star">
                Leaderboard
              </HeaderItem>
              <HeaderItem
                href="#"
                icon="question"
                onClick={evt => this.howToPlay(evt)}
              >
                How to Play
              </HeaderItem>
              <HeaderItem
                href="/blog"
                icon="rss"
                onClick={evt => location.assign("/blog")}
              >
                Blog
              </HeaderItem>
              <UserNavWrapperComponent desktop={false} />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
