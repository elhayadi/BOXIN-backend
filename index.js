require("dotenv").config();
const Storie = require("./models/storie");
const auth = require("./routes/auth");
const users = require("./routes/users");
const account = require("./routes/account");
const service = require("./routes/service");
const post = require("./routes/post");
const storie = require("./routes/storie");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const express = require("express");
const cors = require("cors");

const app = express();
const { API_PORT, MONGO_URI, jwtPrivateKey } = process.env;
if (!jwtPrivateKey) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require("./models");
(async () => {
  try {
    await db.sequelize.authenticate();
    // await db.sequelize.sync();
    //  initial(); // Just use it in development, at the first time execution!. Delete it in production
  } catch (error) {
    console.log(error);
  }
})();

// Just use it in development, at the first time execution!. Delete it in production
function initial() {
  // `displayName`, `about`, `isPublic`) VALUES ("general","une diffusion générale de la part d'administration",true
  db.service.create({
    displayName: "general",
    about: "une diffusion générale de la part d'administration",
    isPublic: true,
  });
}
var task = cron.schedule("* * 2 * * *", async () => {
  var stories = await Storie.find({ status: true });
  var toUpdate = [];
  const now = new Date(Date.now());
  try {
    stories.forEach((str) => {
      switch (str.due) {
        case "day":
          let day = new Date(str.createdAt);
          day.setDate(day.getDate() + 1);
          console.log(day);
          console.log(now);
          if (day.getTime() <= now.getTime()) {
            toUpdate.push(str._id);
          }
          break;
        case "week":
          let week = new Date(str.createdAt);
          week.setDate(week.getDate() + 7);
          if (week.getTime() <= now.getTime()) {
            toUpdate.push(str._id);
          }
          break;
        case "month":
          let month = new Date(str.createdAt);
          month.setDate(month.getDate() + 30);
          if (month.getTime() <= now.getTime()) {
            toUpdate.push(str._id);
          }
          break;

        default:
          toUpdate.push(str._id);
          break;
      }
    });
  } catch (error) {
    console.log(error);
  }
  const updatedstories = await Storie.updateMany(
    { _id: { $in: toUpdate } },
    { $set: { status: false } }
  );
  console.log("cron executed:" + now);
});

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/account", account);
app.use("/api/service", service);
app.use("/api/post", post);
app.use("/api/storie", storie);
let port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on PORT ${port}...`));
task.start();
