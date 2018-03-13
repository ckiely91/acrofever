import PropTypes from 'prop-types';
import React from 'react';
import createReactClass from 'create-react-class';
import Slider from 'react-slick';

import {Lobbies, Events} from '../collections';
import {PlayerUsername, PlayerImage} from './OnlinePlayers';
import {CountdownSpan} from './Countdown';

class SetEmailModal extends React.Component {
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
                const btn = $(this.modal).find('.ok.button'),
                    form = $(this.form);
                btn.addClass('loading');
                Meteor.call('changeEmailAddress', fields.email, (err) => {
                    if (err) {
                        form.form('add errors', [err.reason]);
                        btn.removeClass('loading');
                    } else {
                        Meteor.call('registerForReminder', Session.get('setReminderId'), (err) => {
                            btn.removeClass('loading');
                            if (err) {
                                form.form('add errors', [err.reason]);
                            } else {
                                $(this.modal).modal('hide');
                            }
                        });
                    }
                });
            }
        });
    }

    render() {
        return (
            <div className="ui small basic modal" id="setEmailModal" ref={(ref) => this.modal = ref}>
                <div className="ui icon header">
                    <i className="warning icon" />
                    Set your email address
                </div>
                <div className="content">
                    <p>You need to set an email address on your account to set reminders.</p>
                    <form className="ui form" ref={(ref) => this.form = ref}>
                        <div className="field">
                            <input type="email" required="true" name="email" placeholder="Email address" />
                        </div>
                        <div className="ui error message"></div>
                    </form>
                </div>
                <div className="actions">
                    <div className="ui basic cancel inverted button">Cancel</div>
                    <div className="ui green ok inverted button">Save</div>
                </div>
            </div>
        )
    }
}

class SingleEvent extends React.Component {
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

    joinEvent = (evt) => {
        evt.preventDefault();
        FlowRouter.go(FlowRouter.path('lobby', {lobbyId: this.props.lobbyId}));
    };

    remindMe = (evt) => {
        evt.preventDefault();
        if (!Meteor.userId()) {
            FlowRouter.go('/sign-in');
        } else {
            const button = $(this.button);
            button.addClass('loading');
            const user = Meteor.user();

            const doReminder = () => {
                Meteor.call('registerForReminder', this.props._id, (err) => {
                    button.removeClass('loading');
                    if (err) console.error(err.reason);
                });
            };

            if (user.emails && user.emails.length > 0) {
                doReminder();
            } else {
                Meteor.call('isEmailAddressSet', (err, res) => {
                    if (err) {
                        button.removeClass('loading');
                        console.error(err);
                    } else if (res === true) {
                        doReminder();
                    } else {
                        // user must set email address
                        button.removeClass('loading');
                        Session.set('setReminderId', this.props._id);
                        $('#setEmailModal').modal('show');
                    }
                });
            }
        }
    };

    dontRemindMe = (evt) => {
        evt.preventDefault();
        const button = $(this.button);
        button.addClass('loading');
        Meteor.call('registerForReminder', this.props._id, true, (err) => {
            button.removeClass('loading');
            if (err) console.error(err.reason);
        });
    };

    isInReminderList = () => {
        const userId = Meteor.userId();
        return (userId && this.props.users && this.props.users.indexOf(userId) > -1);
    };

    render() {
        let label, button, labelShown;
        const now = moment(),
            ahead = moment(this.props.date).add(1, 'h'),
            behind = moment(this.props.date).subtract(2, 'h');

        if (now.isBetween(this.props.date, ahead)) {
            // this event is on right now
            label = <div className="ui left ribbon label">Happening now</div>;
            labelShown = true;
            button = (
                <a href="#" className="ui right floated mini primary button moveup" onClick={(evt) => this.joinEvent(evt)} ref={(ref) => this.button = ref}>
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
                    <a href="#" className={"ui right floated mini green button" + (labelShown ? ' moveup' : '')} onClick={(evt) => this.dontRemindMe(evt)} ref={(ref) => this.button = ref}>
                        <i className="check icon" />
                        Reminder set
                    </a>
                )
            } else {
                button = (
                    <a href="#" className={"ui right floated mini secondary button" + (labelShown ? ' moveup' : '')} onClick={(evt) => this.remindMe(evt)} ref={(ref) => this.button = ref}>
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
                        <p className={'time' + (labelShown ? ' moveup' : '')}>{moment(this.props.date).calendar()}</p>
                        <p className="header">{this.props.region ? <i className={this.props.region + ' flag'} /> : null} {this.props.name}</p>
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

export const UpcomingEvents = createReactClass({
    displayName: 'UpcomingEvents',
    mixins: [ReactMeteorData],

    getMeteorData() {
        const handle1 = Meteor.subscribe('events'),
            handle2 = Meteor.subscribe('lobbies'),
            events = Events.find().fetch();

        const sortedEvents = events.sort((a, b) => {
            return a.date - b.date;
        });

        return {
            ready: handle1.ready() && handle2.ready(),
            events: sortedEvents
        };
    },

    render() {
        let events;

        if (this.data.ready) {
            if (this.data.events.length > 0) {
                events = (
                    <div className="ui divided items">
                        {this.data.events.map((item, index) => <SingleEvent key={index} {...item} />)}
                    </div>
                );
            } else {
                events = <p><em>No upcoming events</em></p>;
            }
        } else {
            events = <div className="ui active inline loader"></div>;
        }

        return (
            <div>
                <h2 className="ui header">
                    <span><i className="calendar icon" /> Upcoming events</span>
                </h2>
                <div className="ui divider"></div>
                {events}
                <SetEmailModal />
            </div>
        );
    },
});

const slickSettings = {
    dots: false,
    arrows: true,
    autoplay: false,
    autoplaySpeed: 8000,
    pauseOnHover: true
};

class HofBanner extends React.Component {
    constructor(props) {
        super(props);
        this.state = {loading: true};
    }

    componentWillMount() {
        // Grab a sample of 5 random HOFs
        Meteor.call('getSampleHofEntries', 5, (err, res) => {
            if (err) {
                console.error("Error retrieving HOF entries: " + err.message);
                this.setState({loading: false, error: true});
            } else {
                Meteor.subscribe('otherPlayers', res.map(item => item.userId));
                this.setState({loading: false, hofItems: res});
            }
        });
    }

    renderSlide(hofItem, index) {
        return (
            <div key={index}>
                <div className="ui comments">
                <div className="comment">
                    <a className="avatar" href={FlowRouter.path('profile', {userId: hofItem.userId})}>
                        <PlayerImage id={hofItem.userId} size={70} />
                    </a>
                    <div className="content">
                        <div className="author">{hofItem.category} ({hofItem.acronym.join('.')})</div>
                        <div className="metadata">
                            <PlayerUsername id={hofItem.userId} linkToProfile={true} beforeText="By " afterText=", " />
                            <span>{moment(hofItem.created).calendar()}</span>
                        </div>
                        <div className="text">
                            &quot;{hofItem.acro}&quot;
                        </div>
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

        return (
            <div id="eventBanner" className="hofBanner hiddenOnMobile">
                <div className="ui container">
                    <Slider {...slickSettings}>
                        {this.state.hofItems.map(this.renderSlide)}
                    </Slider>
                </div>
            </div>
        )
    }
}


export const EventBanner = createReactClass({
    displayName: 'EventBanner',
    mixins: [ReactMeteorData],

    getInitialState() {
        return {show: true};
    },

    getMeteorData() {
        Meteor.subscribe('events');
        const events = Events.find().fetch(),
            now = moment();

        let currentEvent, futureEvent;

        for (let i = 0; i < events.length; i++) {
            const ahead = moment(events[i].date).add(1, 'h'),
                behind = moment(events[i].date).subtract(2, 'h');

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
    },

    joinEvent(evt) {
        evt.preventDefault();
        const lobbyId = this.data.currentEvent ? this.data.currentEvent.lobbyId : this.data.futureEvent.lobbyId;
        FlowRouter.go(FlowRouter.path('lobby', {lobbyId: lobbyId}));
    },

    hideBanner(evt) {
        evt.preventDefault();
        this.setState({show: false});
    },

    render() {
        if (!this.state.show || this.data.currentRoute === 'lobby')
            return false;

        const outerDivStyle = {position: 'relative'};

        return (
            <div style={outerDivStyle}>
                {(() => {
                    if (this.data.currentEvent || this.data.futureEvent) {
                        let region;

                        if (this.data.currentEvent && this.data.currentEvent.region) {
                            region = <i className={`${this.data.currentEvent.region} flag`} />;
                        } else if (this.data.futureEvent && this.data.futureEvent.region) {
                            region = <i className={`${this.data.futureEvent.region} flag`} />;
                        }


                        return (
                            <div id="eventBanner" className={this.data.currentEvent ? 'red' : ''}>
                                <div className="ui container">
                                    <strong>{this.data.currentEvent ? 'Event happening now' : <span>Event starting in <CountdownSpan endTime={this.data.futureEvent.date} /></span>} </strong>
                                    {region}
                                    <span className="marginned">{this.data.currentEvent ? this.data.currentEvent.name : this.data.futureEvent.name}</span>
                                    <a href="#" className="ui secondary tiny button" onClick={(evt) => this.joinEvent(evt)}>Join event</a>
                                </div>
                            </div>
                        );
                    } else {
                        return <HofBanner />;
                    }
                })()}
                <a id="hideEventBanner" href="#" onClick={this.hideBanner} className="hiddenOnMobile"></a>
            </div>
        );
    },
});