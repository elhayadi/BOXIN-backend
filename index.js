require("dotenv").config();
const mongoose = require("mongoose");
const auth = require("./routes/auth");
const users = require("./routes/users");
const account = require("./routes/account");
const service = require("./routes/service");
const post = require("./routes/post");
const storie = require("./routes/storie");
const bodyParser = require("body-parser");
const express = require("express");
var cors = require("cors");
const { append } = require("express/lib/response");
const app = express();
const { API_PORT, MONGO_URI, jwtPrivateKey } = process.env;
if (!jwtPrivateKey) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}
mongoose  
  .connect("mongodb+srv://boxin:461649B972@boxin.ck3do.mongodb.net/boxin")
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb", extended: true }));
app.use(cors());

app.get("/", async (req, res) => {
  res.send("welcome");
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
