const _ = require("lodash");
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

  if (
    !CheckExist(req.body.service.leaders, req.user._id) &&
    req.user.role !== "leader"
  )
    return res.status(402).send("Access denied.");

  next();
};
