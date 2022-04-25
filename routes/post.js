const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const db = require("../models");
const User = db.user;
const Service = db.service;
const Post = db.post;
const Answer = db.answer;
const Comment = db.comment;
const Media = db.media;
const ReplyComment = db.replyComment;
const Like = db.like;
const Op = db.Op;
const express = require("express");
const isleader = require("../middleware/isleader");
const ismember = require("../middleware/ismember");
const canSee = require("../middleware/canSee");
const paginate = require("../middleware/paginate");
const router = express.Router();
const multer = require("multer");
const { uuid } = require("uuidv4");
const { replyComment } = require("../models");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (req.body.isImage) {
      cb(null, "./uploads/images/");
    } else {
      cb(null, "./uploads/files/");
    }
  },
  filename: function (req, file, cb) {
    var fileExtension = file.originalname.split(".")[1];
    cb(null, uuid() + "." + fileExtension);
  },
});

const fileFilter = (req, file, cb) => {
  // reject a file
  if (
    file.mimetype === ".png" &&
    file.mimetype === ".jpg" &&
    file.mimetype === ".gif" &&
    file.mimetype === ".jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
});
router.post(
  "/broadcast",
  [auth, admin],
  upload.array("media"),
  async (req, res) => {
    Service.findOne({
      where: {
        displayName: "general",
      },
    })
      .then((service) => {
        Post.create({
          message: req.body.message,
          isSurvey: req.body.isSurvey,
          isImage: req.body.isImage,
          isFile: req.body.isFile,
          choices: req.body.choices,
        })
          .then(async (post) => {
            const author = await User.findByPk(req.user._id);
            post.setService(service);
            post.setAuthor(author);
            req.files.forEach((file) => {
              let fileExtension = file.originalname.split(".")[1];
              Media.create({
                path: file.path,
                extention: fileExtension,
              })
                .then(async (media) => {
                  media.setPost(post);
                })
                .catch((err) => {
                  console.log(err);
                  res.status(500).send({ message: "Internal server error" });
                });
            });
            res.send({ ...post.dataValues, author: author, media: req.files });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Internal server error" });
          });
      })
      .catch((err) => {
        console.log(err);
        res.status(500).send({ message: "Internal server error" });
      });
  }
);
router.post("/service", [auth], upload.array("media"), async (req, res) => {
  Service.findOne({
    where: {
      _id: req.body.service,
    },
  })
    .then((service) => {
      Post.create({
        message: req.body.message,
        isSurvey: req.body.isSurvey,
        isImage: req.body.isImage,
        isFile: req.body.isFile,
        choices: req.body.choices,
      })
        .then(async (post) => {
          const author = await User.findByPk(req.user._id);
          post.setService(service);
          post.setAuthor(author);
          req.files.forEach((file) => {
            let fileExtension = file.originalname.split(".")[1];
            Media.create({
              path: file.path,
              extention: fileExtension,
            })
              .then(async (media) => {
                media.setPost(post);
              })
              .catch((err) => {
                console.log(err);
                res.status(500).send({ message: "Internal server error" });
              });
          });
          res.send({ ...post.dataValues, author: author, media: req.files });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Internal server error" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Internal server error" });
    });
});
router.get("/group", [auth, paginate("group")], async (req, res) => {
  try {
    console.log("getserviceposts");
    res.send(res.paginatedResults);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.get("/group/more", [auth, paginate("group")], async (req, res) => {
  try {
    console.log("getmoreserviceposts");
    res.send(res.paginatedResults);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.get("/cache", auth, async (req, res) => {
  console.log("getcacheposts");
  Service.findOne({
    where: {
      displayName: "general",
    },
  })
    .then((service) => {
      Post.findAll({
        limit: 10,
        where: { serviceId: service._id },
        order: [["created_at", "DESC"]],
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
            model: Answer,
            as: "answers",
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
      })
        .then((results) => {
          console.log(results[0].author);
          console.log("done");
          res.send(results);
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Internal server error" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Internal server error" });
    });
});

router.get("/all", [auth, paginate("all")], async (req, res) => {
  try {
    console.log("getallposts");
    res.send(res.paginatedResults);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.get("/more", [auth, paginate("all")], async (req, res) => {
  try {
    console.log("getmoreposts");
    res.send(res.paginatedResults);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});

router.post("/survey", [auth], async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const post = await Post.findById(req.body.post);
    const index = await _.findIndex(post.choices, { id: req.body.indice });

    // Replace item at index using native splice
    let newchoices = [];
    await post.choices.map((item) => {
      if (item.id === req.body.indice) {
        const tmp = {
          id: item.id,
          option: item.option,
          score: item.score + 1,
        };
        newchoices.push(tmp);
      } else {
        newchoices.push(item);
      }
    });
    await Post.findByIdAndUpdate(req.body.post, {
      $set: {
        choices: newchoices,
      },
    });
    post.personAnswers.push({ user, answer: req.body.indice });
    await post.save();
    res.send(post);
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});

router.post("/like", [auth], async (req, res) => {
  Post.findOne({
    where: {
      _id: req.body._id,
    },
  })
    .then((post) => {
      if (!post) return res.status(400).json({ message: "Post Introuvable" });
      User.findOne({
        where: {
          _id: req.user._id,
        },
      })
        .then(async (user) => {
          if (!user)
            return res.status(400).json({ message: "User Introuvable" });

          Like.create()
            .then(async (like) => {
              await like.setAuthor(user);
              await like.setPost(post);
              res.send(post);
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send({ message: "Like Action n'est pas créer" });
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Internal server error" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Internal server error" });
    });
});
router.post("/unlike", [auth], async (req, res) => {
  Like.findOne({
    where: { postId: req.body._id, authorId: req.user._id },
  })
    .then(async (like) => {
      await like.destroy();
      res.status(200).json({ message: "Deleted Successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Like Action n'est pas créer" });
    });
});
router.post("/comment", [auth], async (req, res) => {
  User.findOne({
    where: {
      _id: req.user._id,
    },
  })
    .then(async (user) => {
      if (!user) return res.status(400).json({ message: "User Introuvable" });

      Comment.create({
        postId: req.body.post._id,
        authorId: req.user._id,
        message: req.body.message,
      })
        .then(async (comment) => {
          res.send({ ...comment.dataValues, author: user, replyComment: [] });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Comment Action n'est pas créer" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Comment Action n'est pas créer" });
    });
});
router.post("/reply", [auth], async (req, res) => {
  User.findOne({
    where: {
      _id: req.user._id,
    },
  })
    .then(async (user) => {
      if (!user) return res.status(400).json({ message: "User Introuvable" });

      ReplyComment.create({
        commentId: req.body.comment,
        authorId: req.user._id,
        message: req.body.reply,
      })
        .then(async (reply) => {
          res.send({ ...reply.dataValues, author: user });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Comment Action n'est pas créer" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Comment Action n'est pas créer" });
    });
});
// --------------- LEADERS -----------------------
const CheckExist = async (members, _id) => {
  let result = false;
  const response = _.find(members, ["_id", _id]);
  if (response) {
    result = true;
  }
  return result;
};

module.exports = router;
