import { Constants } from "expo";

const ENV = {
  dev: {
    env: "dev",
    protocol: "http",
    host: "192.168.0.16:3000",
    timesyncEnabled: true,
    adMobBannerIdAndroid: "ca-app-pub-3940256099942544/6300978111",
    adMobBannerIdIOS: "ca-app-pub-3940256099942544/2934735716",
    adMobInterstitialIDAndroid: "ca-app-pub-3940256099942544/1033173712",
    adMobInterstitialIDIOS: "ca-app-pub-3940256099942544/4411468910"
  },
  beta: {
    env: "beta",
    protocol: "https",
    host: "acrofever.com",
    timesyncEnabled: true,
    adMobBannerIdAndroid: "ca-app-pub-2611027061957213/5527254088",
    adMobBannerIdIOS: "ca-app-pub-2611027061957213/5508500915",
    adMobInterstitialIDAndroid: "ca-app-pub-2611027061957213/9957453687",
    adMobInterstitialIDIOS: "ca-app-pub-2611027061957213/9216645788"
  }
};

function getEnvVars(env = "") {
  if (
    env === null ||
    env === undefined ||
    env === "" ||
    env.indexOf("dev") !== -1
  )
    return ENV.dev;
  if (env.indexOf("beta") !== -1) return ENV.beta;
  return ENV.dev;
}

export default getEnvVars(Constants.manifest.releaseChannel);
