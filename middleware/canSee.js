const _ = require("lodash");
const Service = require("../models/service");
const CheckExist = async (members, _id) => {
  let result = false;
  const response = await _.find(members, ["_id", _id]);
  if (response) {
    result = true;
  }
  return result;
};

module.exports = function (req, res, next) {
  // 401 Unauthorized
  // 403 Forbidden
  const service = Service.findById(req.query.service);
  if (!CheckExist(service.members, req.user._id))
    return res.status(404).send("Access denied.");

  next();
};
