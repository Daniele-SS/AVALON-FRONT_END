
/********************************************************************************
 * Objetivo: Buscar os dados utilizados no Dashboard.
 ********************************************************************************/

const API = 'http://localhost:8080/v1/senai/avalon';

//----------------- CONFIGURAÇÃO -----------------//

function obterConfiguracao() {
    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}

//----------------- BUSCAR ENDPOINT -----------------//

async function buscarEndpoint(endpoint, configuracao) {
    const resposta = await fetch(`${API}${endpoint}`, {
        method: 'GET',
        headers: configuracao
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua sessão expirou. Faça login novamente.');
    }

    if (!resposta.ok) {
        console.error(
            `Erro ao buscar ${endpoint}:`,
            resposta.status
        );

        return {};
    }

    return await resposta.json();
}

//----------------- BUSCAR DADOS -----------------//

async function buscarDadosDashboard() {
    const configuracao = obterConfiguracao();

    const [
        dadosColaboradores,
        dadosSetores,
        dadosAvaliacoes,
        dadosParticipacoes,
        dadosAvaliacoesSetores,
        dadosFerias,
        dadosPlanosAcao,
        dadosResultados
    ] = await Promise.all([
        buscarEndpoint('/colaborador', configuracao),
        buscarEndpoint('/setor', configuracao),
        buscarEndpoint('/avaliacao', configuracao),
        buscarEndpoint('/avaliacao_participacao', configuracao),
        buscarEndpoint('/avaliacao_setor', configuracao),
        buscarEndpoint('/ferias', configuracao),
        buscarEndpoint('/plano_acao', configuracao),
        buscarEndpoint('/avaliacao_resultado', configuracao)
    ]);

    return {
        colaboradores:
            dadosColaboradores.response?.colaborador ??
            dadosColaboradores.colaborador ??
            [],

        setores:
            dadosSetores.response?.setor ??
            dadosSetores.setor ??
            [],

        avaliacoes:
            dadosAvaliacoes.response?.avaliacoes ??
            dadosAvaliacoes.avaliacoes ??
            [],

        participacoes:
            dadosParticipacoes.response?.participacoes ??
            dadosParticipacoes.participacoes ??
            [],

        avaliacoesSetores:
            dadosAvaliacoesSetores.response?.avaliacao_setor ??
            dadosAvaliacoesSetores.avaliacao_setor ??
            [],

        ferias:
            dadosFerias.response?.ferias ??
            dadosFerias.ferias ??
            [],

        planosAcao:
            dadosPlanosAcao.response?.planos_acao ??
            dadosPlanosAcao.response?.plano_acao ??
            dadosPlanosAcao.planos_acao ??
            dadosPlanosAcao.plano_acao ??
            [],

        resultados:
            dadosResultados.response?.resultados ??
            dadosResultados.resultados ??
            []
    };
}

export default buscarDadosDashboard;
