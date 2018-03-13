import Sentry from "sentry-expo";

const delay = 1000;
let timesyncUrl;
let timesyncInterval;
let offset = 0;

const wait = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
}

const syncOffset = async () => {
  const results = [];

  for (let i = 0; i < 5; i++) {
    const sleep = wait(delay);
    let start = Date.now();
    try {
      const res = await fetch(timesyncUrl, {
        method: "POST",
        body: JSON.stringify({ jsonrpc: "2.0", id: start, method: "timesync" })
      });
      const end = Date.now();
      const json = await res.json();
      const timestamp = json.result;
      const roundtrip = start - end;
      const thisOffset = timestamp - end + roundtrip / 2;

      if (offset === 0) {
        // Apply first offset immediately
        offset = thisOffset;
      }

      results.push({ roundtrip, offset: thisOffset });
    } catch(e) {
      console.log(e);
      Sentry.captureException(new Error("error fetching time: " + e.message));
    }

    await sleep;
  }

  // calculate the limit for outliers
  const roundtrips = results.map(result => result.roundtrip);
  const limit = median(roundtrips) + std(roundtrips);

  // filter all results which have a roundtrip smaller than the mean+std
  const filtered = results.filter(result => result.roundtrip < limit);
  var offsets = filtered.map(result => result.offset);

  // Now if we have any offsets left, set the main offset to that.
  if (offsets.length > 0) {
    offset = mean(offsets);
    console.log("set offset to", offset);
  }
}

export const now = () => {
  return Date.now() + offset;
};

export const startTimesync = (url, interval, enabled) => {
  timesyncUrl = url;
  if (enabled) {
    timesyncInterval = setInterval(syncOffset, interval);
  }
};

export const stopTimesync = () => {
  clearInterval(timesyncInterval);
}

// basic statistical functions
function compare(a, b) {
  return a > b ? 1 : a < b ? -1 : 0;
}

function add(a, b) {
  return a + b;
}

function sum(arr) {
  return arr.reduce(add);
}

function mean(arr) {
  return sum(arr) / arr.length;
}

function std(arr) {
  return Math.sqrt(variance(arr));
}

function variance(arr) {
  if (arr.length < 2) return 0;

  var _mean = mean(arr);
  return arr
          .map(x => Math.pow(x - _mean, 2))
          .reduce(add) / (arr.length - 1);
}

function median(arr) {
  if (arr.length < 2) return arr[0];

  var sorted = arr.slice().sort(compare);
  if (sorted.length % 2 === 0) {
    // even
    return (sorted[arr.length / 2 - 1] + sorted[arr.length / 2]) / 2;
  }
  else {
    // odd
    return sorted[(arr.length - 1) / 2];
  }
}