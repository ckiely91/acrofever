import React from 'react';

export const CountdownSpan = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        return {
            now: TimeSync.serverTime(null, 500) || mo.now.get()
        }
    },
    propTypes: {
        endTime: React.PropTypes.instanceOf(Date).isRequired
    },
    countdown(endTime, now) {
        let diff = moment(endTime).diff(now);
        if (diff >= 0)
            return moment(diff).format('m:ss');
        else
            return '0:00';
    },
    render() {
        return <span>{this.countdown(this.props.endTime, this.data.now)}</span>
    }
});

export const CountdownHeader = React.createClass({
    propTypes: {
        endTime: React.PropTypes.instanceOf(Date).isRequired,
        header: React.PropTypes.string.isRequired,
        subheader: React.PropTypes.string
    },
    render() {
        return (
            <div className="ui stackable grid">
                <div className="four wide column">
                    <h3 className="ui center aligned icon header">
                        <i className="clock icon"></i>
                        <CountdownSpan endTime={this.props.endTime} />
                    </h3>
                </div>
                <div className="twelve wide column">
                    <h1 className="ui center aligned header phaseHeader">{this.props.header}</h1>
                    <h3 className="ui center aligned header">{this.props.subheader}</h3>
                </div>
            </div>
        );
    }
});

/* Reactively returns a simple span with moment fromNow time, updated every second */
export const MomentFromNow = React.createClass({
    mixins: [ReactMeteorData],
    propTypes: {
        time: React.PropTypes.instanceOf(Date).isRequired
    },
    getMeteorData() {
        //ensure this thing reruns every minute
        Session.get('minuteUpdater');
        var timeFromNow = moment(this.props.time).fromNow();
        return {
            time: timeFromNow
        }
    },
    render() {
        return <span>{this.data.time}</span>;
    }
});

