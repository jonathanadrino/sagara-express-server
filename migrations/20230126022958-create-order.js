'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      resi: {
        type: Sequelize.STRING
      },
      sender: {
        type: Sequelize.STRING
      },
      senderContact: {
        type: Sequelize.STRING
      },
      recipient: {
        type: Sequelize.STRING
      },
      recipientContact: {
        type: Sequelize.STRING
      },
      recipientAddress: {
        type: Sequelize.STRING(1000)
      },
      status: {
        type: Sequelize.STRING
      },
      updatedBy: {
        type: Sequelize.STRING
      },
      UserId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' }
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Orders');
  }
};