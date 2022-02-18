const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const Service = require("../models/service");
const User = require("../models/user");
const express = require("express");
const service = require("../models/service");
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
  try {
    let service = await Service.findOne({
      displayName: req.body.displayName,
    });

    if (service) return res.status(400).json({ message: "Nom déja utilisé." });

    service = new Service(req.body);
    await service.save();

    res.send({ service });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.get("/", [auth], async (req, res) => {
  const service = await Service.findOne({ displayName: req.query.displayName })
    .populate("members")
    .exec();
  res.send(service ? service : null);
});
router.get("/all", auth, async (req, res) => {
  const services = await Service.find().populate("members").exec();
  res.send(services);
});
router.get("/names", async (req, res) => {
  const services = await Service.find()
    .select("displayName isPublic status")
    .exec();
  res.send(_.filter(services, { status: "active" }));
});

// --------------- LEADERS -----------------------
const CheckExist = async (members, _id) => {
  let result = false;
  if (members.length > 0) {
    const response = _.find(members, ["_id", _id]);
    if (response) {
      result = true;
    }
  }

  return result;
};

router.post("/leader", [auth, admin], async (req, res) => {
  try {
    const service = await Service.findById(req.body.service._id);
    if (!service)
      return res.status(400).json({ message: "Service Introuvable" });
    console.log("ok1");
    const user = await User.findById(req.body.leader._id);

    console.log("ok2");
    const found = await _.findIndex(service.members, ["_id", user._id]);
    console.log(found);
    if (found === -1) {
      await user.servicesMember.push(req.body.service);
      await service.members.push(user);
      console.log("---------------------------not found");
    }
    await service.leaders.push(user);
    await user.servicesLeader.push(req.body.service);
    console.log("ok4");
    await user.save();
    await service.save();
    res.send({ service });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});

router.post("/leader/delete", [auth, admin], async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.body.service._id, {
      $pull: { leaders: { _id: req.body.leader._id } },
    });

    const user = await User.findByIdAndUpdate(req.body.leader._id, {
      $pull: { servicesLeader: { _id: req.body.service._id } },
    });

    if (user.servicesLeader.length < 1) {
      console.log("executed");
      await User.findByIdAndUpdate(
        req.body.leader._id,
        {
          role: "simpleUser",
        },
        { new: true }
      );
    }
    res.send({ service });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
// --------------- MEMBERS -----------------------

router.post("/membership/request", [auth], async (req, res) => {
  try {
    const service = await Service.findById(req.body.service._id);
    if (!service)
      return res.status(400).json({ message: "Service Introuvable" });

    const found = await _.findIndex(service.members, [
      "_id",
      req.body.member._id,
    ]);
    console.log(found);
    if (found === -1) {
      await service.demands.push(req.body.member);
    }

    await service.save();
    res.send({ service });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.post("/membership/refuse", [auth, isleader], async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.body.service._id, {
      $pull: { demands: { _id: req.body.member._id } },
    });
    await service.save();
    res.send({ service });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.post("/membership/accept", [auth, isleader], async (req, res) => {
  try {
    console.log(req.body);
    const service1 = await Service.findById(req.body.service._id).populate(
      "members"
    );
    const found = await _.findIndex(service1.members, [
      "_id",
      req.body.member._id,
    ]);
    console.log(found);
    if (found === -1) {
      const user = await User.findById(req.body.member._id);
      await user.servicesMember.push(service1);
      await service1.members.push(user);
      console.log("---------------------------not found");
      await user.save();
    }
    await service1.save();
    const service = await Service.findByIdAndUpdate(req.body.service._id, {
      $pull: { demands: { _id: req.body.member._id } },
    });
    res.send({ service });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});

router.put(
  "/update",
  [auth, upload.single("profileImage")],
  async (req, res) => {
    try {
      console.log(req.body);

      if (req.file) {
        await Service.findByIdAndUpdate(
          req.body._id,
          {
            displayName: req.body.displayName,
            about: req.body.about,
            photoURL: req.file.path,
          },
          {
            new: true,
          }
        );
        console.log(req.file);
      } else {
        await Service.findByIdAndUpdate(
          req.body._id,
          {
            displayName: req.body.displayName,
            about: req.body.about,
          },
          {
            new: true,
          }
        );
      }

      res.status(200).send({ message: "created successfuly" });
    } catch (error) {
      res.status(400).send({ message: "Internal server error" });
    }
  }
);
module.exports = router;
