import { Constants } from "expo";

const ENV = {
  dev: {
    protocol: "http",
    host: "localhost:3000",
    timesyncEnabled: true
  },
  beta: {
    protocol: "https",
    host: "acrofever.com",
    timesyncEnabled: false
  }
}

function getEnvVars(env = '') {
  if (env === null || env === undefined || env === '' || env.indexOf('dev') !== -1) return ENV.dev;
  if (env.indexOf('beta') !== -1) return ENV.beta;
  return ENV.dev;
}

export default getEnvVars(Constants.manifest.releaseChannel);
