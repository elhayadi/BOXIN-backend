const auth = require('../middleware/auth');
const _ = require('lodash');
const User = require("../models/user");
const express = require('express');
const router = express.Router();

router.get('/me', auth, async (req, res) => {
    const user = await User.findById(req.user._id);
    res.send(_.omit(user, ["password"]));
  });

module.exports = router; 
