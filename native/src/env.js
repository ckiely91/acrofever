import { Constants } from "expo";

const ENV = {
  dev: {
    protocol: "http",
    host: "192.168.0.16:3000",
    timesyncEnabled: true
  },
  beta: {
    protocol: "https",
    host: "acrofever.com",
    timesyncEnabled: true
  }
}

function getEnvVars(env = '') {
  if (env === null || env === undefined || env === '' || env.indexOf('dev') !== -1) return ENV.dev;
  if (env.indexOf('beta') !== -1) return ENV.beta;
  return ENV.dev;
}

export default getEnvVars(Constants.manifest.releaseChannel);
