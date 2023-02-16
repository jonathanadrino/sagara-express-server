"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.addColumn("Countries", "price1", {
        type: Sequelize.INTEGER,
      });
      await queryInterface.addColumn("Countries", "price2", {
        type: Sequelize.INTEGER,
      });
      await queryInterface.addColumn("Countries", "price3", {
        type: Sequelize.INTEGER,
      });
      await queryInterface.addColumn("Countries", "price4", {
        type: Sequelize.INTEGER,
      });
      await queryInterface.addColumn("Countries", "price5", {
        type: Sequelize.INTEGER,
      });
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      await queryInterface.removeColumn("Countries", "price1");
      await queryInterface.removeColumn("Countries", "price2");
      await queryInterface.removeColumn("Countries", "price3");
      await queryInterface.removeColumn("Countries", "price4");
      await queryInterface.removeColumn("Countries", "price5");
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
