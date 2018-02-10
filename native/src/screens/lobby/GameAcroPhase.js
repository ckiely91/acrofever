import React, { Component } from "react";
import PropTypes from "prop-types";
import Meteor from "react-native-meteor";

import {
  View,
  Text,
  Icon,
  Input,
  Item,
  Button,
  Body,
  Right
} from "native-base";

class GameAcroPhase extends Component {
  static propTypes = {
    gameId: PropTypes.string.isRequired,
    currentUserIsInRound: PropTypes.bool.isRequired,
    submittedAcro: PropTypes.string
  }

  static defaultProps = {
    submittedAcro: null
  };

  constructor(props) {
    super(props);

    this.state = {
      writtenAcro: props.submittedAcro || "",
      editMode: !props.submittedAcro,
      loading: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.submittedAcro !== this.props.submittedAcro) {
      this.setState({ editMode: false, loading: false, writtenAcro: nextProps.submittedAcro });
    }
  }

  submitAcro = () => {
    this.setState({ loading: true });

    Meteor.call('acrofeverSubmitAcro', this.props.gameId, this.state.writtenAcro, (err) => {
      if (err) {
        console.log("error submitting acro", err);
      }
   });
  }

  render() {
    if (!this.props.currentUserIsInRound) {
      return (
        <View style={{ padding: 10 }}>
          <Text>Players are submitting their acros...</Text>
        </View>
      );
    }

    return (
      <View style={{ padding: 10 }}>
        {this.state.editMode ? (
          <Item disabled>
            <Icon name="create" />
            <Input 
              regular
              disabled={this.state.loading}
              placeholder="Write your acro"
              value={this.state.writtenAcro}
              onChangeText={writtenAcro => this.setState({ writtenAcro })}
              onSubmitEditing={this.submitAcro}
            />
          </Item>
        ) : (
          <Item>
            <Body><Text>{this.props.submittedAcro}</Text></Body>
            <Right>
              <Button transparent onPress={() => this.setState({ editMode: true })}><Icon name="create" /></Button>
            </Right>
          </Item>
        )}
      </View>
    );
  }
}

export default GameAcroPhase;
