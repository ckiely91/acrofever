countdownHeader = React.createClass({
    propTypes: {
        endTime: React.PropTypes.instanceOf(Date).isRequired,
        header: React.PropTypes.string.isRequired,
        subheader: React.PropTypes.string
    },
    countdown(endTime) {
        return countdown(endTime);
    },
    render() {
        return (
            <div className="ui stackable grid">
                <div className="four wide column">
                    <h3 className="ui center aligned icon header">
                        <i className="clock icon"></i>
                        {this.countdown(this.props.endTime)}
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

Template.registerHelper('countdownHeader', () => {
    return countdownHeader;
});