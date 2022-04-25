module.exports = (sequelize, Sequelize, DataTypes) => {
  const Storie = sequelize.define(
    "storie", // Model name
    {
      // Attributes
      _id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      media: {
        type: DataTypes.STRING,
        default: "",
      },
      status: {
        type: DataTypes.BOOLEAN,
        default: true,
      },
      due: {
        type: DataTypes.STRING,
        default: "day",
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

  return Storie;
};
