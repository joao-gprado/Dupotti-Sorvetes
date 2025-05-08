const sequelize = require('sequelize');
const connection = require('./database.js');

const TipoProduto = connection.define('tipoProduto', {
    id: {
        type: sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nome: {
        type: sequelize.STRING,
        allowNull: false,
    },
});

TipoProduto.sync({ force: true }).then(() => {
    console.log("Tabela de tipos criada");
}).catch(err => {
    console.error("Erro ao criar a tabela de tipos:", err);
});

module.exports = TipoProduto;