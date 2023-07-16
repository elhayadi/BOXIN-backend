module.exports = (sequelize, Sequelize, DataTypes) => {
  const Media = sequelize.define(
    "media", // Model name
    {
      // Model attributes
      _id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      path: {
        type: DataTypes.STRING,
        min: 3,
      },
      extention: {
        type: DataTypes.STRING,
        defaultValue: "jpg",
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

  return Media;
};
