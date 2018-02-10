import React, { Component } from "react";
import PropTypes from "prop-types";
import Meteor from "react-native-meteor";

import { profilePicture, displayName } from "../../helpers";

import {
  View,
  Card,
  CardItem,
  Left,
  Thumbnail,
  Body,
  Text,
  Right,
  Icon,
  Spinner,
  Input
} from "native-base";

class ChooseCategory extends Component {
  static propTypes = {
    gameId: PropTypes.string.isRequired
  }

  state = {
    loading: true,
    customCategory: "",
    categories: []
  }

  componentWillMount() {
    Meteor.call('getRandomCategories', 4, (err, res) => {
      if (err) {
          console.log("error getting categories", err);
          this.setState({ loading: false });
          return;
      }
      
      this.setState({ categories: res, loading: false });
    });
  }

  pickCategory = (category) => {
    this.setState({ loading: true });
    Meteor.call('acrofeverChooseCategory', this.props.gameId, category, (err) => {
        if (err) {
            console.log("error choosing category", err);
        }
    });
  }

  render() {
    return (
      <Card>
        <CardItem header>
          <Text>Pick a category</Text>
        </CardItem>
        {this.state.loading ? (
          <CardItem>
            <Body>
              <Spinner />
            </Body>
          </CardItem>
        ) : this.state.categories.map(c => (
          <CardItem key={c._id} button onPress={() => this.pickCategory(c.category)}>
            <Body><Text>{c.category}</Text></Body>
            <Right>
              <Icon name="arrow-forward" />
            </Right>
          </CardItem>
        ))}
        <CardItem>
          <Icon name="create" />
          <Input 
            placeholder="Write a custom category"
            value={this.state.customCategory} 
            onChangeText={customCategory => this.setState({ customCategory })}
            onSubmitEditing={() => this.pickCategory(this.state.customCategory)}
          />
        </CardItem>
      </Card>
    );
  }
}

class GameCategoryPhase extends Component {
  static propTypes = {
    currentRound: PropTypes.object.isRequired,
    gameId: PropTypes.string.isRequired,
    userId: PropTypes.string.isRequired,
    categoryChooserUser: PropTypes.object,
    hideAcroInCategoryPhase: PropTypes.bool
  };

  static defaultProps = {
    categoryChooserUser: null,
    hideAcroInCategoryPhase: false
  }

  render() {
    const isCategoryCooser = this.props.userId === this.props.categoryChooserUser._id;

    return (
      <View style={{ padding: 10 }}>
        <Card>
          <CardItem >
            <Left>
              <Thumbnail source={{ uri: profilePicture(this.props.categoryChooserUser, 100) }} />
              <Body>
                <Text>{displayName(this.props.categoryChooserUser)}</Text>
                <Text note>is picking a category</Text>
              </Body>
            </Left>
          </CardItem>
        </Card>
        {isCategoryCooser && (
          <ChooseCategory gameId={this.props.gameId} />
        )}
      </View>
    )
  }
}

export default GameCategoryPhase;
