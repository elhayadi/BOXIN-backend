module.exports = (sequelize, Sequelize, DataTypes) => {
  const Choice = sequelize.define(
    "choice", // Model name
    {
      // Model attributes
      _id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      }, 
      option: {
        type: DataTypes.STRING,
        min: 3,
      },
      score: {
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

  return Choice;
};
