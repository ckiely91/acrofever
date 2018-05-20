import PropTypes from "prop-types";
import React, { PureComponent } from "react";

const getDiff = endTime => {
  return Math.max(0, moment(endTime).diff(TimeSync.now()));
};

export class CountdownSpan extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      diff: getDiff(props.endTime)
    };
  }

  componentWillMount() {
    this.interval = setInterval(() => {
      this.setState({ diff: getDiff(this.props.endTime) });
    }, 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return <span>{moment(this.state.diff).format("m:ss")}</span>;
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
      const isPulsing = diff <= 10000;
      this.setState({
        diff,
        isPulsing
      });
    }, 500);
  }

  componentDidUpdate(prevProps, prevState) {
    if (!prevState.isPulsing && this.state.isPulsing && this.mainElement) {
      const $main = $(this.mainElement);
      $main.animate(
        {
          color: "#dc3522"
        },
        7000
      );

      $main
        .find("i")
        .transition("set looping")
        .transition("pulse", "1s");
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return (
      <h3
        className="ui center aligned icon header"
        ref={ref => (this.mainElement = ref)}
      >
        <i className="clock icon" />
        {moment(this.state.diff).format("m:ss")}
      </h3>
    );
  }
}

export const CountdownHeader = ({ endTime, header, subheader }) => (
  <div className="ui stackable grid">
    <div className="four wide column">
      <CountdownIconHeader endTime={endTime} />
    </div>
    <div className="twelve wide column">
      <h1 className="ui center aligned header phaseHeader">{header}</h1>
      <h3 className="ui center aligned header">{subheader}</h3>
    </div>
  </div>
);

CountdownHeader.propTypes = {
  endTime: PropTypes.instanceOf(Date).isRequired,
  header: PropTypes.string.isRequired,
  subheader: PropTypes.string
};

export class MomentFromNow extends PureComponent {
  static propTypes = {
    time: PropTypes.instanceOf(Date)
  };

  componentWillMount() {
    this.interval = setInterval(
      () => this.setState({ time: Date.now() }),
      60000
    );
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    return <span>{moment(this.props.time).fromNow()}</span>;
  }
}
