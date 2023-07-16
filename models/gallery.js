module.exports = (sequelize, Sequelize, DataTypes) => {
  const Gallery = sequelize.define(
    "gallery", // Model name
    {
      // Model attributes
      _id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
        min: 3,
        defaultValue: "photo",
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

  return Gallery;
};
