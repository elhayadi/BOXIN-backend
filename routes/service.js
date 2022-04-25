const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const db = require("../models");
const User = db.user;
const Service = db.service;
const Member = db.member;
const Post = db.post;
const Media = db.media;
const Demand = db.demand;
const Op = db.Op;
const express = require("express");
const isleader = require("../middleware/isleader");
const router = express.Router();
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/services/");
  },
  filename: function (req, file, cb) {
    cb(null, req.body._id + ".jpg");
  },
});

const upload = multer({
  storage: storage,
});

router.post("/add", [auth, admin], async (req, res) => {
  Service.findOne({
    where: {
      displayName: req.body.displayName,
    },
  })
    .then((service) => {
      if (service) {
        return res.status(404).json({ message: "Nom déja utilisé." });
      } else {
        console.log(req.file);
        var path = "uploads/services/default.jpg";
        Service.create({
          displayName: req.body.displayName,
          about: req.body.about,
          photoURL: path,
          isPublic: req.body.isPublic,
        })
          .then((service) => {
            res.send({ service });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).send({ message: "Service n'est pas créer" });
          });
      }
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
});
router.get("/", [auth], async (req, res) => {
  Service.findOne({
    where: {
      _id: req.query.displayName,
    },
    include: [
      {
        model: User,
        as: "members",
      },
      {
        model: User,
        as: "demandes",
      },
    ],
  })
    .then((service) => {
      Member.findOne({
        where: {
          userId: req.user._id,
          serviceId: service._id,
        },
      })
        .then((membership) => {
          if (membership) {
            Post.findAll({
              limit: 10,
              order: [["created_at", "DESC"]],
              where: {
                serviceId: service._id,
              },
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
                  model: Media,
                  as: "media",
                },
              ],
            })
              .then((posts) => {
                return res.send({
                  ...service.dataValues,
                  isAdmin: membership.isAdmin,
                  isMember: true,
                  posts: posts,
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).send({ message: "Service n'existe pas" });
              });
          } else {
            return res.send({
              ...service.dataValues,
              isAdmin: false,
              isMember: false,
            });
          }
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Service n'existe pas" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Service n'existe pas" });
    });
});
router.get("/all", async (req, res) => {
  console.log("allServices");
  const services = await Service.findAll({
    order: [["created_at", "DESC"]],
    include: [
      {
        model: User,
        as: "members",
      },
    ],
  });
  res.send(services);
});

// --------------- LEADERS -----------------------

router.post("/leader", [auth, admin], async (req, res) => {
  Service.findOne({
    where: {
      _id: req.body.service._id,
    },
  })
    .then((service) => {
      if (!service)
        return res.status(400).json({ message: "Service Introuvable" });
      User.findOne({
        where: {
          _id: req.body.leader._id,
        },
      })
        .then(async (user) => {
          if (!user)
            return res.status(400).json({ message: "User Introuvable" });

          await service.addMember(user, { through: { isAdmin: true } });
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

router.delete("/leader/delete", [auth, admin], async (req, res) => {
  console.log(req.body.membership);
  Member.update(
    {
      isAdmin: false,
    },
    {
      where: { _id: req.body.membership },
    }
  )
    .then((membership) => {
      if (!membership)
        return res.status(400).json({ message: "Relation Introuvable" });

      res.status(200).json({ message: "Deleted Successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Internal server error" });
    });
});
// --------------- MEMBERS -----------------------

router.post("/membership/request", [auth], async (req, res) => {
  Service.findOne({
    where: {
      _id: req.body.service._id,
    },
  })
    .then((service) => {
      if (!service)
        return res.status(400).json({ message: "Service Introuvable" });
      User.findOne({
        where: {
          _id: req.body.member._id,
        },
      })
        .then(async (user) => {
          if (!user)
            return res.status(400).json({ message: "User Introuvable" });

          await service.addDemandes(user);
          res.send({ service });
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
router.post("/membership/refuse", [auth, isleader], async (req, res) => {
  Demand.findOne({
    where: { userId: req.body.member._id, serviceId: req.body.service._id },
  })
    .then(async (demand) => {
      if (!demand)
        return res.status(400).json({ message: "Demande Introuvable" });

      await demand.destroy();
      res.status(200).json({ message: "Deleted Successfully" });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Internal server error" });
    });
});
router.post("/membership/accept", [auth, isleader], async (req, res) => {
  Demand.findOne({
    where: { userId: req.body.member._id, serviceId: req.body.service._id },
  })
    .then(async (demand) => {
      if (!demand)
        return res.status(400).json({ message: "Demande Introuvable" });
      Service.findOne({
        where: {
          _id: req.body.service._id,
        },
      })
        .then((service) => {
          if (!service)
            return res.status(400).json({ message: "Service Introuvable" });
          User.findOne({
            where: {
              _id: req.body.member._id,
            },
          })
            .then(async (user) => {
              if (!user)
                return res.status(400).json({ message: "User Introuvable" });

              await service.addMember(user, { through: { isAdmin: false } });
              await demand.destroy();
              res.send({ service });
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
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: "Internal server error" });
    });
});

router.put(
  "/update",
  [auth, upload.single("profileImage")],
  async (req, res) => {
    if (req.file) {
      Service.findOne({
        where: { _id: req.body._id },
        include: [
          {
            model: User,
            as: "members",
          },
          {
            model: User,
            as: "demandes",
          },
        ],
      })
        .then(async (service) => {
          if (!service)
            return res.status(400).json({ message: "Relation Introuvable" });
          service.set({
            displayName: req.body.displayName,
            about: req.body.about,
            photoURL: req.file.path,
          });

          await service.save();
          Post.findAll({
            limit: 10,
            order: [["created_at", "DESC"]],
            where: {
              serviceId: service._id,
            },
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
                model: Media,
                as: "media",
              },
            ],
          })
            .then((posts) => {
              return res.send({
                ...service.dataValues,
                isAdmin: true,
                isMember: true,
                posts: posts,
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send({ message: "Service n'existe pas" });
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Internal server error" });
        });
    } else {
      Service.findOne({
        where: { _id: req.body._id },
        include: [
          {
            model: User,
            as: "members",
          },
          {
            model: User,
            as: "demandes",
          },
        ],
      })
        .then(async (service) => {
          if (!service)
            return res.status(400).json({ message: "Relation Introuvable" });
          service.set({
            displayName: req.body.displayName,
            about: req.body.about,
          });
          await service.save();
          Post.findAll({
            limit: 10,
            order: [["created_at", "DESC"]],
            where: {
              serviceId: service._id,
            },
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
                model: Media,
                as: "media",
              },
            ],
          })
            .then((posts) => {
              return res.send({
                ...service.dataValues,
                isAdmin: true,
                isMember: true,
                posts: posts,
              });
            })
            .catch((err) => {
              console.log(err);
              res.status(500).send({ message: "Service n'existe pas" });
            });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Internal server error" });
        });
    }
  }
);
module.exports = router;
