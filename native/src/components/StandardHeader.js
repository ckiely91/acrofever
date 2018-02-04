import React from "react";
import {
  Header,
  Title,
  Button,
  Icon,
  Left,
  Right,
  Body
} from "native-base";

const StandardHeader = ({ navigation, title, rightContent }) => (
  <Header>
    <Left>
      <Button
        transparent
        onPress={() => navigation.navigate("DrawerOpen")}
      >
        <Icon name="ios-menu" />
      </Button>
    </Left>
    <Body>
      <Title>{title}</Title>
    </Body>
    <Right>{rightContent}</Right>
  </Header>
);

export default StandardHeader;
