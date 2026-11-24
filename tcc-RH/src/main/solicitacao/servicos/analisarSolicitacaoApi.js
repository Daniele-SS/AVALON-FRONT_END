
/*
 * Objetivo: Atualizar o status de uma solicitação de férias
 *           analisada pelo Gestor.
 * Arquivo: main/solicitacao/servicos/analisarSolicitacaoApi.js
 */

const API = 'http://localhost:8080/v1/senai/avalon';

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

function formatarData(data) {
    if (!data) return '';

    if (
        typeof data === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {
        return data;
    }

    if (typeof data === 'string') {
        const dataISO = data.match(/^(\d{4}-\d{2}-\d{2})T/);

        if (dataISO) {
            return dataISO[1];
        }
    }

    const dataConvertida = new Date(data);

    if (Number.isNaN(dataConvertida.getTime())) {
        throw new Error('Uma das datas das férias é inválida.');
    }

    return dataConvertida.toISOString().slice(0, 10);
}

async function analisarSolicitacao(ferias, novoStatus) {
    if (!ferias?.id) {
        throw new Error('Não foi possível identificar a solicitação.');
    }

    const statusPermitidos = [
        'Aprovado pelo Gestor',
        'Recusado pelo Gestor'
    ];

    if (!statusPermitidos.includes(novoStatus)) {
        throw new Error('Status de análise inválido.');
    }

    const colaborador = Array.isArray(ferias.colaborador)
        ? ferias.colaborador[0] || {}
        : ferias.colaborador || {};

    const idColaborador =
        ferias.id_colaborador ??
        colaborador.id_colaborador ??
        colaborador.id_colaborador_fk ??
        colaborador.id;

    if (!idColaborador || !Number.isFinite(Number(idColaborador))) {
        throw new Error(
            'Não foi possível identificar o colaborador da solicitação.'
        );
    }

    const dados = {
        id_colaborador: Number(idColaborador),
        data_inicio: formatarData(ferias.data_inicio),
        data_fim: formatarData(ferias.data_fim),
        quantidade_dias: Number(ferias.quantidade_dias),
        status: novoStatus,
        observacao: ferias.observacao ?? null
    };

    if (
        !dados.data_inicio ||
        !dados.data_fim ||
        !Number.isFinite(dados.quantidade_dias) ||
        dados.quantidade_dias <= 0
    ) {
        throw new Error(
            'A solicitação não possui todos os dados necessários.'
        );
    }

    let resposta;

    try {
        resposta = await fetch(`${API}/ferias/${ferias.id}`, {
            method: 'PUT',
            headers: obterConfiguracao(),
            body: JSON.stringify(dados)
        });
    } catch {
        throw new Error(
            'Não foi possível conectar com a API de férias.'
        );
    }

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua autenticação expirou. Faça login novamente.');
    }

    let resultado = {};

    try {
        resultado = await resposta.json();
    } catch {
        resultado = {};
    }

    if (!resposta.ok) {
        throw new Error(
            resultado.message ||
            resultado.mensagem ||
            resultado.response?.message ||
            'Não foi possível atualizar a solicitação.'
        );
    }

    return resultado;
}

export default analisarSolicitacao;
