const axios = require("axios");

const launchesDatabase = require("./launches.mongo");
const planetDatabase = require("./planets.mongo");

const DEFAULT_FLIGHT_NUMBER = 100;
// const launch = {
//   flightNumber: 100, //flight_number
//   mission: "Kepler Exploration X", //name
//   rocket: "Explorer IS1", //rocket.name
//   launchDate: new Date("December 27, 2030"), //date local
//   target: "Kepler-442 b", //not applicable
//   customers: ["ZTM", "NASA"], //payloads.customers for each payload
//   upcoming: true, //upcoming
//   success: true, //success
// };
// saveLaunch(launch);

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function populateLaunches() {
  console.log("Downloading launch data...");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      select: {
        success: 1,
        payloads: 1,
        launchpad: 1,
        flight_number: 1,
        name: 1,
        date_local: 1,
        upcoming: 1,
      },
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });

  if (response.status !== 200) {
    console.log("Problem downloading launch data");
    throw new Error("Launch data download failed");
  }

  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: new Date(launchDoc["date_local"]),
      target: launchDoc["target"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers: customers,
    };

    //console.log(`${launch.flightNumber} ${launch.mission}`);
    await saveLaunch(launch);
  }
}

async function loadLaunchData() {
  const firstLaunch = await findlaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (firstLaunch) {
    console.log("Launch data already loaded!");
  } else {
    await populateLaunches();
  }
}

async function findlaunch(filter) {
  return await launchesDatabase.findOne(filter);
}

async function existsLaunchWithId(launchId) {
  return await findlaunch({
    flightNumber: launchId,
  });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launchesDatabase.findOne().sort("-flightNumber");
  if (!latestLaunch) {
    return DEFAULT_FLIGHT_NUMBER;
  }
  return latestLaunch.flightNumber;
}

async function getAllLaunches(skip, limit) {
  return await launchesDatabase
    .find({}, { _id: 0, __v: 0 })
    .sort({ flightNumber: 1 })
    .skip(skip)
    .limit(limit);
}

async function saveLaunch(launch) {
  await launchesDatabase.findOneAndUpdate(
    //findOneAndUpdate(filter, update, options)
    { flightNumber: launch.flightNumber },
    launch,
    { upsert: true },
  );
}

async function scheduleNewLaunch(launch) {
  const planet = await planetDatabase.findOne({
    keplerName: launch.target,
  });
  if (!planet) {
    throw new Error("No matching planet found");
  }

  const newFlightNumber = (await getLatestFlightNumber()) + 1;

  const newLaunch = Object.assign(launch, {
    upcoming: true,
    success: true,
    customers: ["ZTM", "NASA"],
    flightNumber: newFlightNumber,
  });
  await saveLaunch(newLaunch);
}

async function abortLaunchById(launchId) {
  //aborted holds the result of the update operation, which includes information about how many documents were matched and modified.
  //example of aborted: { acknowledged: true, matchedCount: 1, modifiedCount: 1 }
  const aborted = await launchesDatabase.updateOne(
    { flightNumber: launchId },
    { upcoming: false, success: false },
  );
  return aborted.matchedCount === 1; //since we alredy changed the value so modifiedCount is not important//basic=>matched ===1 && modified === 1=>both 1 and 1 => 1 true
  //here matched means only one launch =>1 === 1 =>means return true .
}

module.exports = {
  loadLaunchData,
  existsLaunchWithId,
  getAllLaunches,
  scheduleNewLaunch,
  abortLaunchById,
};
