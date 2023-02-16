'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Order,{foreignKey: 'UserId'})
      User.hasMany(models.Log, {foreignKey: 'UserId'})
    }
  }
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    status: DataTypes.STRING,
    role: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};