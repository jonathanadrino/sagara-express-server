'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class HomeImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  HomeImage.init({
    url: DataTypes.STRING(1000)
  }, {
    sequelize,
    modelName: 'HomeImage',
  });
  return HomeImage;
};