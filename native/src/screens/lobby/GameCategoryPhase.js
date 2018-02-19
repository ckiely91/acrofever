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
  Input,
  List,
  ListItem,
  CheckBox,
  Item
} from "native-base";

import { lobbyGameStyles as styles } from "./styles";
import { colors } from "../../styles/base";

class ChooseCategory extends Component {
  static propTypes = {
    gameId: PropTypes.string.isRequired
  }

  state = {
    loading: true,
    customCategory: "",
    selectedCategory: null,
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
    this.setState({ loading: true, selectedCategory: category });
    Meteor.call('acrofeverChooseCategory', this.props.gameId, category, (err) => {
        if (err) {
            console.log("error choosing category", err);
        }
    });
  }

  render() {
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={styles.phaseHeader}>Pick a category</Text>
        {this.state.loading ? (
          <Spinner color={colors.grey} />
        ) : (
          <View>
            <Item style={{ marginBottom: 10, paddingLeft: 10 }}>
              <Icon name="create" />
              <Input
                style={styles.text}
                placeholder="Write a custom category"
                value={this.state.customCategory} 
                onChangeText={customCategory => this.setState({ customCategory })}
                onSubmitEditing={() => this.pickCategory(this.state.customCategory)}
              />
            </Item>
            <List>
              {this.state.categories.map(c => (
                <ListItem key={c._id} onPress={() => this.pickCategory(c.category)}>
                  <CheckBox checked={c.category === this.state.selectedCategory} color={colors.red} />
                  <Body>
                    <Text style={styles.text}>{c.category}</Text>
                  </Body>
                </ListItem>
              ))}
            </List>
          </View>
        )}
      </View>
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
    const isCategoryChooser = this.props.userId === this.props.categoryChooserUser._id;

    return (
      <View>
        <List>
          <ListItem style={styles.listItem}>
            <Left style={{ flex: 0 }}>
              <Thumbnail small source={{ uri: profilePicture(this.props.categoryChooserUser, 100) }} />
            </Left>
            <Body>
              <Text style={styles.text}>{displayName(this.props.categoryChooserUser)}</Text>
              <Text style={styles.italicText}>{isCategoryChooser ? "You're picking the category!" : "is picking a category..."}</Text>
            </Body>
          </ListItem>
        </List>
        {isCategoryChooser && (
          <ChooseCategory gameId={this.props.gameId} />
        )}
      </View>
    )
  }
}

export default GameCategoryPhase;
