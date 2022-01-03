require("dotenv").config();
const mongoose = require("mongoose");
const auth = require("./routes/auth");
const users = require("./routes/users");
const express = require("express");
var cors = require("cors");
const { append } = require("express/lib/response");
const app = express();
const { API_PORT, MONGO_URI, jwtPrivateKey } = process.env;
if (!jwtPrivateKey || !API_PORT || !MONGO_URI) {
  console.error("FATAL ERROR: jwtPrivateKey is not defined.");
  process.exit(1);
}
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB..."))
  .catch((err) => console.error("Could not connect to MongoDB..."));

app.use(express.json());
app.use(cors());
app.get("/", async (req, res) => {
  res.send("welcome");
});
app.use("/api/auth", auth);
app.use("/api/users", users);

app.listen(API_PORT, () => console.log(`Listening on PORT ${API_PORT}...`));
