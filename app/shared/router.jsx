/* REACT ROUTES */

import React from 'react';
import {mount} from 'react-mounter';

import {Layout} from '../imports/views/Layout';
import {HomeView} from '../imports/views/Home';
import {PlayView} from '../imports/views/Play';
import {LobbyView} from '../imports/views/Lobby';
import {HallOfFameView} from '../imports/views/HallOfFame';
import {PageNotFound} from '../imports/views/PageNotFound';
import {AdminMain, AdminHome, AdminHallOfFame, AdminNags, AdminEvents} from '../imports/views/Admin';

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

const adminRoutes = FlowRouter.group({
    prefix: '/admin',
    name: 'admin',
    triggersEnter: [AccountsTemplates.ensureSignedIn]
});

adminRoutes.route('/', {
    name: 'adminHome',
    action: function() {
        const subContent = <AdminHome />;
        mount(Layout, {
            content: () => (<AdminMain subContent={subContent} />)
        });
    }
});

adminRoutes.route('/halloffame', {
    name: 'adminHallOfFame',
    action: function() {
        const subContent = <AdminHallOfFame />;
        mount(Layout, {
            content: () => (<AdminMain subContent={subContent} />)
        });
    }
});

adminRoutes.route('/nags', {
    name: 'adminNags',
    action: function() {
        const subContent = <AdminNags />;
        mount(Layout, {
            content: () => (<AdminMain subContent={subContent} />)
        });
    }
});

adminRoutes.route('/events', {
    name: 'adminEvents',
    action: function() {
        const subContent = <AdminEvents />;
        mount(Layout, {
            content: () => (<AdminMain subContent={subContent} />)
        });
    }
});

AccountsTemplates.configureRoute('changePwd');
AccountsTemplates.configureRoute('forgotPwd');
AccountsTemplates.configureRoute('resetPwd');
AccountsTemplates.configureRoute('signIn');
AccountsTemplates.configureRoute('signUp');
AccountsTemplates.configureRoute('verifyEmail');