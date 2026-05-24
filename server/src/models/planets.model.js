const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");
const planetDatabase = require("./planets.mongo");

const KOI_DISPOSITION_CONFIRMED = "CONFIRMED";
const KOI_INSOL_MIN = 0.36;
const KOI_INSOL_MAX = 1.11;
const KOI_PRAD_MAX = 1.6;

function isHabitablePlanet(planet) {
  return (
    planet["koi_disposition"] === KOI_DISPOSITION_CONFIRMED &&
    planet["koi_insol"] > KOI_INSOL_MIN &&
    planet["koi_insol"] < KOI_INSOL_MAX &&
    planet["koi_prad"] < KOI_PRAD_MAX
  );
}

const filePath = path.join(__dirname, "../../data/kepler_data.csv");

function loadPlanetsData() {
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)

      .pipe(parse({ comment: "#", columns: true }))
      .on("data", async (data) => {
        if (isHabitablePlanet(data)) {
          try {
            await savePlanet(data);
          } catch (error) {
            reject(error);
          }
        }
      })
      .on("error", (err) => reject(err))

      .on("end", async () => {
        try {
          const countPlanetsFound = (await getAllPlanets()).length;
          console.log(`${countPlanetsFound} habitable planets found!`);

          resolve();
        } catch (err) {
          console.error(err);
        }
      });
  });
}

async function savePlanet(data) {
//updateOne(filter, update, options)
  await planetDatabase.updateOne(
    { keplerName: data.kepler_name },
    { keplerName: data.kepler_name },
    { upsert: true },
  );
}

async function getAllPlanets() {
  //find(filter, projection)=> filter: query criteria, projection: fields to return __id:1 it will show
  return planetDatabase.find({}, { _id: 0, __v: 0 });
}

module.exports = {
  loadPlanetsData,
  getAllPlanets,
};
