const express = require("express");
const { cadastrarProduto } = require("../controllers/produtos.controller");

const router = express.Router();

router.post("/", cadastrarProduto);

module.exports = router;
