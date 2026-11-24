
 //----------------- API DO MOTOR DE REGRAS -----------------//

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAR AUTENTICAÇÃO -----------------//

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


//----------------- VERIFICAR RESPOSTA ----------------------//

async function verificarResposta(resposta, mensagemErro) {

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }

    const dados = await resposta.json().catch(() => ({}));

    if (!resposta.ok || dados.status === false) {

        throw new Error(
            dados.message ||
            dados.mensagem ||
            mensagemErro
        );

    }

    return dados;

}


//----------------- BUSCAR REGRAS ---------------------------//

async function buscarDadosMotorRegras() {

    const resposta = await fetch(
        `${API}/motor_regras`,
        {
            headers: obterConfiguracao()
        }
    );


    //----------------- VERIFICAR AUTENTICAÇÃO ----------------//

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua autenticação expirou. Faça login novamente.'
        );

    }


    //----------------- TRATAR MOTOR DE REGRAS VAZIO -----------//

    // Quando não existem regras cadastradas, a API pode
    // retornar 404. Para o cadastro de avaliação, isso
    // significa que não há regras disponíveis para selecionar.

    if (resposta.status === 404) {

        console.log(
            'Nenhuma regra cadastrada no Motor de Regras.'
        );

        return [];

    }


    //----------------- VERIFICAR OUTROS ERROS ----------------//

    const dados = await verificarResposta(
        resposta,
        'Não foi possível carregar as regras do motor.'
    );


    //----------------- ORGANIZAR REGRAS ----------------------//

    const regras =
        dados.response?.motorRegras ??
        dados.motorRegras ??
        [];


    //----------------- CONFERIR DADOS ------------------------//

    console.log('Regras carregadas:', regras);


    //----------------- RETORNAR REGRAS -----------------------//

    return regras;

}


//----------------- ALTERAR STATUS DA REGRA -----------------//

export async function alterarStatusRegra(id, ativo, regra) {

    const corpoRequisicao = {

        id_psicossocial_fator:
            regra.fator_psicossocial?.psicossocialFator?.id,

        operador: regra.operador,

        valor_referencial: regra.valor_referencial,

        classificacao: regra.classificacao,

        acao: regra.acao,

        ativo: ativo ? 1 : 0

    };

    const resposta = await fetch(
        `${API}/motor_regras/${id}`,
        {
            method: 'PUT',

            headers: obterConfiguracao(),

            body: JSON.stringify(corpoRequisicao)
        }
    );

    return await verificarResposta(
        resposta,
        'Não foi possível alterar o status da regra.'
    );

}


//----------------- EXCLUIR REGRA ---------------------------//

export async function excluirRegra(id) {

    const resposta = await fetch(
        `${API}/motor_regras/${id}`,
        {
            method: 'DELETE',

            headers: obterConfiguracao()
        }
    );

    return await verificarResposta(
        resposta,
        'Não foi possível excluir a regra.'
    );

}


//----------------- EXPORTAÇÃO ------------------------------//

export default buscarDadosMotorRegras;
