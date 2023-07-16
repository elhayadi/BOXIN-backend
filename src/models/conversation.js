module.exports = (sequelize, Sequelize, DataTypes) => {
  const Conversation = sequelize.define(
    "conversation", // Model name
    {
      // Model attributes
      _id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.STRING,
        defaultValue: "ONE_TO_ONE",
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

  return Conversation;
};
