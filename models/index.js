const config = require("../config/config.js");
const { Sequelize, DataTypes, Op } = require("sequelize");

const sequelize = new Sequelize(
  config.db.DB_NAME,
  config.db.DB_USER,
  config.db.DB_PASS,
  {
    host: config.db.DB_HOST,
    dialect: config.db.dialect,
    operatorsAliases: 0,

    poll: {
      max: config.db.pool.max,
      min: config.db.pool.min,
      acquire: config.db.pool.acquire,
      idle: config.db.pool.idle,
    },
  }
);
const db = {};
db.Sequelize = Sequelize;
db.Op = Op;
db.sequelize = sequelize;

db.post = require("./post.js")(sequelize, Sequelize, DataTypes);
db.user = require("./user.js")(sequelize, Sequelize, DataTypes);
db.service = require("./service.js")(sequelize, Sequelize, DataTypes);
db.storie = require("./storie.js")(sequelize, Sequelize, DataTypes);
db.media = require("./media.js")(sequelize, Sequelize, DataTypes);
db.like = require("./like.js")(sequelize, Sequelize, DataTypes);
db.comment = require("./comment.js")(sequelize, Sequelize, DataTypes);
db.member = require("./member.js")(sequelize, Sequelize, DataTypes);
db.demand = require("./demand.js")(sequelize, Sequelize, DataTypes);
db.replyComment = require("./replayComment.js")(
  sequelize,
  Sequelize,
  DataTypes
);
db.answer = require("./answer.js")(sequelize, Sequelize, DataTypes);

// ---- Associate
//USER

db.user.hasMany(db.post, {
  onDelete: "CASCADE",
  as: "posts",
  foreignKey: "authorId",
});
db.user.belongsToMany(db.service, {
  through: db.member,
  as: "services",
  onDelete: "CASCADE",
});
db.user.hasMany(db.storie, {
  onDelete: "CASCADE",
});
db.user.belongsToMany(db.service, {
  through: db.demand,
  as: "requests",
  onDelete: "CASCADE",
});

//POST
db.post.belongsTo(db.user, {
  onDelete: "CASCADE",
  as: "author",
});
db.post.belongsTo(db.service, {
  onDelete: "CASCADE",
  as: "service",
});
db.post.hasMany(db.media, {
  onDelete: "CASCADE",
  as: "media",
});
db.post.hasMany(db.like, {
  onDelete: "CASCADE",
  as: "likes",
});
db.post.hasMany(db.comment, {
  onDelete: "CASCADE",
  as: "comments",
});
db.post.hasMany(db.answer, {
  onDelete: "CASCADE",
  as: "answers",
});

//COMMENT
db.comment.belongsTo(db.user, {
  onDelete: "CASCADE",
  as: "author",
});
db.comment.hasMany(db.replyComment, {
  onDelete: "CASCADE",
  as: "replyComment",
});
db.comment.belongsTo(db.post, {
  onDelete: "CASCADE",
  as: "post",
});
// REPLY COMMENT
db.replyComment.belongsTo(db.user, {
  onDelete: "CASCADE",
  as: "author",
});
db.replyComment.belongsTo(db.comment, {
  onDelete: "CASCADE",
  as: "comment",
});
//LIKE
db.like.belongsTo(db.user, {
  onDelete: "CASCADE",
  as: "author",
});
db.like.belongsTo(db.post, {
  onDelete: "CASCADE",
  as: "post",
});

//SERVICE

db.service.hasMany(db.post, {
  onDelete: "CASCADE",
  as: "posts",
});
db.service.belongsToMany(db.user, {
  through: db.member,
  as: "members",
  onDelete: "CASCADE",
});
db.service.belongsToMany(db.user, {
  through: db.demand,
  as: "demandes",
  onDelete: "CASCADE",
});

//MEMBERSHIP
db.member.belongsTo(db.user, {
  onDelete: "CASCADE",
  as: "user",
});
db.member.belongsTo(db.service, {
  onDelete: "CASCADE",
  as: "service",
});
//----------------------
db.media.belongsTo(db.post, {
  onDelete: "CASCADE",
  as: "post",
});
//db.post.belongsToMany(db.service, { through: "_id" });
/*
db.role.belongsToMany(db.user, {
  through: "user_roles",
  foreignKey: "role_id",
  otherKey: "user_id"
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  foreignKey: "user_id",
  otherKey: "role_id"
});*/

//db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
