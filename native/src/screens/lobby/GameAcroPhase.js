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

import { lobbyGameStyles as styles } from "./styles";

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
      this.setState({ loading: false, editMode: false });
    });
  }

  setEditMode = () => {
    this.setState({ editMode: true });
    setTimeout(() => {
      if (this.textInput) {
        this.textInput._root.focus();
      }
    }, 100);
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
          <Item>
            <Icon name="create" />
            <Input
              style={styles.text}
              disabled={this.state.loading}
              placeholder="Write your acro"
              value={this.state.writtenAcro}
              onChangeText={writtenAcro => this.setState({ writtenAcro })}
              onSubmitEditing={this.submitAcro}
              ref={ref => (this.textInput = ref)}
            />
          </Item>
        ) : (
          <Item>
            <Body><Text style={styles.multilineText}>{this.props.submittedAcro}</Text></Body>
            <Right>
              <Button transparent onPress={this.setEditMode}><Icon name="create" /></Button>
            </Right>
          </Item>
        )}
        <Text style={styles.acroInfoText}>
          Some text will be placed here to explain how to write a great acro.
          Please review this text and update it to be better.
        </Text>
      </View>
    );
  }
}

export default GameAcroPhase;
