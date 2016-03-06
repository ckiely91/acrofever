class FooterComponent extends React.Component {
    componentDidMount() {
        //weird privacy policy thing
        (function (w,d) {var loader = function () {var s = d.createElement("script"), tag = d.getElementsByTagName("script")[0]; s.src = "//cdn.iubenda.com/iubenda.js"; tag.parentNode.insertBefore(s,tag);}; if(w.addEventListener){w.addEventListener("load", loader, false);}else if(w.attachEvent){w.attachEvent("onload", loader);}else{w.onload = loader;}})(window, document);
    }

    render() {
        return (
            <div>
                <div className="ui hidden divider"></div>
                <a href="https://play.google.com/store/apps/details?id=com.acrofever.android&utm_source=acrofever.com&utm_medium=referral&utm_campaign=footerbadge" target="_blank"><img width="100" alt="Get it on Google Play" src="https://play.google.com/intl/en_us/badges/images/apps/en-play-badge.png" /></a>
                <p className="footer">&copy; Christian Kiely {moment().format('YYYY')} | Version {appVersion} | Last updated {appLastUpdated} | <a href="//www.iubenda.com/privacy-policy/7785507" className="iubenda-white iubenda-embed" title="Privacy Policy">Privacy Policy</a></p>
                <div className="ui hidden divider"></div>
            </div>
        )
    }
}

Template.registerHelper('FooterComponent', () => FooterComponent);