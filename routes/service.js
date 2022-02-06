const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const _ = require("lodash");
const Service = require("../models/service");
const User = require("../models/user");
const express = require("express");
const service = require("../models/service");
const isleader = require("../middleware/isleader");
const router = express.Router();

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
  const service = await Service.findOne({ displayName: req.query.displayName });
  res.send(service ? service : null);
});
router.get("/all", auth, async (req, res) => {
  const services = await Service.find();
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
  const response = _.find(members, ["_id", _id]);
  if (response) {
    result = true;
  }
  return result;
};

router.post("/leader", [auth, admin], async (req, res) => {
  try {
    const service = await Service.findById({
      _id: req.body.service._id,
    });
    if (!service)
      return res.status(400).json({ message: "Service Introuvable" });

    const user = await User.findByIdAndUpdate(
      req.body.leader._id,
      {
        role: "leader",
      },
      { new: true }
    );
    await user.servicesLeader.push(req.body.service);
    await service.leaders.push(req.body.leader);
    if (!CheckExist(service.members, req.body.leader._id)) {
      await service.members.push(req.body.leader);
      await user.servicesMember.push(req.body.service);
    }
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

    if (user.servicesLeader.length <= 1) {
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
    const service = await Service.findById({
      _id: req.body.service._id,
    });
    if (!service)
      return res.status(400).json({ message: "Service Introuvable" });

    if (!(await CheckExist(service.members, req.body.member._id))) {
      await service.demands.push(req.body.member);
    }

    await service.save();
    res.send({ service });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
router.post("/membership/accept", [auth, isleader], async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.body.service._id, {
      $pull: { demands: { _id: req.body.member._id } },
    });
    if (!(await CheckExist(req.body.service.members, req.body.member._id))) {
      const user = await User.findById(req.body.member._id);
      await user.servicesMember.push(req.body.service);
      await service.members.push(req.body.member);

      await user.save();
    }
    await service.save();
    res.send({ service });
  } catch (error) {
    res.status(400).send({ message: "Internal server error" });
  }
});
module.exports = router;
