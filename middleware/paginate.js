const Post = require("../models/post");
const User = require("../models/user");
const _ = require("lodash");

function paginatedResults(model) {
  return async (req, res, next) => {
    console.log(model);
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    var startIndex = 0;
    if (page <= 0) {
      startIndex = limit;
    } else {
      startIndex = (page - 1) * limit;
    }

    const endIndex = page * limit;

    const results = {};

    if (endIndex < (await Post.countDocuments().exec())) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    } else {
      results.next = null;
    }

    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }
    try {
      let search = [];
      if (model === "group") {
        search = req.query.service;
      } else {
        const user = await User.findById(req.user._id);
        let services = [];

        services = await _.map(user.servicesMember, "_id");
        search = [null, ...services];
      }
      results.results = await Post.find({ service: search })
        .populate("author")
        .populate("personLikes")
        .populate("personAnswers.user")
        .populate("comments.author")
        .populate("service")
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(startIndex)
        .exec();

      res.paginatedResults = results;
      next();
    } catch (e) {
      console.log(e.message);
      res.status(500).json({ message: e.message });
    }
  };
}
module.exports = paginatedResults;
