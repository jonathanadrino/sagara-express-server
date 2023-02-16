'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return [ queryInterface.addColumn(
      'Logs',
      'Date',
       Sequelize.STRING
     )];
  },

  async down (queryInterface, Sequelize) {
    return [ queryInterface.removeColumn(
      'Logs',
      'Date',
       Sequelize.STRING
     )];
  }
};
