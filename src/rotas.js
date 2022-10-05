const express = require('express')
const controlador = require('./controladores/constrolador')
const rotas = express()

rotas.get('/contas', controlador.listarcontas)
rotas.post('/contas', controlador.criarConta)
rotas.put('/contas/:numeroconta/usuario', controlador.atualizarConta)
rotas.delete('/contas/:numeroconta', controlador.deletaConta)
rotas.post('/transacoes/depositar', controlador.depositarNaConta)
rotas.post('/transacoes/sacar', controlador.sacarDaConta)
rotas.post('/transacoes/transferir', controlador.transferencia)
rotas.get('/contas/saldo', controlador.saldoBancario)
rotas.get('/contas/extrato', controlador.extrato)

module.exports = rotas