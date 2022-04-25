module.exports = (sequelize, Sequelize, DataTypes) => {
  const Service = sequelize.define(
    "service", // Model name
    {
      // Model attributes
      _id: {
        type: DataTypes.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      displayName: {
        type: DataTypes.STRING,
        required: true,
        unique: true,
      },
      photoURL: {
        type: DataTypes.STRING,
        default: "",
      },
      about: {
        type: DataTypes.STRING,
      },
      isPublic: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
      status: {
        type: DataTypes.STRING,
        default: "active",
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
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

  return Service;
};
