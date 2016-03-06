import React from 'react';

import {NagsComponent} from '../components/Nags';
import {FooterComponent} from '../components/Footer';
import {HowToPlayModal, PageDimmer, NotificationInfoModal} from '../components/Modals';
import {ProfileModal} from '../components/Profile';

import {headerMeta, headerLinks} from '../statics';

export class Layout extends React.Component {
    componentWillMount() {
        DocHead.setTitle('Acrofever');

        headerMeta.map((item) => DocHead.addMeta(item));
        headerLinks.map((item) => DocHead.addLink(item));
    }

    componentDidMount() {
        //general helper functions, jquery stuff available on all pages goes here
        $.fn.isOnScreen = function(){
            //jQuery function to check if an element is in the viewport
            var win = $(window);

            var viewport = {
                top : win.scrollTop(),
                left : win.scrollLeft()
            };
            viewport.right = viewport.left + win.width();
            viewport.bottom = viewport.top + win.height();

            var bounds = this.offset();
            bounds.right = bounds.left + this.outerWidth();
            bounds.bottom = bounds.top + this.outerHeight();

            return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));

        };
    }


    notificationsSupported() {
        return (typeof Notification !== 'undefined');
    }

    render() {
        return (
            <div>
                <BlazeToReact blazeTemplate="nav" />
                <div className="ui main container">
                    <NagsComponent />
                    {_.isFunction(this.props.content) ? this.props.content() : this.props.content}
                    <FooterComponent />
                </div>
                <HowToPlayModal />
                <PageDimmer />
                <ProfileModal />
                {this.notificationsSupported() ? <NotificationInfoModal /> : null}
            </div>
        );
    }
}

Layout.propTypes = {
    content: React.PropTypes.any.isRequired
};