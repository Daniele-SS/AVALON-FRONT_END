
/*
 * Objetivo: Buscar as solicitações de férias que estão pendentes
 *           de análise pelo Gestor.
 * Arquivo: main/solicitacao/servicos/solicitacaoApi.js
 */

const API = 'http://localhost:8080/v1/senai/avalon';

async function buscarSolicitacoes() {
    const token = localStorage.getItem('access_token');

    if (!token) {
        throw new Error('Token não encontrado. Faça login novamente.');
    }

    let resposta;

    try {
        resposta = await fetch(`${API}/ferias`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (erro) {
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
            'Não foi possível carregar as solicitações.'
        );
    }

    const ferias = resultado.response?.ferias || [];

    // A API já aplica o escopo do Gestor.
    // Aqui mostramos apenas solicitações aguardando análise.
    return ferias.filter(
        item => item.status === 'Pendente'
    );
}

export default buscarSolicitacoes;
