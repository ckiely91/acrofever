import React, { Component } from "react";
import {
  Container,
  Content,
  List,
  ListItem,
  Left,
  Text
} from "native-base";

import styles from "./styles";

const listData = [
  {
    name: "Home"
  },
  {
    name: "Other"
  }
];

class SideBar extends Component {
  render() {
    return (
      <Container>
        <Content
          bounces={false}
          style={{ flex: 1, backgroundColor: "#fff", top: -1 }}
        >
          <List 
            dataArray={listData} 
            renderRow={data => (
              <ListItem>
                <Left>
                  <Text style={styles.text}>{data.name}</Text>
                </Left>
              </ListItem>
            )}
          />
        </Content>
      </Container>
    );
  }
}

export default SideBar;
