const sequelize = require('sequelize');
const connection = require('./database.js');

const User = connection.define('user', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    usuario: {
        type: sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: sequelize.STRING,
        allowNull: false
    }, 
    senha: {
        type: sequelize.STRING,
        allowNull: false
    }
});

User.sync({ force: false }).then(() => {
    console.log("Tabela de usuarios criada");
}).catch(err => {
    console.error("Erro ao criar a tabela de usuários:", err);
});

module.exports = User;