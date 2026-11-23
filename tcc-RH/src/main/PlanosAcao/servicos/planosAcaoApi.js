/********************************************************************************
 * Objetivo: Arquivo responsável pela comunicação com a API de Planos de Ação
 * Data: 22/11/2026
 ********************************************************************************/

const API = 'http://localhost:8080/v1/senai/avalon';


//----------------- CONFIGURAÇÃO ------------------------------//

const obterConfiguracao = function () {

    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Sessão expirada. Faça login novamente.');
    }

    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    };

};


//----------------- VERIFICAR RESPOSTA -----------------------//

const verificarResposta = async function (resposta) {

    let dados;

    try {
        dados = await resposta.json();
    } catch {
        throw new Error(
            'Não foi possível interpretar a resposta da API.'
        );
    }

    if (resposta.status === 401) {

        localStorage.removeItem('access_token');

        throw new Error(
            'Sua sessão expirou. Faça login novamente.'
        );

    }

    if (!resposta.ok || dados.status === false) {

        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível realizar a operação.'
        );

    }

    return dados;

};


//----------------- LISTAR PLANOS ----------------------------//

const listarPlanosAcao = async function () {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(`${API}/plano_acao`, {
        method: 'GET',
        ...configuracao
    });

    const dados = await verificarResposta(resposta);

    return dados.response?.planos_acao || [];

};


//----------------- BUSCAR PLANO POR ID ---------------------//

const buscarPlanoAcaoPorId = async function (id) {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(`${API}/plano_acao/${id}`, {
        method: 'GET',
        ...configuracao
    });

    const dados = await verificarResposta(resposta);

    return dados.response?.plano_acao || null;

};


//----------------- LISTAR FATORES PSICOSSOCIAIS ------------//

const listarFatoresPsicossociais = async function () {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(
        `${API}/pscicossocialFator`,
        {
            method: 'GET',
            ...configuracao
        }
    );

    const dados = await verificarResposta(resposta);

    const respostaFatores = dados.response || {};

    const fatores =
        respostaFatores.psicossocialFatores ||
        respostaFatores.psicossocial_fatores ||
        respostaFatores.fatores ||
        respostaFatores.psicossocialFator ||
        [];

    // Exibe somente fatores ativos.
    return fatores.filter((fator) => {

        return (
            Number(fator.ativo) === 1 ||
            fator.ativo === true
        );

    });

};


//----------------- CADASTRAR PLANO --------------------------//

const cadastrarPlanoAcao = async function (planoAcao) {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(`${API}/plano_acao`, {
        method: 'POST',
        ...configuracao,
        body: JSON.stringify(planoAcao)
    });

    return await verificarResposta(resposta);

};


//----------------- ATUALIZAR PLANO -------------------------//

const atualizarPlanoAcao = async function (id, planoAcao) {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(`${API}/plano_acao/${id}`, {
        method: 'PUT',
        ...configuracao,
        body: JSON.stringify(planoAcao)
    });

    return await verificarResposta(resposta);

};


//----------------- EXCLUIR PLANO ---------------------------//

const excluirPlanoAcao = async function (id) {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(`${API}/plano_acao/${id}`, {
        method: 'DELETE',
        ...configuracao
    });

    return await verificarResposta(resposta);

};



 //----------------- ENCERRAR PLANO --------------------------//


 //----------------- ENCERRAR PLANO --------------------------//

const encerrarPlanoAcao = async function (id) {

    const configuracao = obterConfiguracao();

    const resposta = await fetch(
        `${API}/plano_acao/encerrar/${id}`,
        {
            method: 'POST',
            ...configuracao,
            body: JSON.stringify({})
        }
    );

    return await verificarResposta(resposta);

};


export {
    listarPlanosAcao,
    buscarPlanoAcaoPorId,
    listarFatoresPsicossociais,
    cadastrarPlanoAcao,
    atualizarPlanoAcao,
    excluirPlanoAcao,
    encerrarPlanoAcao
};
