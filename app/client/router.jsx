/* REACT ROUTES */

import React from 'react';
import {mount} from 'react-mounter';

import {Layout} from '../imports/views/Layout';
import {HomeView} from '../imports/views/Home';
import {PlayView} from '../imports/views/Play';
import {LobbyView} from '../imports/views/Lobby';
import {HallOfFameView} from '../imports/views/HallOfFame';
import {PageNotFound} from '../imports/views/PageNotFound';

FlowRouter.route('/', {
    name: 'home',
    action: function() {
        mount(Layout, {
            content: () => (<HomeView />)
        });
    }
});

const lobbyRoutes = FlowRouter.group({
    prefix: '/play',
    name: 'lobbies'
});

lobbyRoutes.route('/', {
    name: 'play',
    action: function() {
        mount(Layout, {
            content: () => (<PlayView />)
        });
    }
});

lobbyRoutes.route('/:lobbyId', {
    name: 'lobby',
    triggersEnter: [AccountsTemplates.ensureSignedIn],
    action: function() {
        mount(Layout, {
            content: () => (<LobbyView />)
        });
    }
});

FlowRouter.route('/halloffame', {
    name: 'halloffame',
    action: function() {
        mount(Layout, {
            content: () => (<HallOfFameView />)
        });
    }
});

FlowRouter.notFound = {
    action: function() {
        mount(Layout, {
            content: () => (<PageNotFound />)
        });
    }
};

/* BLAZE ROUTES */

const blogRoutes = FlowRouter.group({
    prefix: '/blog',
    name: 'blog'
});

blogRoutes.route('/', {
    name: 'blogIndex',
    action: function() {
        mount(Layout, {
            content: () => (<BlazeToReact blazeTemplate="blogList" />)
        });
    }
});

blogRoutes.route('/:slug', {
    name: 'blogShow',
    action: function() {
        mount(Layout, {
            content: () => (<BlazeToReact blazeTemplate="blogPost" />)
        });
    }
});

blogRoutes.route('/tag/:tag', {
    name: 'blogTagged',
    action: function() {
        mount(Layout, {
            content: () => (<BlazeToReact blazeTemplate="blogTagged" />)
        });
    }
});

const adminRoutes = FlowRouter.group({
    prefix: '/admin',
    name: 'admin',
    triggersEnter: [AccountsTemplates.ensureSignedIn]
});

adminRoutes.route('/', {
    name: 'adminHome',
    action: function() {
        mount(Layout, {
            content: () => (<BlazeToReact blazeTemplate="adminMain" subTemplate="adminHome" />)
        });
    }
});

adminRoutes.route('/halloffame', {
    name: 'adminHallOfFame',
    action: function() {
        mount(Layout, {
            content: () => (<BlazeToReact blazeTemplate="adminMain" subTemplate="adminHallOfFame" />)
        });
    }
});

adminRoutes.route('/nags', {
    name: 'adminNags',
    action: function() {
        mount(Layout, {
            content: () => (<BlazeToReact blazeTemplate="adminMain" subTemplate="adminNags" />)
        });
    }
});

adminRoutes.route('/blog', {
    name: 'adminBlog',
    action: function() {
        mount(Layout, {
            content: () => (<BlazeToReact blazeTemplate="adminMain" subTemplate="blogAdmin" />)
        });
    }
});

adminRoutes.route('/blog/edit/:id', {
    name: 'adminBlogEdit',
    action: function() {
        mount(Layout, {
            content: () => (<BlazeToReact blazeTemplate="adminMain" subTemplate="blogAdminEdit" />)
        });
    }
});

AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');