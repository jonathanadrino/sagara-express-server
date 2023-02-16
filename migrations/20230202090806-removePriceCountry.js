'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Countries', 'price');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn("Countries", "price", {
      type: Sequelize.INTEGER,
    });
  }
};
