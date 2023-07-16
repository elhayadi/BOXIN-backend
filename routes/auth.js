const bcrypt = require("bcrypt");
const _ = require("lodash");
const config = require("../../config/config");
const jwt = require("jsonwebtoken");
const db = require("../../models");
const User = db.user;
const Service = db.service;
const Op = db.Op;
const express = require("express");
const router = express.Router();

router.post("/login", async (req, res) => {
  console.log(req.body);
  User.findOne({
    where: {
      email: req.body.email,
    },
    include: [
      {
        model: Service,
        as: "services",
        // where: { displayName: { [Op.not]: "general" } },
      },
    ],
  })
    .then((user) => {
      if (!user) {
        return res.status(404).send({ message: "User Not found." });
      }
      const validPassword = bcrypt.compareSync(
        req.body.password,
        user.password
      );
      if (!validPassword)
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });

      if (user.status === "pending")
        return res
          .status(300)
          .json({ message: "Votre Compte est en attente de Validation" });
      if (user.status === "banned")
        return res.status(400).json({
          message: "Votre Compte à été bloquer, contactez le support",
        });
      console.log("found");
      let token = jwt.sign(
        { _id: user._id, role: user.role },
        config.auth.secret,
        {
          expiresIn: 86400, // 24 hours
        }
      );
      console.log(user);
      res.status(200).send({
        user: {
          _id: user._id,
          displayName: user.displayName,
          email: user.email,
          role: user.role,
          services: user.services,
        },
        accessToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send({ message: err.message });
    });
});

router.post("/register", async (req, res) => {
  console.log("------registerbody-----");
  console.log(req.body.services);
  console.log("-----------");
  // Save user to database
  const salt = await bcrypt.genSalt(10);
  const pwd = await bcrypt.hash(req.body.password, salt);
  Service.findOne({
    where: {
      displayName: "general",
    },
  })
    .then((service) => {
      User.create({
        displayName: req.body.displayName,
        email: req.body.email,
        password: pwd,
        status: "active",
        fonction: req.body.fonction,
        phoneNumber: req.body.phoneNumber,
      })
        .then((user) => {
          user.addServices(service);

          req.body.services.forEach(async (elm) => {
            let serv = await Service.findOne({
              where: {
                _id: elm._id,
              },
            });
            await serv.addDemandes(user);
          });
          let token = jwt.sign(
            { _id: user._id, role: user.role },
            config.auth.secret,
            {
              expiresIn: 86400, // 24 hours
            }
          );
          res.send({
            user: {
              _id: user._id,
              displayName: user.displayName,
              email: user.email,
              role: user.role,
              services: [service],
            },
            accessToken: token,
            message: "User was registered successfully!",
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({ message: "Email déja utilisé" });
        });
    })
    .catch((err) => {
      res.status(500).send({ message: "Ajouter d'abord des services" });
    });
});

module.exports = router;
