const dns = require("dns");
dns.setServers(['1.1.1.1', '1.0.0.1']);



const mongoose = require("mongoose");
//ts5Q6E3oGDhwNS5a

const MONGO_URL = process.env.MONGO_URI;


mongoose.connection.once("open", () => {
  console.log("MongoDB connection ready!");
});

mongoose.connection.on("error", (err) => {
  console.error(err);
}); 

async function mongoConnect() {
  await mongoose.connect(MONGO_URL);
}

function mongoDisconnect() {
  return mongoose.disconnect();
}

module.exports = {
  mongoConnect,
  mongoDisconnect
};