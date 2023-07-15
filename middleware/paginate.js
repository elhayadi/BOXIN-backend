const db = require("../models");

const User = db.user;
const Service = db.service;
const Post = db.post;
const Choice = db.choice;
const Comment = db.comment;
const Media = db.media;
const ReplyComment = db.replyComment;
const Like = db.like;
const Op = db.Op;
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

    if (endIndex < (await Post.count())) {
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
        const service = await Service.findOne({
          where: {
            displayName: "general",
          },
        });
        const user = await User.findOne({
          where: {
            _id: req.user._id,
          },
          include: [{ model: Service, as: "services" }],
        });
        search = await _.map(user.services, "_id");
        search = [...search, service._id];
      }
      console.log(search);
      results.results = await Post.findAll({
        where: { serviceId: search, status: "published" },
        limit: 10,
        order: [["created_at", "DESC"]],
        offset: startIndex,
        include: [
          {
            model: Service,
            as: "service",
          },
          {
            model: User,
            as: "author",
          },
          {
            model: Choice,
            as: "choices",
            include: [{ model: User, as: "voters" }],
          },
          {
            model: Comment,
            as: "comments",
            include: [
              { model: User, as: "author" },
              {
                model: ReplyComment,
                as: "replyComment",
                include: [{ model: User, as: "author" }],
              },
            ],
          },
          {
            model: Like,
            as: "likes",
            include: [{ model: User, as: "author" }],
          },
          {
            model: Media,
            as: "media",
          },
        ],
      });

      res.paginatedResults = results;
      next();
    } catch (e) {
      console.log(e.message);
      res.status(500).json({ message: e.message });
    }
  };
}
module.exports = paginatedResults;
