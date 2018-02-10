import React from "react";
import { Root } from "native-base";
import { StackNavigator, DrawerNavigator } from "react-navigation";

import Home from "./screens/home";
import LobbyList from "./screens/lobbylist";
import Lobby from "./screens/lobby";
import Other from "./screens/other";
import SideBar from "./screens/sidebar";

const Drawer = DrawerNavigator(
  {
    Home: { screen: Home },
    LobbyList: { screen: LobbyList },
    Other: { screen: Other }
  },
  {
    initialRouteName: "Home",
    contentOptions: {
      activeTintColor: "#e91e63"
    },
    contentComponent: props => <SideBar {...props} />
  }
);

const AppNavigator = StackNavigator(
  {
    Drawer: { screen: Drawer },
    Lobby: { screen: Lobby },
  },
  {
    initialRouteName: "Drawer",
    headerMode: "none"
  }
);

const App = () => (
  <Root>
    <AppNavigator />
  </Root>
);

export default App;
