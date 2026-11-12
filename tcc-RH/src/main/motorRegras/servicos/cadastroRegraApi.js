//----------------- API DE CADASTRO DE REGRAS -----------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO -------------------//

function obterConfiguracao() {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };

}


//----------------- VERIFICAR RESPOSTA ------------------------//

async function verificarResposta(resposta, mensagemErro) {

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }

    const dados = await resposta.json();

    if (!resposta.ok || dados.status === false) {

        throw new Error(
            dados.message || mensagemErro
        );

    }

    return dados;

}


//----------------- CADASTRAR REGRA ---------------------------//

async function cadastrarRegra(dadosRegra) {

    const corpoRequisicao = {

        id_psicossocial_fator: dadosRegra.id_psicossocial_fator,

        operador: dadosRegra.operador,

        valor_referencial: dadosRegra.valor_referencial,

        classificacao: dadosRegra.classificacao,

        acao: dadosRegra.acao,

        ativo: dadosRegra.ativo ?? 1

    };

    const resposta = await fetch(
        `${API}/motor_regras`,
        {
            method: 'POST',

            headers: obterConfiguracao(),

            body: JSON.stringify(corpoRequisicao)
        }
    );

    return await verificarResposta(
        resposta,
        'Não foi possível cadastrar a regra.'
    );

}


//----------------- EXPORTAÇÃO --------------------------------//

export default cadastrarRegra;