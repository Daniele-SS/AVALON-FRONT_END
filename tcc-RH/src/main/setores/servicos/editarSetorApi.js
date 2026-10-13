//----------------- API DOS SETORES -------------------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- BUSCAR SETORES --------------------------//

async function buscarDadosCadastro() {

    const resposta = await fetch(`${API}/setor`);

    if (!resposta.ok) {
        throw new Error('Erro ao carregar setores.');
    }

    const resultado = await resposta.json();

    return resultado.response?.setor || [];

}


//----------------- CADASTRAR SETOR -------------------------//

async function cadastrarSetor(dadosSetor) {

    const resposta = await fetch(`${API}/setor`, {

        method: 'POST',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify(dadosSetor)

    });

    const resultado = await resposta.json();

    if (!resposta.ok || Number(resultado.status_code) >= 400) {

        throw new Error(
            resultado.message ||
            resultado.mensagem ||
            'Não foi possível cadastrar o setor.'
        );

    }

    return resultado;

}


//----------------- ATUALIZAR SETOR -------------------------//

async function atualizarSetor(id, dadosSetor) {

    const resposta = await fetch(`${API}/setor/${id}`, {

        method: 'PUT',

        headers: {
            'Content-Type': 'application/json'
        },

        body: JSON.stringify(dadosSetor)

    });

    const resultado = await resposta.json();

    if (!resposta.ok || Number(resultado.status_code) >= 400) {

        throw new Error(
            resultado.message ||
            resultado.mensagem ||
            'Não foi possível atualizar o setor.'
        );

    }

    return resultado;

}


//----------------- EXPORTAÇÃO ------------------------------//

export {
    buscarDadosCadastro,
    cadastrarSetor,
    atualizarSetor
};