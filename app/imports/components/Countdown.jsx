import React from 'react';

const getDiff = (endTime) => {
    return Math.max(0, moment(endTime).diff(TimeSync.now()));
}

export class CountdownSpan extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            diff: getDiff(props.endTime)
        };
    }

    componentWillMount() {
        this.interval = setInterval(() => {
            this.setState({ diff: getDiff(this.props.endTime) })
        }, 500);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return <span>{moment(this.state.diff).format('m:ss')}</span>;
    }
}

export class CountdownIconHeader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            diff: getDiff(props.endTime),
            isPulsing: false
        };
    }

    componentWillMount() {
        this.interval = setInterval(() => {
            const diff = getDiff(this.props.endTime);
            const isPulsing = diff <= 50000;
            this.setState({ 
                diff,
                isPulsing
            });
        }, 500);
    }

    componentDidUpdate(prevProps, prevState) {
        if (!prevState.isPulsing && this.state.isPulsing && this.mainElement) {
            const $main = $(this.mainElement);
            $main.animate({
                color: '#dc3522'
            }, 7000);

            $main.find('i').transition('set looping').transition('pulse', '1s');
        }
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return (
            <h3 className="ui center aligned icon header" ref={(ref) => this.mainElement = ref}>
                <i className="clock icon"></i>
                {moment(this.state.diff).format('m:ss')}
            </h3>
        );
    }
}

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

