let { contas, numeroConta, depositos, saques, transferencias } = require('../bancodedados')
let bancodedados = require('../bancodedados')

const listarcontas = (req, res) => {
    const { senha_banco } = req.query

    if (!senha_banco) return res.status(400).json({ mensagem: 'senha obrigatória' })
    if (senha_banco !== bancodedados.banco.senha) return res.status(403).json({ mensagem: 'senha inválida' })

    return res.status(200).json(bancodedados.contas)
}

const criarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (nome && cpf && data_nascimento && telefone && email && senha) {
    } else return res.status(400).json('todos os dados devem ser preenchidos')

    const bodyCpf = contas.find((conta) => conta.usuario.cpf === cpf)
    const bodyEmail = contas.find((conta) => conta.usuario.email === email)

    if (bodyCpf) return res.status(404).json('cpf já cadastrado')
    if (bodyEmail) return res.status(404).json('email já cadastrado')

    contas.push({
        numero: numeroConta++,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    })

    return res.status(204).send()

}

const atualizarConta = (req, res) => {
    const { numeroconta } = req.params
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (nome && cpf && data_nascimento && telefone && email && senha) {
    } else return res.status(400).json('todos os dados devem ser preenchidos')

    if (!numeroconta) return res.status(400).json('numero da conta deve ser informado')

    let conta = contas.find((conta) => conta.numero === numeroconta)

    const bodyCpf = contas.find((conta) => conta.usuario.cpf === cpf)
    const bodyEmail = contas.find((conta) => conta.usuario.email === email)

    if (bodyCpf) return res.status(404).json('cpf já cadastrado')
    if (bodyEmail) return res.status(404).json('email já cadastrado')

    conta.usuario.nome = nome
    conta.usuario.cpf = cpf
    conta.usuario.data_nascimento = data_nascimento
    conta.usuario.telefone = telefone
    conta.usuario.email = email
    conta.usuario.senha = senha

    return res.status(201).send()
}

const deletaConta = (req, res) => {
    const { numeroconta } = req.params

    if (!numeroconta) return res.status(400).json('numero da conta deve ser informado')

    const conta = contas.find((conta) => conta.numero === numeroconta)

    if (conta.saldo >= 1) return res.status(403).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" })

    contas.splice(conta, 1)

    return res.status(200).send()
}

const depositarNaConta = (req, res) => {
    const { numero_conta, valor } = req.body

    if (!numero_conta) return res.status(400).json('numero da conta deve ser informado')
    if (!valor && valor <= 0) return res.status(400).json('valor deve ser informado, e não pode ser zerado ou negativo')

    const conta = contas.find((conta) => conta.numero === numero_conta)

    conta.saldo = conta.saldo + Number(valor)

    depositos.push({
        data: new Date(),
        numero_conta,
        valor
    })

    return res.json()

}

const sacarDaConta = (req, res) => {
    const { numero_conta, senha, valor } = req.body

    if (!numero_conta && !senha && !valor) return res.status(400).json('todos os campos são obrigatorios')

    const conta = contas.find((conta) => conta.numero === numero_conta)

    if (conta.usuario.senha !== senha) return res.status(403).json('senha inválida')

    if (conta.saldo < Number(valor) && conta.saldo === 0) return res.status(400).json('valor maior que saldo')

    conta.saldo = conta.saldo - valor

    saques.push({
        data: new Date().toDateString,
        numero_conta,
        valor
    })

    return res.status(201).json()
}

const transferencia = (req, res) => {
    let { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!numero_conta_origem && !numero_conta_destino && !valor && !senha) return res.status(401).json('todos os campos devem ser informados')

    let contaDeOrigem = contas.find((conta) => conta.numero === numero_conta_origem)
    let contaDeDestino = contas.find((conta) => conta.numero === numero_conta_destino)

    if (!contaDeOrigem) return res.status(404).json('conta de origem não existe')
    if (!contaDeDestino) return res.status(404).json('conta de destino não existe')

    if (contaDeOrigem.usuario.senha !== senha) return res.status(403).json('senha inválida')

    if (contaDeOrigem.saldo < Number(valor) && contaDeOrigem === 0) return res.status(400).json('valor maior que saldo')

    contas[contaDeOrigem.numero - 1].saldo -= valor
    contas[contaDeDestino.numero - 1].saldo += valor

    bancodedados.transferencias.push({
        data: new Date().toDateString,
        numero_conta_origem,
        numero_conta_destino,
        valor
    })
    console.log(transferencias)
    return res.status(201).json()

}

const saldoBancario = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta && !senha && !valor) return res.status(400).json('todos os campos são obrigatorios')

    const conta = contas.find((conta) => conta.numero === numero_conta)

    if (!conta) return res.status(404).json("conta não existe")
    if (conta.usuario.senha !== senha) return res.status(403).json('senha inválida')

    return res.status(200).json({ saldo: `${conta.saldo}` })
}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta && !senha && !valor) return res.status(400).json('todos os campos são obrigatorios')

    const conta = contas.find((conta) => conta.numero === numero_conta)

    if (!conta) return res.status(404).json("conta não existe")
    if (conta.usuario.senha !== senha) return res.status(403).json('senha inválida')


    const deposito = depositos.filter((deposito) => {
        return deposito.numero_conta === numero_conta
    })
    const transferencia = transferencias.filter((transferencia) => {
        return transferencia.numero_conta_origem === numero_conta
    })
    const retiradas = saques.filter((saque) => {
        return saque.numero_conta === numero_conta
    })

    const extrato = {
        deposito
        ,
        transferencia
        ,
        retiradas
    }

    return res.status(200).json(extrato)
}

module.exports = {
    listarcontas,
    criarConta,
    atualizarConta,
    deletaConta,
    depositarNaConta,
    sacarDaConta,
    transferencia,
    saldoBancario,
    extrato
}