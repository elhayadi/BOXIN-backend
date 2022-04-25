module.exports = (sequelize, Sequelize, DataTypes) => {
  const Post = sequelize.define(
    "post", // Model name
    {
      // Model attributes
      _id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      message: {
        type: DataTypes.STRING,
        min: 3,
      },
      isSurvey: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      choices: {
        type: DataTypes.JSON,
        default: [],
      },
      isImage: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isFile: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "published",
      },
    },
    {
      // Options
      timestamps: true,
      underscrored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Post;
};
