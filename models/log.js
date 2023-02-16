"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Log.belongsTo(models.Order, { foreignKey: "OrderId" });
      Log.belongsTo(models.User, { foreignKey: "UserId" });
    }
  }
  Log.init(
    {
      description: DataTypes.STRING,
      date: DataTypes.STRING,
      OrderId: DataTypes.INTEGER,
      UserId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Log",
    }
  );
  return Log;
};
