module.exports = (sequelize, Sequelize, DataTypes) => {
  const Comment = sequelize.define(
    "comment", // Model name
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
      }
    },
    {
      // Options
      timestamps: true,
      underscrored: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Comment;
};
