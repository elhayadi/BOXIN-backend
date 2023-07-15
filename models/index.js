const config = require("../config/config.js");
const { Sequelize, DataTypes, Op } = require("sequelize");
const message = require("./message.js");

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
db.saved = require("./saved.js")(sequelize, Sequelize, DataTypes);
db.choice = require("./choice.js")(sequelize, Sequelize, DataTypes);
db.vote = require("./vote.js")(sequelize, Sequelize, DataTypes);
db.message = require("./message.js")(sequelize, Sequelize, DataTypes);
db.conversation = require("./conversation.js")(sequelize, Sequelize, DataTypes);

db.replyComment = require("./replayComment.js")(
  sequelize,
  Sequelize,
  DataTypes
);

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
db.user.belongsToMany(db.post, {
  through: db.saved,
  as: "saves",
  onDelete: "CASCADE",
});
db.user.hasMany(db.storie, {
  onDelete: "CASCADE",
  as: "stories",
  foreignKey: "authorId",
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
db.post.hasMany(db.choice, {
  onDelete: "CASCADE",
  as: "choices",
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
//
db.choice.belongsToMany(db.user, {
  through: db.vote,
  as: "voters",
  onDelete: "CASCADE",
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

// Media ----------------------
db.media.belongsTo(db.post, {
  onDelete: "CASCADE",
  as: "post",
});
//CHAT
db.user.hasMany(db.message, {
  foreignKey: "senderId",
  as: "OutgoingMessages",
});

db.user.hasMany(db.message, {
  foreignKey: "receiverId",
  as: "IncomingMessages",
});
db.message.belongsTo(db.user, {
  foreignKey: "senderId",
  as: "Sender",
});
db.message.belongsTo(db.user, {
  foreignKey: "receiverId",
  as: "Receiver",
});
db.message.belongsTo(db.conversation);
db.conversation.hasMany(db.message, {
  onDelete: "CASCADE",
  as: "messages",
});
db.conversation.belongsToMany(db.user, {
  through: "participants",
  onDelete: "CASCADE",
});
//Storie

db.storie.belongsTo(db.user, {
  onDelete: "CASCADE",
  as: "author",
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
