const express = require("express");
const { Client } = require("pg");
const cors = require("cors");
const bodyparser = require("body-parser");
const config = require("./config");

const app = express();
app.use(express.json());
app.use(cors());
app.use(bodyparser.json());

var conString = config.urlConnection;
var client = new Client(conString);
client.connect(function (err) {
    if (err) {
        return console.error("não foi possível conectar ao banco.", err);
    }
    client.query("SELECT NOW()", function (err, result) {
        if (err) {
            return console.error("Erro ao executar a query.", err);
        }
        console.log(result.rows[0]);
    });
});

app.get("/", (req, res) => {
    console.log("response ok.");
    res.send("OK - Servidor da Ujobs disponível.");
});

app.get("/freelancers", (req, res) => {
    try {
        client.query("SELECT * FROM Freelancers", function (err, result) {
            if (err) {
                return console.error("Erro ao executar a query de SELECT", err);
            }
            res.send(result.rows);
        });
    } catch (error) {
        console.log(error);
    }
});

app.get("/freelancers/:id", (req, res) => {
    try {
        console.log("Chamou /:id " + req.params.id);
        client.query(
            "SELECT * FROM Freelancers WHERE id = $1",
            [req.params.id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de SELECT id", err);
                }
                res.send(result.rows);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.delete("/freelancers/:id", (req, res) => {
    try {
        console.log("Chamou delete /:id " + req.params.id);
        const id = req.params.id;
        client.query(
            "DELETE FROM Freelancers WHERE id = $1",
            [id],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de DELETE", err);
                } else {
                    if (result.rowCount == 0) {
                        res.status(400).json({ info: "Registro não encontrado." });
                    } else {
                        res.status(200).json({ info: `Registro excluído. Código: ${id}` });
                    }
                }
                console.log(result);
            }
        );
    } catch (error) {
        console.log(error);
    }
});

app.post("/freelancers", (req, res) => {
    try {
        console.log("Chamou post", req.body);
        const { nome, email, senha, profissao, cidade, preco, descricao} = req.body;
        client.query(
            "INSERT INTO Freelancers (nome, email, senha, profissao, cidade, preco, descricao) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING * ",
            [nome, email, senha, profissao, cidade, preco, descricao],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de INSERT", err);
                }
                const { id } = result.rows[0];
                res.setHeader("id", `${id}`);
                res.status(201).json(result.rows[0]);
                console.log(result);
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.put("/freelancers/:id", (req, res) => {
    try {
        console.log("Chamou update", req.body);
        const id = req.params.id;
        const { nome, email, senha, profissao, cidade, preco, descricao} = req.body;
        client.query(
            "UPDATE Freelancers SET nome=$1, email=$2, senha$3, profissao$4, cidade$5, preco$6, descricao$7 WHERE id =$8 ",
            [nome, email, id, senha, profissao, cidade, preco, descricao],
            function (err, result) {
                if (err) {
                    return console.error("Erro ao executar a qry de UPDATE", err);
                } else {
                    res.setHeader("id", id);
                    res.status(202).json({ id: id });
                    console.log(result);
                }
            }
        );
    } catch (erro) {
        console.error(erro);
    }
});

app.listen(config.port, () =>
    console.log("Servidor funcionando na porta " + config.port)
);

module.exports=app;
