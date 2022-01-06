require("dotenv").config();
const mongoose = require("mongoose");
const auth = require("./routes/auth");
const users = require("./routes/users");
const account = require("./routes/account");
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
app.use("/api/account", account);
let port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Listening on PORT ${port}...`));
