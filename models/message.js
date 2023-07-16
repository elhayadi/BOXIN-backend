module.exports = (sequelize, Sequelize, DataTypes) => {
  const Message = sequelize.define(
    "message", // Model name
    {
      // Model attributes
      _id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      body: {
        type: DataTypes.STRING,
        min: 3,
      },
      contentType: {
        type: DataTypes.STRING,
        defaultValue: "text",
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

  return Message;
};
