
/********************************************************************************
 * Objetivo: Buscar notificações na API e controlar leitura no frontend.
 * A tabela do banco não possui campo de leitura.
 ********************************************************************************/

const API = 'http://localhost:8080/v1/senai/avalon';

const CHAVE_NOTIFICACOES_LIDAS = 'notificacoes_lidas';


//----------------- CONFIGURAR AUTENTICAÇÃO -----------------//

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


//----------------- BUSCAR NOTIFICAÇÕES ---------------------//

export async function buscarNotificacoes() {
    const resposta = await fetch(`${API}/notificacao`, {
        method: 'GET',
        headers: obterConfiguracao()
    });

    if (resposta.status === 401) {
        localStorage.removeItem('access_token');
        throw new Error('Sua autenticação expirou. Faça login novamente.');
    }

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            dados.message ||
            dados.mensagem ||
            'Não foi possível carregar as notificações.'
        );
    }

    // Compatível com o formato que já funcionava no seu projeto.
    const notificacoes =
        dados.response?.notificacoes ??
        dados.response?.notificacao ??
        dados.notificacoes ??
        dados.notification ??
        dados.notificacao ??
        dados.data?.notificacoes ??
        [];

    if (!Array.isArray(notificacoes)) {
        console.error('Formato inesperado da API de notificações:', dados);
        return [];
    }

    return notificacoes;
}


//----------------- IDENTIFICAR NOTIFICAÇÃO -----------------//

function obterIdNotificacao(notificacao) {
    return notificacao.id_notificacao ?? notificacao.id;
}


function obterChaveNotificacao(notificacao) {
    const id = obterIdNotificacao(notificacao);

    if (id === undefined || id === null) {
        return null;
    }

    return `${id}_${notificacao.tipo_origem || 'geral'}`;
}


//----------------- BUSCAR NOTIFICAÇÕES LIDAS ----------------//

export function buscarNotificacoesLidas() {
    try {
        const dados = localStorage.getItem(
            CHAVE_NOTIFICACOES_LIDAS
        );

        const notificacoes = JSON.parse(dados || '[]');

        return Array.isArray(notificacoes)
            ? notificacoes
            : [];
    } catch (erro) {
        console.error('Erro ao buscar notificações lidas:', erro);
        return [];
    }
}


//----------------- VERIFICAR SE FOI LIDA -------------------//

export function verificarNotificacaoLida(notificacao) {
    const chave = obterChaveNotificacao(notificacao);

    if (!chave) return false;

    return buscarNotificacoesLidas().includes(chave);
}


//----------------- MARCAR NOTIFICAÇÃO COMO LIDA ------------//

export async function marcarNotificacaoComoLida(notificacao) {
    const chave = obterChaveNotificacao(notificacao);

    if (!chave) return;

    const notificacoesLidas = buscarNotificacoesLidas();

    if (!notificacoesLidas.includes(chave)) {
        notificacoesLidas.push(chave);

        localStorage.setItem(
            CHAVE_NOTIFICACOES_LIDAS,
            JSON.stringify(notificacoesLidas)
        );
    }

    // Não envia PUT: o banco não possui coluna de leitura.
    return true;
}
