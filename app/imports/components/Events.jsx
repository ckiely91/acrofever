import PropTypes from "prop-types";
import React, { PureComponent } from "react";
import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import Slider from "react-slick";

import { Lobbies, Events } from "../collections";
import { PlayerUsernameWrapper, PlayerImageContainer } from "./OnlinePlayers";
import { CountdownSpan } from "./Countdown";

class SetEmailModal extends PureComponent {
  componentDidMount() {
    $(this.modal).modal({
      detachable: false,
      observeChanges: true,
      onApprove: () => {
        $(this.form).submit();
        return false;
      }
    });

    $(this.form).form({
      onSuccess: (evt, fields) => {
        evt.preventDefault();
        const btn = $(this.modal).find(".ok.button"),
          form = $(this.form);
        btn.addClass("loading");
        Meteor.call("changeEmailAddress", fields.email, err => {
          if (err) {
            form.form("add errors", [err.reason]);
            btn.removeClass("loading");
          } else {
            Meteor.call(
              "registerForReminder",
              Session.get("setReminderId"),
              err => {
                btn.removeClass("loading");
                if (err) {
                  form.form("add errors", [err.reason]);
                } else {
                  $(this.modal).modal("hide");
                }
              }
            );
          }
        });
      }
    });
  }

  render() {
    return (
      <div
        className="ui small basic modal"
        id="setEmailModal"
        ref={ref => (this.modal = ref)}
      >
        <div className="ui icon header">
          <i className="warning icon" />
          Set your email address
        </div>
        <div className="content">
          <p>
            You need to set an email address on your account to set reminders.
          </p>
          <form className="ui form" ref={ref => (this.form = ref)}>
            <div className="field">
              <input
                type="email"
                required="true"
                name="email"
                placeholder="Email address"
              />
            </div>
            <div className="ui error message" />
          </form>
        </div>
        <div className="actions">
          <div className="ui basic cancel inverted button">Cancel</div>
          <div className="ui green ok inverted button">Save</div>
        </div>
      </div>
    );
  }
}

class SingleEvent extends PureComponent {
  static propTypes = {
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    creator: PropTypes.string,
    lobbyId: PropTypes.string.isRequired,
    recurring: PropTypes.bool,
    description: PropTypes.string.isRequired,
    region: PropTypes.string
  };

  joinEvent = evt => {
    evt.preventDefault();
    FlowRouter.go(FlowRouter.path("lobby", { lobbyId: this.props.lobbyId }));
  };

  remindMe = evt => {
    evt.preventDefault();
    if (!Meteor.userId()) {
      FlowRouter.go("/sign-in");
    } else {
      const button = $(this.button);
      button.addClass("loading");
      const user = Meteor.user();

      const doReminder = () => {
        Meteor.call("registerForReminder", this.props._id, err => {
          button.removeClass("loading");
          if (err) console.error(err.reason);
        });
      };

      if (user.emails && user.emails.length > 0) {
        doReminder();
      } else {
        Meteor.call("isEmailAddressSet", (err, res) => {
          if (err) {
            button.removeClass("loading");
            console.error(err);
          } else if (res === true) {
            doReminder();
          } else {
            // user must set email address
            button.removeClass("loading");
            Session.set("setReminderId", this.props._id);
            $("#setEmailModal").modal("show");
          }
        });
      }
    }
  };

  dontRemindMe = evt => {
    evt.preventDefault();
    const button = $(this.button);
    button.addClass("loading");
    Meteor.call("registerForReminder", this.props._id, true, err => {
      button.removeClass("loading");
      if (err) console.error(err.reason);
    });
  };

  isInReminderList = () => {
    const userId = Meteor.userId();
    return userId && this.props.users && this.props.users.indexOf(userId) > -1;
  };

  render() {
    let label, button, labelShown;
    const now = moment(),
      ahead = moment(this.props.date).add(1, "h"),
      behind = moment(this.props.date).subtract(2, "h");

    if (now.isBetween(this.props.date, ahead)) {
      // this event is on right now
      label = <div className="ui left ribbon label">Happening now</div>;
      labelShown = true;
      button = (
        <a
          href="#"
          className="ui right floated mini primary button moveup"
          onClick={evt => this.joinEvent(evt)}
          ref={ref => (this.button = ref)}
        >
          <i className="lightning icon" />
          Join this event
        </a>
      );
    } else {
      if (now.isBetween(behind, this.props.date)) {
        // this event is happening soon
        label = <div className="ui left ribbon label">Starting soon</div>;
        labelShown = true;
      }

      if (this.isInReminderList()) {
        button = (
          <a
            href="#"
            className={
              "ui right floated mini green button" +
              (labelShown ? " moveup" : "")
            }
            onClick={evt => this.dontRemindMe(evt)}
            ref={ref => (this.button = ref)}
          >
            <i className="check icon" />
            Reminder set
          </a>
        );
      } else {
        button = (
          <a
            href="#"
            className={
              "ui right floated mini secondary button" +
              (labelShown ? " moveup" : "")
            }
            onClick={evt => this.remindMe(evt)}
            ref={ref => (this.button = ref)}
          >
            <i className="calendar icon" />
            Remind me
          </a>
        );
      }
    }

    return (
      <div className="item singleEvent">
        <div className="content">
          {label}
          <div className="description">
            <p className={"time" + (labelShown ? " moveup" : "")}>
              {moment(this.props.date).calendar()}
            </p>
            <p className="header">
              {this.props.region ? (
                <i className={this.props.region + " flag"} />
              ) : null}{" "}
              {this.props.name}
            </p>
            {button}
            <p>{this.props.description}</p>
          </div>
          <div className="extra">
            <p>{Lobbies.findOne(this.props.lobbyId).displayName}</p>
          </div>
        </div>
      </div>
    );
  }
}

const UpcomingEvents = ({ ready, events }) => {
  const sortedEvents = events.sort((a, b) => {
    return a.date - b.date;
  });

  let mainContent;

  if (ready) {
    if (events.length > 0) {
      events = (
        <div className="ui divided items">
          {events.map(item => (
            <SingleEvent key={item._id} {...item} />
          ))}
        </div>
      );
    } else {
      events = (
        <p>
          <em>No upcoming events</em>
        </p>
      );
    }
  } else {
    events = <div className="ui active inline loader" />;
  }

  return (
    <div>
      <h2 className="ui header">
        <span>
          <i className="calendar icon" /> Upcoming events
        </span>
      </h2>
      <div className="ui divider" />
      {events}
      <SetEmailModal />
    </div>
  );
};

UpcomingEvents.propTypes = {
  ready: PropTypes.bool.isRequired,
  events: PropTypes.array.isRequired
};

export const UpcomingEventsContainer = withTracker(() => {
  const handle1 = Meteor.subscribe("events");
  const handle2 = Meteor.subscribe("lobbies");

  return {
    ready: handle1.ready() && handle2.ready(),
    events: Events.find().fetch()
  };
})(UpcomingEvents);

const slickSettings = {
  dots: false,
  arrows: true,
  autoplay: false,
  autoplaySpeed: 8000,
  pauseOnHover: true
};

class HofBanner extends PureComponent {
  state = {
    loading: true
  };

  componentWillMount() {
    // Grab a sample of 5 random HOFs
    Meteor.call("getSampleHofEntries", 5, (err, res) => {
      if (err) {
        console.error("Error retrieving HOF entries: " + err.message);
        this.setState({ loading: false, error: true });
      } else {
        Meteor.subscribe("otherPlayers", res.map(item => item.userId));
        this.setState({ loading: false, hofItems: res });
      }
    });
  }

  renderSlide(hofItem, index) {
    return (
      <div key={index}>
        <div className="ui comments">
          <div className="comment">
            <a
              className="avatar"
              href={FlowRouter.path("profile", { userId: hofItem.userId })}
            >
              <PlayerImageContainer id={hofItem.userId} size={70} />
            </a>
            <div className="content">
              <div className="author">
                {hofItem.category} ({hofItem.acronym.join(".")})
              </div>
              <div className="metadata">
                <PlayerUsernameWrapper
                  id={hofItem.userId}
                  linkToProfile={true}
                  beforeText="By "
                  afterText=", "
                />
                <span>{moment(hofItem.created).calendar()}</span>
              </div>
              <div className="text">&quot;{hofItem.acro}&quot;</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    if (this.state.loading || this.state.error) {
      return false;
    }

    return null;

    return (
      <div id="eventBanner" className="hofBanner hiddenOnMobile">
        <div className="ui container">
          <Slider {...slickSettings}>
            {this.state.hofItems.map(this.renderSlide)}
          </Slider>
        </div>
      </div>
    );
  }
}

class EventBanner extends PureComponent {
  static propTypes = {
    currentEvent: PropTypes.object,
    futureEvent: PropTypes.object,
    currentRoute: PropTypes.string.isRequired
  };

  state = {
    show: true
  };

  joinEvent(evt) {
    evt.preventDefault();
    const lobbyId = this.props.currentEvent
      ? this.props.currentEvent.lobbyId
      : this.props.futureEvent.lobbyId;
    FlowRouter.go(FlowRouter.path("lobby", { lobbyId: lobbyId }));
  }

  hideBanner(evt) {
    evt.preventDefault();
    this.setState({ show: false });
  }

  render() {
    if (!this.state.show || this.props.currentRoute === "lobby") return false;

    const outerDivStyle = { position: "relative" };

    if (!this.props.currentEvent && !this.props.futureEvent) {
      return <HofBanner />;
    }

    let region;

    if (this.props.currentEvent && this.props.currentEvent.region) {
      region = <i className={`${this.props.currentEvent.region} flag`} />;
    } else if (this.props.futureEvent && this.props.futureEvent.region) {
      region = <i className={`${this.props.futureEvent.region} flag`} />;
    }

    return (
      <div style={outerDivStyle}>
        <div id="eventBanner" className={this.props.currentEvent ? "red" : ""}>
          <div className="ui container">
            <strong>
              {this.props.currentEvent ? (
                "Event happening now"
              ) : (
                <span>
                  Event starting in{" "}
                  <CountdownSpan endTime={this.props.futureEvent.date} />
                </span>
              )}{" "}
            </strong>
            {region}
            <span className="marginned">
              {this.props.currentEvent
                ? this.props.currentEvent.name
                : this.props.futureEvent.name}
            </span>
            <a
              href="#"
              className="ui secondary tiny button"
              onClick={evt => this.joinEvent(evt)}
            >
              Join event
            </a>
          </div>
        </div>
        <a
          id="hideEventBanner"
          href="#"
          onClick={this.hideBanner}
          className="hiddenOnMobile"
        />
      </div>
    );
  }
}

export const EventBannerContainer = withTracker(() => {
  Meteor.subscribe("events");
  const events = Events.find().fetch(),
    now = moment();

  let currentEvent, futureEvent;

  for (let i = 0; i < events.length; i++) {
    const ahead = moment(events[i].date).add(1, "h"),
      behind = moment(events[i].date).subtract(2, "h");

    if (now.isBetween(events[i].date, ahead)) {
      currentEvent = events[i];
    } else if (now.isBetween(behind, events[i].date)) {
      futureEvent = events[i];
    }
  }

  return {
    currentEvent: currentEvent,
    futureEvent: futureEvent,
    currentRoute: FlowRouter.getRouteName()
  };
})(EventBanner);
