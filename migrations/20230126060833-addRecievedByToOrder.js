'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return [ queryInterface.addColumn(
      'Orders',
      'recievedBy',
       Sequelize.STRING
     )];
  },

  async down (queryInterface, Sequelize) {
    return [ queryInterface.removeColumn(
      'Orders',
      'recievedBy',
       Sequelize.STRING
     )];
  }
};
