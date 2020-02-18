/* REACT ROUTES */

import React from "react";
import { mount } from "react-mounter";

import Layout from "../imports/views/Layout";
import { HomeView } from "../imports/views/Home";
import { PlayViewContainer } from "../imports/views/Play";
import { LobbyViewContainer } from "../imports/views/Lobby";
import { HallOfFameView } from "../imports/views/HallOfFame";
import { LeaderboardViewContainer } from "../imports/views/Leaderboard";
import { ProfileViewContainer } from "../imports/views/Profile";
import { FriendsViewContainer } from "../imports/views/Friends";
import { PageNotFound } from "../imports/views/PageNotFound";
import {
  LoginContainer,
  SignupContainer,
  ForgotPassword,
  ValidateEmail,
  ResetPassword,
  ChangePassword
} from "../imports/views/Accounts";
import {
  AdminMain,
  AdminHome,
  AdminHallOfFameContainer,
  AdminNagsContainer,
  AdminEventsContainer,
  AdminCategoriesContainer
} from "../imports/views/Admin";
import { ModeratorMain } from "../imports/views/Moderators";

const ensureSignedIn = (context, redirect) => {
  if (!Meteor.userId()) {
    redirect("/sign-in");
  }
};

const ensureNotSignedIn = (context, redirect) => {
  if (Meteor.userId()) {
    redirect("/");
  }
};

FlowRouter.route("/", {
  name: "home",
  action: function() {
    mount(Layout, {
      content: () => <HomeView />
    });
  }
});

FlowRouter.route("/sign-in", {
  name: "signin",
  triggersEnter: [ensureNotSignedIn],
  action: function() {
    mount(Layout, {
      content: () => <LoginContainer />
    });
  }
});

FlowRouter.route("/sign-up", {
  name: "signup",
  triggersEnter: [ensureNotSignedIn],
  action: function() {
    mount(Layout, {
      content: () => <SignupContainer />
    });
  }
});

FlowRouter.route("/forgot-password", {
  name: "forgotpassword",
  triggersEnter: [ensureNotSignedIn],
  action: function() {
    mount(Layout, {
      content: () => <ForgotPassword />
    });
  }
});

FlowRouter.route("/reset-password/:token", {
  name: "resetpassword",
  triggersEnter: [ensureNotSignedIn],
  action: function(params) {
    mount(Layout, {
      content: () => <ResetPassword token={params.token} />
    });
  }
});

FlowRouter.route("/change-password", {
  name: "changepassword",
  triggersEnter: [ensureSignedIn],
  action: function() {
    mount(Layout, {
      content: () => <ChangePassword />
    });
  }
});

FlowRouter.route("/verify-email/:token", {
  name: "verifyemail",
  action: function(params) {
    mount(Layout, {
      content: () => <ValidateEmail token={params.token} />
    });
  }
});

const lobbyRoutes = FlowRouter.group({
  prefix: "/play",
  name: "lobbies"
});

lobbyRoutes.route("/", {
  name: "play",
  action: function() {
    mount(Layout, {
      content: () => <PlayViewContainer />
    });
  }
});

lobbyRoutes.route("/:lobbyId", {
  name: "lobby",
  triggersEnter: [ensureSignedIn],
  action: function(params) {
    mount(Layout, {
      content: () => <LobbyViewContainer lobbyId={params.lobbyId} />
    });
  }
});

// FlowRouter.route("/halloffame", {
//   name: "halloffame",
//   action: function() {
//     mount(Layout, {
//       content: () => <HallOfFameView />
//     });
//   }
// });

// FlowRouter.route("/leaderboard", {
//   name: "leaderboard",
//   action: function() {
//     mount(Layout, {
//       content: () => <LeaderboardViewContainer />
//     });
//   }
// });

FlowRouter.route("/profile/:userId", {
  name: "profile",
  action: function(params) {
    mount(Layout, {
      content: () => <ProfileViewContainer userId={params.userId} />
    });
  }
});

FlowRouter.route("/friends", {
  name: "friends",
  triggersEnter: [ensureSignedIn],
  action: function() {
    mount(Layout, {
      content: () => <FriendsViewContainer />
    });
  }
});

FlowRouter.notFound = {
  action: function() {
    mount(Layout, {
      content: () => <PageNotFound />
    });
  }
};

/* BLAZE ROUTES */

const moderatorRoutes = FlowRouter.group({
  prefix: "/moderators",
  name: "moderators",
  triggersEnter: [ensureSignedIn]
});

moderatorRoutes.route("/", {
  name: "moderatorHome",
  action: function() {
    mount(Layout, {
      content: () => <ModeratorMain />
    });
  }
});

moderatorRoutes.route("/categories", {
  name: "moderatorCategories",
  action: function() {
    mount(Layout, {
      content: () => <ModeratorMain subComponentString="categories" />
    });
  }
});

moderatorRoutes.route("/halloffame", {
  name: "moderatorHallOfFame",
  action: function() {
    mount(Layout, {
      content: () => <ModeratorMain subComponentString="halloffame" />
    });
  }
});

const adminRoutes = FlowRouter.group({
  prefix: "/admin",
  name: "admin",
  triggersEnter: [ensureSignedIn]
});

adminRoutes.route("/", {
  name: "adminHome",
  action: function() {
    const subContent = <AdminHome />;
    mount(Layout, {
      content: () => <AdminMain subContent={subContent} />
    });
  }
});

adminRoutes.route("/halloffame", {
  name: "adminHallOfFame",
  action: function() {
    const subContent = <AdminHallOfFameContainer />;
    mount(Layout, {
      content: () => <AdminMain subContent={subContent} />
    });
  }
});

adminRoutes.route("/nags", {
  name: "adminNags",
  action: function() {
    const subContent = <AdminNagsContainer />;
    mount(Layout, {
      content: () => <AdminMain subContent={subContent} />
    });
  }
});

adminRoutes.route("/events", {
  name: "adminEvents",
  action: function() {
    const subContent = <AdminEventsContainer />;
    mount(Layout, {
      content: () => <AdminMain subContent={subContent} />
    });
  }
});

adminRoutes.route("/categories", {
  name: "adminCategories",
  action: function() {
    const subContent = <AdminCategoriesContainer />;
    mount(Layout, {
      content: () => <AdminMain subContent={subContent} />
    });
  }
});
