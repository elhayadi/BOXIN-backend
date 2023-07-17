require("dotenv").config();
const db = require("./models");
const User = db.user;
const Service = db.service;
const Op = db.Op;
const Storie = db.storie;
const auth = require("./routes/auth");
const users = require("./routes/users");
const account = require("./routes/account");
const service = require("./routes/service");
const post = require("./routes/post");
const chat = require("./routes/chat");
const storie = require("./routes/storie");
const bodyParser = require("body-parser");
const cron = require("node-cron");
const bcrypt = require("bcrypt");
const express = require("express");
const cors = require("cors");

const app = express();
const { API_PORT, MONGO_URI, jwtPrivateKey } = process.env;
if (!jwtPrivateKey) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}

const corsOptions = {
  origin: ['http://localhost:3000','https://boxin.devallapps.com'],
};

app.use(cors(corsOptions));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  next();
});
// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
(async () => {
  try {
    await db.sequelize.authenticate();
  //  await db.sequelize.sync();
   // initial(); // Just use it in development, at the first time execution!. Delete it in production
  } catch (error) {
    console.log(error);
  }
})();

// Just use it in development, at the first time execution!. Delete it in production
const initial = async () => {
  // `displayName`, `about`, `isPublic`) VALUES ("general","une diffusion générale de la part d'administration",true
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash("demo1234", salt);
  db.user.create({
    displayName: "Super Admin",
    email: "demo@box.in",
    role: "admin",
    status: "active",
    password: pwd,
  });
  db.service.create({
    displayName: "general",
    about: "une diffusion générale de la part d'administration",
    isPublic: true,
  });
};
var task = cron.schedule("* * 2 * * *", async () => {
  Storie.findAll({
    where: {
      status: true,
    },
  })
    .then((stories) => {
      if (!stories) return 0;

      var toUpdate = [];
      const now = new Date(Date.now());

      stories.forEach((str) => {
        switch (str.due) {
          case "day":
            let day = new Date(str.created_at);
            day.setDate(day.getDate() + 1);
            console.log(day);
            console.log(now);
            if (day.getTime() <= now.getTime()) {
              toUpdate.push(str._id);
            }
            break;
          case "week":
            let week = new Date(str.created_at);
            week.setDate(week.getDate() + 7);
            if (week.getTime() <= now.getTime()) {
              toUpdate.push(str._id);
            }
            break;
          case "month":
            let month = new Date(str.created_at);
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
      Storie.update(
        {
          status: false,
        },
        {
          where: { _id: toUpdate },
        }
      );
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Internal server error" });
    });

  console.log("cron executed:" + now);
});

app.use("/uploads", express.static("uploads"));
app.use("/api/auth", auth);
app.use("/api/users", users);
app.use("/api/account", account);
app.use("/api/service", service);
app.use("/api/post", post);
app.use("/api/storie", storie);
app.use("/api/chat", chat);
let port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on PORT ${port}...`));
task.start();
