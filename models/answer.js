module.exports = (sequelize, Sequelize, DataTypes) => {
  const Answer = sequelize.define(
    "answer", // Model name
    {
      // Model attributes
      _id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      value: {
        type: DataTypes.INTEGER,
        min: 3,
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

  return Answer;
};
