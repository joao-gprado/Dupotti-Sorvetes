const sequelize = require('sequelize');
const connection = require('./database.js');

const Produto = connection.define('Produto', {
    tipo: {
        type: sequelize.STRING,
        allowNull: false
    },
    sabor: {
        type: sequelize.STRING,
        allowNull: false
    },
    estoque: {
        type: sequelize.INTEGER,
        allowNull: false
    },
    descricao: {
        type: sequelize.TEXT,
        allowNull: false
    },
    preco: {
        type: sequelize.FLOAT,
        allowNull: false
    },
    imagem: {
        type: sequelize.STRING, // Adiciona o campo para armazenar o nome da imagem
        allowNull: true
    }
});

Produto.sync({ force: true }).then(() => {
    console.log("Tabela de produtos criada");
}).catch(err => {
    console.error("Erro ao criar a tabela de produtos:", err);
});

module.exports = Produto;