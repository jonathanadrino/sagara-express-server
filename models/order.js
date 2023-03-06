"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, { foreignKey: "UserId" });
      Order.hasMany(models.Log, { foreignKey: "OrderId" });
    }
  }
  Order.init(
    {
      vendor: DataTypes.STRING,
      resi: DataTypes.STRING,
      sender: DataTypes.STRING,
      senderContact: DataTypes.STRING,
      recipient: DataTypes.STRING,
      recipientContact: DataTypes.STRING,
      recipientAddress: DataTypes.STRING,
      recipientCountry: DataTypes.STRING,
      status: DataTypes.STRING,
      updatedBy: DataTypes.STRING,
      UserId: DataTypes.INTEGER,
      recievedBy: DataTypes.STRING,
      cityOrigin: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Order",
    }
  );
  return Order;
};
