const express = require("express");
const app = express();
const sessao = require("express-session");
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const { Op } = require('sequelize');
const connection = require('./database/database');
const User = require('./database/usuario');
const Produto = require('./database/produto');
const TipoProduto = require('./database/tipoProduto');

app.use(sessao({
    secret: 'segredo',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }
}));

connection.authenticate().then(() => {
    console.log("Conectado ao banco de dados");
}).catch((msgErro) => {
    console.log("Erro ao se conectar ao banco de dados");
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.set('view engine', 'ejs');
app.use(express.static('public'));


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/img');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });


app.get('/produtos', (req, res) => {
    Produto.findAll().then((produtos) => {
        return TipoProduto.findAll().then((tipoProdutos) => {
            const usuario = req.session.usuario;
            const email = req.session.email; 
            res.render('produtos', { produtos, tipoProdutos, usuario, email });
        });
    }).catch((error) => {
        console.error('Erro ao buscar produtos ou tipos:', error);
        res.redirect('/');
    });
});

const tipoProdutos = [
    { nome: 'Potes Sorvetes 2 Litros' },
    { nome: 'Potes Sorvetes 1,5 Litros' },
    { nome: 'Pote de Açaí 1,5 Litros' },
    { nome: 'Picolé ao Leite' },
    { nome: 'Picolé de Fruta' },
    { nome: 'Picolé Skimo' }
];

app.post('/cadastrarTipo', (req, res) => {
    const tipo = req.body.nome;
    TipoProduto.create({ nome: tipo }).then(() => {
        res.redirect('/cadastroProdutos');
    });
});

app.post('/cadastrarProduto', upload.single('imagem'), (req, res) => {
    const { tipo, sabor, estoque, descricao, preco } = req.body;
    const imagem = req.file ? req.file.filename : null;

    Produto.findOne({ where: { tipo, sabor } }).then((produtoExiste) => {
        if (produtoExiste) {
            const novoEstoque = produtoExiste.estoque + parseInt(estoque);
            Produto.update({ estoque: novoEstoque }, { where: { id: produtoExiste.id } });
        } else {
            Produto.create({ tipo, sabor, estoque, descricao, preco, imagem });
        }
    }).then(() => {
        res.redirect('/produtos');
    }).catch((error) => {
        console.error(error);
    });
});

app.get('/buscarProdutos', (req, res) => {
    const termo = req.query.termo || '';
    const tipo = req.query.tipo || '';

    const whereCondition = {
        [Op.and]: []
    };

    if (termo) {
        whereCondition[Op.and].push({
            [Op.or]: [
                { descricao: { [Op.like]: `%${termo}%` } },
                { sabor: { [Op.like]: `%${termo}%` } },
                { tipo: { [Op.like]: `%${termo}%` } }
            ]
        });
    }

    if (tipo) {
        whereCondition[Op.and].push({ tipo });
    }

    Produto.findAll({
        where: whereCondition
    })
    .then(produtos => {
        return TipoProduto.findAll().then(tipoProdutos => {
            const usuario = req.session.usuario;
            const email = req.session.email; 
            res.render('produtos', { produtos, tipoProdutos, usuario, email });
        });
    })
    .catch(error => {
        console.error('Erro ao buscar produtos:', error);
        res.redirect('/produtos');
    });
});


app.post('/logar', (req, res) => {
    const { usuario, senha } = req.body;

    User.findOne({ where: { usuario } })
        .then(user => {
            if (user) {
                if (user.senha === senha) {
                    req.session.usuario = user.usuario;
                    req.session.email = user.email;
                    res.redirect('/');
                } else {

                    res.render('login', { errorMessage: "Senha incorreta" });
                }
            } else {

                res.render('login', { errorMessage: "Usuário não encontrado" });
            }
        }).catch(error => {
            console.error(error);
            res.status(500).send('Erro no servidor');
        });
});


app.post('/cadastrar', (req, res) => {
    const { usuario, email, senha, confirmSenha } = req.body;

    if (senha !== confirmSenha) {
        return res.render('cadastro', { erro: 'As senhas não coincidem!' });
    }

    User.findOne({ where: { usuario } }).then(usuarioExiste => {
        if (usuarioExiste) {
            return res.render('cadastro', { erro: 'Usuário já existe!' }); 
        }

        User.create({ usuario, email, senha })
            .then(() => {
                res.redirect('/login');
            })
            .catch(error => {
                console.error("Erro ao cadastrar usuário:", error);
                res.status(500).send('Erro ao cadastrar usuário.');
            });
    }).catch(error => {
        console.error("Erro ao verificar existência do usuário:", error);
        res.status(500).send('Erro ao verificar existência do usuário.');
    });
});




app.get('/perfil', (req, res) => {
    const usuario = req.session.usuario;
    const email = req.session.email; 
    res.render('perfil', { usuario, email });
});

app.get('/cadastrotipo', (req, res) => {
    res.render('cadastroTipo');
});

app.get('/cadastroprodutos', (req, res) => {
    TipoProduto.findAll().then(tipoProdutos => {
        res.render('cadastroProdutos', { tipoProdutos });
    });
});

app.get('/cadastro', (req, res) => {
    res.render('cadastro');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get("/servicos", (req, res) => {
    const usuario = req.session.usuario;
    res.render('servicos', { usuario: usuario });
});

app.get("/", (req, res) => {
    const usuario = req.session.usuario;
    const email = req.session.email; 
    res.render('index', { usuario: usuario, email: email });
});


app.listen(8181, function (erro) {
    if (erro) {
        console.log("Erro ao iniciar o servidor");
    } else {
        console.log("Servidor iniciado na porta 8181!");
    }
});
