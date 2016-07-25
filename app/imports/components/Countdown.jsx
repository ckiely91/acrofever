import React from 'react';

export const CountdownSpan = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        const now = TimeSync.serverTime(null, 500) || mo.now.get();
        let diff = moment(this.props.endTime).diff(now);
        if (diff < 0) diff = 0;

        return { diff };
    },
    propTypes: {
        endTime: React.PropTypes.instanceOf(Date).isRequired
    },
    countdown(diff) {
        return moment(diff).format('m:ss');
    },
    render() {
        return <span>{this.countdown(this.data.diff)}</span>;
    }
});

const CountdownIconHeader = React.createClass({
    mixins: [ReactMeteorData],
    getMeteorData() {
        const now = TimeSync.serverTime(null, 500) || mo.now.get();
        let diff = moment(this.props.endTime).diff(now);
        if (diff < 0) diff = 0;

        return { diff };
    },
    propTypes: {
        endTime: React.PropTypes.instanceOf(Date).isRequired
    },
    getInitialState() {
        return {isPulsing: false};
    },
    countdown(diff) {
        return moment(diff).format('m:ss');
    },
    componentDidUpdate() {
        if (this.data.diff <= 10000 && !this.state.isPulsing) {
            this.setState({isPulsing: true});
            this.startPulsing();
        }
    },
    startPulsing() {
        if (this.mainElement) {
            const $main = $(this.mainElement);
            $main.animate({
                color: '#dc3522'
            }, 7000);

            $main.find('i').transition('set looping').transition('pulse', '1s');
        }
    },
    render() {
        return (
            <h3 className="ui center aligned icon header" ref={(ref) => this.mainElement = ref}>
                <i className="clock icon"></i>
                {this.countdown(this.data.diff)}
            </h3>
        );
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
                    <CountdownIconHeader endTime={this.props.endTime} />
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

