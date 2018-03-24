import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import React, { Component, PureComponent } from "react";
import PropTypes from "prop-types";

import { HallOfFame, Nags, Events, Categories } from "../collections";
import { PlayerLabelContainer } from "../components/OnlinePlayers";

class AdminEvents extends Component {
  static propTypes = {
    pastEvents: PropTypes.array.isRequired,
    futureEvents: PropTypes.array.isRequired
  };

  componentDidMount() {
    $(this.form).form({
      onSuccess: (evt, fields) => {
        this.submitForm(evt, fields);
      }
    });

    $(this.form)
      .find(".checkbox")
      .checkbox();
  }

  deleteEvent(e, event) {
    e.preventDefault();
    Meteor.call("adminDeleteEvent", event._id);
  }

  adminEventRow(event, key) {
    return (
      <tr key={key}>
        <td>
          {event.name} <br /> {event._id.toString()}
        </td>
        <td>{moment(event.date).format("MMMM Do YYYY, h:mm:ss a")}</td>
        <td>{event.lobbyId}</td>
        <td>
          {event.recurring ? (
            <i className="check icon" />
          ) : (
            <i className="cancel icon" />
          )}
        </td>
        <td>{event.description}</td>
        <td>
          {event.region}
          <br />
          <i className={event.region + " flag"} />
        </td>
        <td>{event.users ? event.users.join(", ") : null}</td>
        <td>
          <a href="#" onClick={evt => this.deleteEvent(evt, event)}>
            Delete
          </a>
        </td>
      </tr>
    );
  }

  submitForm(evt, fields) {
    evt.preventDefault();

    fields.date = moment(fields.date, "DD-MM-YYYY HH:mm Z").toDate();
    fields.recurring = fields.recurring ? true : false;

    var $form = $(evt.currentTarget),
      $btn = $form.find("button");

    $btn.addClass("loading");

    Meteor.call("adminAddEvent", fields, err => {
      $btn.removeClass("loading");
      if (err) {
        $form.form("add errors", [err.reason]);
      } else {
        $form.trigger("reset");
      }
    });
  }

  render() {
    return (
      <div>
        <a
          href="#"
          onClick={() => window.history.back()}
          className="ui labeled icon button"
        >
          <i className="arrow left icon" /> Back
        </a>
        <h2 className="ui header">Manage events</h2>
        <h3 className="ui dividing header">Add event</h3>

        <form className="ui form" ref={ref => (this.form = ref)}>
          <div className="field">
            <input name="name" type="text" placeholder="name" required="true" />
          </div>
          <div className="field">
            <input name="date" type="text" placeholder="date" required="true" />
            <p>
              Input in format DD-MM-YYYY HH:mm Z <br />
              eg. 03-01-2016 20:30 +1000
            </p>
          </div>
          <div className="field">
            <input
              name="lobbyId"
              type="text"
              placeholder="lobbyId"
              required="true"
            />
          </div>
          <div className="field">
            <div className="ui checkbox">
              <input
                name="recurring"
                type="checkbox"
                tabIndex="0"
                className="hidden"
              />
              <label>Recurring</label>
            </div>
          </div>
          <div className="field">
            <textarea
              name="description"
              placeholder="description"
              required="true"
            />
          </div>
          <div className="field">
            <input name="region" type="text" placeholder="region" />
          </div>
          <div className="ui error message" />
          <button className="ui primary button">Save</button>
        </form>

        <h3 className="ui dividing header">Current/future events</h3>
        <table className="ui table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Lobby</th>
              <th>Recurring</th>
              <th>Description</th>
              <th>Region</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody>
            {this.props.futureEvents.map((event, index) =>
              this.adminEventRow(event, index)
            )}
          </tbody>
        </table>

        <h3 className="ui dividing header">Past events</h3>
        <table className="ui table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Lobby</th>
              <th>Recurring</th>
              <th>Description</th>
              <th>Region</th>
              <th>Users</th>
            </tr>
          </thead>
          <tbody>
            {this.props.pastEvents.map((event, index) =>
              this.adminEventRow(event, index)
            )}
          </tbody>
        </table>
      </div>
    );
  }
}

export const AdminEventsContainer = withTracker(() => {
  Meteor.subscribe("adminEvents");
  const events = Events.find()
    .fetch()
    .sort(function(a, b) {
      return b.date - a.date;
    });

  console.log("events", events);

  const pastEvents = [],
    futureEvents = [];

  const now = moment().subtract(1, "h");

  _.each(events, function(event) {
    if (moment(event.date).isBefore(now)) {
      pastEvents.push(event);
    } else {
      futureEvents.push(event);
    }
  });

  return { pastEvents, futureEvents };
})(AdminEvents);

class AdminNagRow extends Component {
  editNag(evt, action) {
    evt.preventDefault();
    Meteor.call("adminEditNag", this.props._id, action);
  }

  render() {
    let button;

    if (this.props.active) {
      button = (
        <div>
          <i className="check icon" />
          <a href="#" onClick={evt => this.editNag(evt, "deactivate")}>
            Deactivate
          </a>
        </div>
      );
    } else {
      button = (
        <div>
          <a href="#" onClick={evt => this.editNag(evt, "activate")}>
            Activate
          </a>
          <br />
          <br />
          <a href="#" onClick={evt => this.editNag(evt, "delete")}>
            Delete
          </a>
        </div>
      );
    }

    const nagHtml = { __html: this.props.message };

    return (
      <tr>
        <td>
          {moment(this.props.timestamp).calendar()}
          <br />
          {this.props._id}
        </td>
        <td>{this.props.title}</td>
        <td dangerouslySetInnerHTML={nagHtml} />
        <td>{this.props.icon}</td>
        <td>{this.props.colour}</td>
        <td>{button}</td>
      </tr>
    );
  }
}

class AdminNags extends Component {
  static propTypes = {
    nags: PropTypes.array.isRequired
  };

  componentDidMount() {
    $(this.form).form({
      onSuccess: (evt, fields) => {
        this.submitForm(evt, fields);
      }
    });
  }

  submitForm(evt, fields) {
    evt.preventDefault();
    let form = $(evt.currentTarget),
      button = form.find("button");
    button.addClass("loading");

    if (fields.message.length > 0)
      fields.message = fields.message.replace(/\n/g, "<br>");

    Meteor.call("adminAddNag", fields, function(err) {
      button.removeClass("loading");
      if (err) {
        console.log(err);
      } else {
        form.trigger("reset");
      }
    });
  }

  render() {
    return (
      <div>
        <a
          href="#"
          onClick={() => window.history.back()}
          className="ui labeled icon button"
        >
          <i className="arrow left icon" /> Back
        </a>
        <h2 className="ui header">Manage nags</h2>

        <h3 className="ui header">Add nag</h3>
        <form className="ui form" ref={ref => (this.form = ref)}>
          <div className="field">
            <input type="text" placeholder="Title" name="title" />
          </div>
          <div className="field">
            <textarea placeholder="Message" name="message" />
          </div>
          <div className="field">
            <input type="text" placeholder="Icon" name="icon" />
          </div>
          <div className="field">
            <input type="text" placeholder="Colour" name="colour" />
          </div>
          <div className="field">
            <div className="ui checkbox">
              <input type="checkbox" checked="true" name="active" />
              <label>Active</label>
            </div>
          </div>
          <button type="submit" className="ui button">
            Submit
          </button>
        </form>

        <div className="ui divider" />

        <table className="ui table">
          <thead>
            <tr>
              <th>Created</th>
              <th>Title</th>
              <th>Message</th>
              <th>Icon</th>
              <th>Colour</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {this.props.nags.map((item, index) => (
              <AdminNagRow key={index} {...item} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export const AdminNagsContainer = withTracker(() => {
  Meteor.subscribe("adminNags");

  return {
    nags: Nags.find({}, { sort: { timestamp: -1 } }).fetch()
  };
})(AdminNags);

class AdminHallOfFameRow extends Component {
  state = {
    loading: false
  };

  editEntry = (evt, action) => {
    evt.preventDefault();
    this.setState({ loading: true });
    let opts = {};

    opts[action] = true;

    Meteor.call("adminEditHallOfFameEntry", this.props._id, opts, err => {
      this.setState({ loading: false });
      if (err) {
        alert(err.reason);
        console.error(err);
      }
    });
  };

  render() {
    let button;

    if (this.props.active) {
      button = (
        <div>
          <i className="check icon" />
          <a href="#" onClick={evt => this.editEntry(evt, "deactivate")}>
            Deactivate
          </a>
        </div>
      );
    } else {
      button = (
        <div>
          <a href="#" onClick={evt => this.editEntry(evt, "activate")}>
            Activate
          </a>
          <br />
          <br />
          <a href="#" onClick={evt => this.editEntry(evt, "delete")}>
            Delete
          </a>
        </div>
      );
    }

    return (
      <tr>
        <td>{moment(this.props.created).format("MMMM Do YYYY, h:mm:ss a")}</td>
        <td>
          <PlayerLabelContainer
            id={this.props.userId}
            hideCountry={true}
            size="mini"
          />
        </td>
        <td>{this.props.acronym.join(". ")}</td>
        <td>{this.props.category}</td>
        <td>{this.props.acro}</td>
        <td>{this.props.votes.length}</td>
        <td>
          {this.state.loading ? (
            <div className="ui inline active loader" />
          ) : (
            button
          )}
        </td>
      </tr>
    );
  }
}

const AdminHallOfFame = ({ hallOfFame, getMore }) => (
  <div>
    <a
      href=""
      onClick={() => window.history.back()}
      className="ui labeled icon button"
    >
      <i className="arrow left icon" /> Back
    </a>
    <h2 className="ui header">Approve Hall of Fame entries</h2>
    <table className="ui table">
      <thead>
        <tr>
          <th>Created</th>
          <th>User</th>
          <th>Acronym</th>
          <th>Category</th>
          <th>Acro</th>
          <th>Votes</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {hallOfFame.map(item => (
          <AdminHallOfFameRow key={item._id} {...item} />
        ))}
      </tbody>
    </table>
    <button className="ui button" onClick={getMore}>
      Get more
    </button>
  </div>
);

const AdminHallOfFameTracker = withTracker(({ limit }) => {
  Meteor.subscribe("adminHallOfFame", limit);

  let data = {
    hallOfFame: HallOfFame.find({}, { sort: { created: -1 } }).fetch()
  };

  const userIds = _.uniq(data.hallOfFame.map(h => h.userId));

  Meteor.subscribe("otherPlayers", userIds);

  return data;
})(AdminHallOfFame);

export class AdminHallOfFameContainer extends PureComponent {
  state = {
    limit: 50
  };

  getMore = () => {
    this.setState(state => ({
      limit: state.limit + 50
    }));
  };

  render() {
    return (
      <AdminHallOfFameTracker limit={this.state.limit} getMore={this.getMore} />
    );
  }
}

class AdminCategoryRow extends Component {
  state = {
    loading: false
  };

  editEntry = (evt, action) => {
    evt.preventDefault();
    this.setState({ loading: true });
    let opts = {};

    opts[action] = true;

    Meteor.call("adminEditCategory", this.props._id, opts, err => {
      this.setState({ loading: false });
      if (err) {
        alert(err.reason);
        console.error(err);
      }
    });
  };

  editCategory = evt => {
    evt.preventDefault();
    const $btn = $(evt.currentTarget);
    $btn.addClass("loading");
    const category = $(this.categoryInput).val();
    Meteor.call(
      "adminEditCategory",
      this.props._id,
      { edit: true, category },
      err => {
        $btn.removeClass("loading");
        if (err) alert(err);
      }
    );
  };

  render() {
    let button;

    if (this.props.active) {
      button = (
        <div>
          <i className="check icon" />
          <a href="#" onClick={evt => this.editEntry(evt, "deactivate")}>
            Deactivate
          </a>
        </div>
      );
    } else {
      button = (
        <div>
          <a href="#" onClick={evt => this.editEntry(evt, "activate")}>
            Activate
          </a>
          <br />
          <br />
          <a href="#" onClick={evt => this.editEntry(evt, "delete")}>
            Delete
          </a>
        </div>
      );
    }

    return (
      <tr>
        <td>{moment(this.props.created).format("MMMM Do YYYY, h:mm:ss a")}</td>
        <td>
          <PlayerLabelContainer
            id={this.props.userId}
            hideCountry={true}
            size="mini"
          />
        </td>
        <td>
          <div className="ui fluid action input">
            <input
              type="text"
              defaultValue={this.props.category}
              ref={ref => (this.categoryInput = ref)}
            />
            <button className="ui icon button" onClick={this.editCategory}>
              <i className="edit icon" />
            </button>
          </div>
        </td>
        <td>
          {this.state.loading ? (
            <div className="ui inline active loader" />
          ) : (
            button
          )}
        </td>
      </tr>
    );
  }
}

class AdminCategories extends Component {
  static propTypes = {
    categories: PropTypes.array.isRequired,
    activeCategories: PropTypes.array.isRequired,
    getMore: PropTypes.func.isRequired
  };

  componentDidMount() {
    $("#category_tabs .item").tab();
  }

  deleteActiveCategory(evt, itemId) {
    evt.preventDefault();
    Meteor.call("adminEditCategory", itemId, { delete: true }, err => {
      if (err) alert(err);
    });
  }

  addCategory(evt) {
    evt.preventDefault();
    const $btn = $(evt.currentTarget);
    $btn.addClass("loading");
    const category = $(this.addCategoryInput).val();
    Meteor.call("adminAddCategory", category, err => {
      if (err) {
        alert(err);
      } else {
        this.addCategoryInput.value = "";
      }
      $btn.removeClass("loading");
    });
  }

  render() {
    return (
      <div>
        <a
          href=""
          onClick={() => window.history.back()}
          className="ui labeled icon button"
        >
          <i className="arrow left icon" /> Back
        </a>
        <div className="ui top attached tabular menu" id="category_tabs">
          <a className="item active" data-tab="first">
            Approve Category Submissions
          </a>
          <a className="item" data-tab="second">
            Manage All Categories
          </a>
        </div>
        <div className="ui bottom attached tab segment active" data-tab="first">
          <table className="ui table">
            <thead>
              <tr>
                <th className="two wide">Created</th>
                <th className="two wide">User</th>
                <th className="six wide">Category</th>
                <th className="two wide" />
              </tr>
            </thead>
            <tbody>
              {this.props.categories.map(item => (
                <AdminCategoryRow key={item._id} {...item} />
              ))}
            </tbody>
          </table>
          <button className="ui button" onClick={this.props.getMore}>
            Get more
          </button>
        </div>
        <div className="ui bottom attached tab segment" data-tab="second">
          <div className="ui fluid action input">
            <input
              type="text"
              placeholder="Add category"
              ref={ref => (this.addCategoryInput = ref)}
            />
            <button className="ui icon button" onClick={this.addCategory}>
              <i className="plus icon" />
            </button>
          </div>
          <table className="ui selectable celled table">
            <thead>
              <tr>
                <th>Category</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {this.props.activeCategories.map(item => (
                <tr key={item._id}>
                  <td>{item.category}</td>
                  <td>
                    <a
                      href="#"
                      onClick={evt => this.deleteActiveCategory(evt, item._id)}
                    >
                      Delete
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

const AdminCategoriesTracker = withTracker(({ limit }) => {
  Meteor.subscribe("adminCategories", limit);
  Meteor.subscribe("adminActiveCategories");

  let data = {
    categories: Categories.find(
      { custom: true },
      { sort: { createdAt: -1 } }
    ).fetch(),
    activeCategories: Categories.find(
      { active: true },
      { sort: { createdAt: -1 } }
    ).fetch()
  };

  let userIds = _.uniq(data.categories.map(c => c.userId));

  Meteor.subscribe("otherPlayers", userIds);

  return data;
})(AdminCategories);

export class AdminCategoriesContainer extends PureComponent {
  state = {
    limit: 50
  };

  getMore = () =>
    this.setState(state => ({
      limit: state.limit + 50
    }));

  render() {
    return (
      <AdminCategoriesTracker limit={this.state.limit} getMore={this.getMore} />
    );
  }
}

export const AdminHome = () => (
  <div>
    <a href={FlowRouter.path("adminHallOfFame")} className="ui button">
      Approve Hall of Fame
    </a>
    <a href={FlowRouter.path("adminNags")} className="ui button">
      Manage nags
    </a>
    <a href={FlowRouter.path("adminEvents")} className="ui button">
      Manage events
    </a>
    <a href={FlowRouter.path("adminCategories")} className="ui button">
      Manage categories
    </a>
  </div>
);

export class AdminMain extends Component {
  static propTypes = {
    subContent: PropTypes.element.isRequired
  };

  state = {
    isAdminUser: false
  };

  componentDidMount() {
    Meteor.call("isAdminUser", (err, res) => {
      this.setState({ isAdminUser: res });
    });
  }

  render() {
    if (this.state.isAdminUser) {
      return this.props.subContent;
    } else {
      return <div>You don't have permission to access this page.</div>;
    }
  }
}
