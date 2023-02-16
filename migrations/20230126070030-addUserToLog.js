'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return [ queryInterface.addColumn(
      'Logs',
      'UserId',
       { type: Sequelize.INTEGER, references: {model: 'Users',key: 'id'} }
     )
    ];
  },

  async down (queryInterface, Sequelize) {
    return [ queryInterface.removeColumn(
      'Logs',
      'UserId',
       Sequelize.INTEGER
     )];
  }
};
