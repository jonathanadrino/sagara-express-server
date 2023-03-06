'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return [ queryInterface.addColumn(
      'Orders',
      'vendor',
       Sequelize.STRING
     )];
  },

  async down (queryInterface, Sequelize) {
    return [ queryInterface.removeColumn(
      'Orders',
      'vendor',
       Sequelize.STRING
     )];
  }
};
